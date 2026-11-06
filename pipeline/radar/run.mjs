// Storefront Radar daily pipeline.
// Pulls new business filings from every configured open-data source, scores them
// with the same rules as the Radar app, tracks which leads are new since the last
// run, and writes ready-to-use files to data/radar/.
//
// Usage: node pipeline/radar/run.mjs
// Env:   SOCRATA_APP_TOKEN (optional, raises rate limits)
//        RADAR_MOCK=1      (offline test with generated rows)
//        TZ                (sets "today"; the workflow uses America/New_York)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadRadarCore } from "./core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");
const OUT = join(ROOT, "data", "radar");
const R = loadRadarCore();

const config = JSON.parse(readFileSync(join(here, "config.json"), "utf8"));
const sender = Object.assign({}, config.sender || {});
R.S.settings.appToken = process.env.SOCRATA_APP_TOKEN || "";
Object.assign(R.S.settings, sender, { offer: sender.offer || R.DEFAULT_OFFER });

const today = R.todayISO();
const since = R.addDays(today, -Math.max(1, config.lookbackDays || 7));
const MOCK = process.env.RADAR_MOCK === "1";

/* ---------- Do-not-contact list ---------- */
const dncLines = existsSync(join(here, "do-not-contact.txt"))
  ? readFileSync(join(here, "do-not-contact.txt"), "utf8").split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter((s) => s && !s.startsWith("#"))
  : [];
const dnc = new Set(dncLines);
const isDnc = (l) => (l.email && dnc.has(l.email.toLowerCase())) || dnc.has(String(l.name || "").toLowerCase());

/* ---------- Fetching ---------- */
function expectedFields(src) {
  const f = [src.dateField, src.nameField, src.dbaField, src.cityField, src.zipField, src.phoneField, src.emailField]
    .concat(Array.isArray(src.addressField) ? src.addressField : [src.addressField])
    .concat(src.categoryFields || []);
  return [...new Set(f.filter(Boolean))];
}

function mockRows(src, n) {
  const names = ["Golden Spoon Cafe", "Blue Door Barbershop", "Hops And Barley Taproom", "Luna Nail Studio", "Corner Taqueria", "Iron Works Fitness", "Starbucks Coffee #4821", "Maple Street Bakery", "Northside Auto Care", "Velvet Lounge", "Brightpath Consulting LLC", "Sunrise Market"];
  const cats = ["Restaurant", "Barber Shop", "Brewery", "Nail Salon", "Retail Food Establishment", "Gym", "Coffee Shop", "Bakery", "Motor Vehicle Repair", "Bar", "Management Consulting", "Grocery"];
  const rows = [];
  for (let i = 0; i < n; i++) {
    const r = {};
    const d = R.addDays(today, -(i % 7));
    r[src.dateField] = src.dateFormat === "yyyymmdd" ? d.replace(/-/g, "") : d + "T00:00:00.000";
    if (src.dbaField) r[src.dbaField] = names[i % names.length];
    if (src.nameField) r[src.nameField] = (src.dbaField ? "Owner " + i + " LLC" : names[i % names.length]);
    const addr = (100 + i * 7) + " Main St" + (i % 3 === 0 ? " Ste " + (i + 1) : "");
    if (Array.isArray(src.addressField)) { r[src.addressField[0]] = String(100 + i * 7); r[src.addressField[1]] = "Main St"; }
    else if (src.addressField) r[src.addressField] = addr;
    if (src.cityField) r[src.cityField] = src.defaultCity || "Testville";
    if (src.zipField) r[src.zipField] = "1000" + (i % 10);
    (src.categoryFields || []).forEach((f) => { r[f] = cats[i % cats.length]; });
    if (src.phoneField) r[src.phoneField] = "555-010-" + String(1000 + i).slice(-4);
    if (src.emailField && i % 2 === 0) r[src.emailField] = "owner" + i + "@example.com";
    rows.push(r);
  }
  return rows;
}

async function fetchSource(src) {
  const health = { id: src.id, label: src.label, state: src.state, ok: false, rows: 0, pages: 0, ms: 0, status: 0, error: "", missingFields: [], hasEmail: !!src.emailField, hasPhone: !!src.phoneField };
  const t0 = Date.now();
  const cap = config.maxRowsPerSource || 3000;
  const pageSize = Math.min(1000, cap);
  const where = R.buildWhere(src, since, today);
  const rows = [];
  try {
    if (MOCK) {
      rows.push(...mockRows(src, 12));
      health.pages = 1; health.status = 200;
    } else {
      for (let offset = 0; offset < cap; offset += pageSize) {
        const url = R.buildUrl(src, where, offset, Math.min(pageSize, cap - offset));
        let res, body;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "storefront-radar-pipeline" }, signal: AbortSignal.timeout(45000) });
            if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
            break;
          } catch (e) {
            if (attempt === 2) throw e;
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          }
        }
        health.status = res.status;
        try { body = await res.json(); } catch (e) { body = null; }
        if (!res.ok || !Array.isArray(body)) {
          const msg = body && (body.message || body.errorCode) ? String(body.message || body.errorCode).slice(0, 240) : "";
          throw new Error("HTTP " + res.status + (msg ? ": " + msg : ""));
        }
        health.pages++;
        rows.push(...body);
        if (body.length < pageSize) break;
      }
    }
    health.ok = true;
    health.rows = rows.length;
    if (!MOCK) {
      // Newest date in the whole dataset tells us whether a quiet source is stale or our filter is wrong.
      try {
        const u = "https://" + src.domain + "/resource/" + src.dataset + ".json?$select=" + encodeURIComponent("max(" + src.dateField + ") as latest") + (src.baseWhere ? "&$where=" + encodeURIComponent(src.baseWhere) : "") + (R.S.settings.appToken ? "&$$app_token=" + encodeURIComponent(R.S.settings.appToken) : "");
        const res = await fetch(u, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(45000) });
        const b = await res.json();
        health.latestDate = Array.isArray(b) && b[0] ? String(b[0].latest || "").slice(0, 10) : "";
        if (!res.ok) health.latestDate = "error " + res.status;
      } catch (e) { health.latestDate = "unknown"; }
    }
    if (rows.length) {
      const seenKeys = new Set();
      rows.slice(0, 200).forEach((r) => Object.keys(r).forEach((k) => seenKeys.add(k)));
      // A field that never appears in 200 rows is either renamed or always empty.
      health.missingFields = expectedFields(src).filter((f) => !seenKeys.has(f));
      if (health.missingFields.length) health.columnsSeen = [...seenKeys].sort();
    } else if (!MOCK) {
      try {
        const u = "https://" + src.domain + "/resource/" + src.dataset + ".json?$limit=1&$order=" + encodeURIComponent(src.dateField + " DESC");
        const res = await fetch(u, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(45000) });
        const b = await res.json();
        if (Array.isArray(b) && b[0]) health.columnsSeen = Object.keys(b[0]).sort();
      } catch (e) {}
    }
  } catch (e) {
    health.error = String(e && e.message ? e.message : e);
  }
  health.ms = Date.now() - t0;
  return { health, rows };
}

/* ---------- Filtering ---------- */
const terr = config.territory || {};
const states = new Set((terr.states || []).map((s) => s.toUpperCase()));
const cities = new Set((terr.cities || []).map((s) => s.toLowerCase()));
const zipPrefixes = (terr.zipPrefixes || []).map(String);
const industries = new Set(config.industries || []);
function inTerritory(l) {
  if (states.size && !states.has(String(l.state || "").toUpperCase())) return false;
  if (cities.size && !cities.has(String(l.city || "").toLowerCase())) return false;
  if (zipPrefixes.length && !zipPrefixes.some((p) => String(l.zip || "").startsWith(p))) return false;
  return true;
}
function inIndustry(l) {
  if (l.cls === "other") return !!config.includeUnclassified;
  return industries.has(l.cls);
}

/* ---------- Outreach text ---------- */
// "Serve & Sip Cafe L.L.C." reads better as "Serve & Sip Cafe" in an email.
function friendlyName(name) {
  let n = String(name || "").trim();
  for (let i = 0; i < 2; i++) n = n.replace(/[,\s]+(l\.?\s?l\.?\s?c\.?|inc\.?|incorporated|corp\.?|corporation|co\.|company|ltd\.?|l\.?l\.?p\.?|p\.?l\.?l\.?c\.?|lp)\s*$/i, "").trim();
  return n || String(name || "");
}
function fill(text, l) {
  const s = R.S.settings;
  const opened = l.date ? (l.date > today ? "opening " + R.fmtDate(l.date, { month: "long", day: "numeric" }) : R.fmtDate(l.date, { month: "long", day: "numeric" })) : "recently";
  const v = {
    business: friendlyName(l.name), city: l.city || "your city", state: l.state, category: R.categoryNoun(l), opened,
    my_name: s.my_name || "[your name]", my_company: s.my_company || "[your company]", my_phone: s.my_phone || "[your phone]",
    my_email: s.my_email || "[your email]", my_address: s.my_address || "[your mailing address]", offer: s.offer || R.DEFAULT_OFFER
  };
  return String(text || "").replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
}
const tplKey = config.emailTemplate && R.DEFAULT_TEMPLATES[config.emailTemplate] ? config.emailTemplate : "seq1";
const TPL = R.DEFAULT_TEMPLATES[tplKey];

/* ---------- CSV ---------- */
const cell = (v) => { const s = String(v == null ? "" : v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCsv = (head, rows) => [head].concat(rows).map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
const mapsUrl = (l) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([l.name, l.address, l.city, l.state].filter(Boolean).join(", "));
const searchUrl = (l) => "https://www.google.com/search?q=" + encodeURIComponent([l.name, l.city, l.state].filter(Boolean).join(" "));

/* ---------- Main ---------- */
async function main() {
  mkdirSync(join(OUT, "archive"), { recursive: true });
  const wanted = config.sources === "all" || !Array.isArray(config.sources) ? R.SOURCES : R.SOURCES.filter((s) => config.sources.includes(s.id));
  const results = [];
  // A few at a time keeps us polite to the portals.
  for (let i = 0; i < wanted.length; i += 4) {
    results.push(...(await Promise.all(wanted.slice(i, i + 4).map(fetchSource))));
  }
  const health = results.map((r) => r.health);
  const srcById = Object.fromEntries(wanted.map((s) => [s.id, s]));
  let leads = [];
  for (const r of results) {
    const src = srcById[r.health.id];
    for (const row of r.rows) {
      for (const k of Object.keys(row)) if (typeof row[k] === "string") row[k] = row[k].replace(/\uFFFD/g, "'");
      const l = R.normalizeRow(row, src);
      if (l) leads.push(l);
    }
  }
  leads = R.dedupe(leads);
  const totalScored = leads.length;
  const numberedChain = (l) => l.why.some((w) => w.k === "Independent owner" && w.pts < 15);
  leads = leads.filter((l) => inTerritory(l) && inIndustry(l) && !l.chain && !numberedChain(l));

  // New-since-last-run tracking.
  const seenPath = join(OUT, "seen.json");
  const seen = existsSync(seenPath) ? JSON.parse(readFileSync(seenPath, "utf8")) : {};
  for (const l of leads) {
    l.isNew = !seen[l.id];
    l.firstSeen = seen[l.id] || today;
    seen[l.id] = l.firstSeen;
  }
  const cutoff = R.addDays(today, -120);
  for (const k of Object.keys(seen)) if (seen[k] < cutoff) delete seen[k];

  leads.sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)));
  const qualified = leads.filter((l) => l.score >= (config.minScore || 0));
  const emailable = qualified.filter((l) => l.email && !isDnc(l));

  const head = ["score", "band", "new_today", "business", "legal_name", "industry", "category", "address", "city", "state", "zip", "filed", "first_seen", "source", "kind", "phone", "email", "google_maps", "google_search", "why"];
  const rowOf = (l) => [l.score, R.band(l.score), l.isNew ? "yes" : "", l.name, l.legal, R.presetOf(l.cls).label, l.category, l.address, l.city, l.state, l.zip, l.date, l.firstSeen, (l.sources || []).join("; "), l.kind, l.phone, isDnc(l) ? "" : l.email, mapsUrl(l), searchUrl(l), l.why.map((w) => w.k + " " + w.pts + "/" + w.max + " (" + w.note + ")").join("; ")];
  writeFileSync(join(OUT, "leads.csv"), toCsv(head, qualified.map(rowOf)));
  writeFileSync(join(OUT, "archive", "leads-" + today + ".csv"), toCsv(head, qualified.filter((l) => l.isNew).map(rowOf)));

  const oHead = ["email", "business", "first_name", "city", "state", "industry", "score", "new_today", "subject", "body"];
  writeFileSync(join(OUT, "outreach-ready.csv"), toCsv(oHead, emailable.map((l) => [l.email, friendlyName(l.name), "", l.city, l.state, R.presetOf(l.cls).label, l.score, l.isNew ? "yes" : "", fill(TPL.subject, l), fill(TPL.body, l)])));

  writeFileSync(join(OUT, "leads.json"), JSON.stringify({
    generated: new Date().toISOString(), today, since, mock: MOCK,
    leads: qualified.map((l) => ({ id: l.id, score: l.score, band: R.band(l.score), isNew: l.isNew, firstSeen: l.firstSeen, name: l.name, legal: l.legal, industry: R.presetOf(l.cls).label, category: l.category, address: l.address, city: l.city, state: l.state, zip: l.zip, filed: l.date, phone: l.phone, email: isDnc(l) ? "" : l.email, sources: l.sources, kind: l.kind, why: l.why }))
  }, null, 1));
  writeFileSync(join(OUT, "source-health.json"), JSON.stringify({ generated: new Date().toISOString(), today, since, mock: MOCK, sources: health }, null, 1));
  writeFileSync(seenPath, JSON.stringify(seen));

  // Digest for the daily GitHub issue (GitHub emails it to you).
  const newQ = qualified.filter((l) => l.isNew);
  const top = newQ.slice(0, config.digestTopN || 40);
  const okSources = health.filter((h) => h.ok);
  const lines = [];
  lines.push("**" + newQ.length + " new qualified leads** (score " + (config.minScore || 0) + "+) from filings dated " + since + " to " + today + ". " + emailable.filter((l) => l.isNew).length + " new ones have an email address and are ready in `outreach-ready.csv`.");
  lines.push("");
  if (MOCK) lines.push("> This run used generated test data, not live portals.\n");
  if (!sender.my_name || !sender.my_address) lines.push("> Outreach text still has placeholders. Fill in `sender` in `pipeline/radar/config.json` (your name, company, phone, and mailing address, which the CAN-SPAM Act requires in every email).\n");
  const byMetro = {};
  for (const l of top) { const k = (l.city || "Unknown city") + ", " + (l.state || "?"); (byMetro[k] = byMetro[k] || []).push(l); }
  for (const metro of Object.keys(byMetro).sort((a, b) => byMetro[b].length - byMetro[a].length)) {
    lines.push("### " + metro);
    lines.push("| Score | Business | Industry | Filed | Contact |");
    lines.push("|---:|---|---|---|---|");
    for (const l of byMetro[metro]) {
      const contact = [l.email && !isDnc(l) ? "email" : "", l.phone ? "phone" : ""].filter(Boolean).join(", ") || "look up";
      lines.push("| " + l.score + " | [" + l.name.replace(/\|/g, "/") + "](" + mapsUrl(l) + ") | " + R.presetOf(l.cls).label + " | " + (l.date || "") + " | " + contact + " |");
    }
    lines.push("");
  }
  if (newQ.length > top.length) lines.push("Plus " + (newQ.length - top.length) + " more in `data/radar/leads.csv`.\n");
  lines.push("<details><summary>Source health: " + okSources.length + " of " + health.length + " sources responded</summary>\n");
  lines.push("| Source | Status | Rows | Newest filing | Notes |");
  lines.push("|---|---|---:|---|---|");
  for (const h of health) lines.push("| " + h.label + " | " + (h.ok ? "OK" : "FAILED") + " | " + h.rows + " | " + (h.latestDate || "") + " | " + (h.error || (h.missingFields.length ? "Fields not seen: " + h.missingFields.join(", ") : "")) + " |");
  lines.push("\n</details>");
  writeFileSync(join(OUT, "digest.md"), lines.join("\n") + "\n");

  console.log(JSON.stringify({ today, since, scored: totalScored, qualified: qualified.length, newQualified: newQ.length, emailable: emailable.length, sourcesOk: okSources.length, sourcesTotal: health.length }));
  for (const h of health) console.log((h.ok ? "OK    " : "FAIL  ") + h.label.padEnd(42) + String(h.rows).padStart(6) + " rows  latest " + (h.latestDate || "?") + "  " + (h.error || (h.missingFields.length ? "missing: " + h.missingFields.join(",") : "")));
}

main().catch((e) => { console.error(e); process.exit(1); });
