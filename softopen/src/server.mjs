// Softopen HTTP API. Zero dependencies. node src/server.mjs
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, todayISO } from "./db.mjs";
import { openapi } from "./openapi.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8402);
const FIXED_BASE = (process.env.SOFTOPEN_BASE_URL || "").replace(/\/$/, "");
const baseOf = (req) => FIXED_BASE || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || `localhost:${PORT}`}`;
const ADMIN_TOKEN = process.env.SOFTOPEN_ADMIN_TOKEN || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const TOPUP_URL = process.env.SOFTOPEN_TOPUP_URL || "";
const RATE_PER_MIN = Number(process.env.SOFTOPEN_RATE_PER_MIN || 120);
const CONTACT_URL = process.env.SOFTOPEN_CONTACT_URL || "https://nishulegacy.gumroad.com";

export function createApp(db) {
  const rate = new Map(); // key_id -> {minute, n}

  const json = (res, status, body, headers = {}) => {
    const s = JSON.stringify(body, null, 2);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(s), "access-control-allow-origin": "*", ...headers });
    res.end(s);
  };
  const text = (res, status, body, type = "text/plain; charset=utf-8") => {
    res.writeHead(status, { "content-type": type, "content-length": Buffer.byteLength(body), "access-control-allow-origin": "*" });
    res.end(body);
  };
  const readBody = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => { size += c.length; if (size > 1_000_000) { reject(new Error("body too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
  const parseJson = (buf) => { if (!buf.length) return {}; try { return JSON.parse(buf.toString("utf8")); } catch { return null; } };

  const howToPay = (base, key) => ({
    get_a_key: `${base}/#keys`, contact: CONTACT_URL,
    add_credits: key ? `${TOPUP_URL || base + "/topup"}?key_id=${key.id}` : (TOPUP_URL || base + "/topup"),
    pricing: db.prices(),
    note: "Credits are prepaid, in US cents. Per-request payment (x402) is planned; until then, top up by card at add_credits.",
  });

  const auth = (req) => {
    const h = req.headers.authorization || "";
    const m = /^Bearer\s+(\S+)$/i.exec(h);
    if (!m) return null;
    return db.keyBySecret(m[1]) || null;
  };
  const rateLimited = (keyId) => {
    const minute = Math.floor(Date.now() / 60000);
    const r = rate.get(keyId);
    if (!r || r.minute !== minute) { rate.set(keyId, { minute, n: 1 }); return false; }
    r.n++;
    return r.n > RATE_PER_MIN;
  };

  // Returns {key, charged} or sends an error and returns null.
  const meter = (req, res, priceKey, ref) => {
    const base = baseOf(req);
    const key = auth(req);
    if (!key) { json(res, 401, { error: "unauthorized", message: "Send `Authorization: Bearer so_live_...`. New here? See get_a_key.", ...howToPay(base, null) }); return null; }
    if (rateLimited(key.id)) { json(res, 429, { error: "rate_limited", message: `More than ${RATE_PER_MIN} requests a minute on this key.` }, { "retry-after": "30" }); return null; }
    const price = db.prices()[priceKey];
    const r = db.charge(key.id, price, ref, priceKey);
    if (!r.ok) {
      if (r.reason === "daily_cap") { json(res, 429, { error: "daily_cap_reached", message: `This key may spend ${r.cap} cents a day and has spent ${r.spent_today}. Raise the cap from your account or wait until tomorrow (UTC).`, spent_today_cents: r.spent_today, daily_cap_cents: r.cap }, { "retry-after": String(secondsToMidnightUTC()), "x-price-cents": String(price) }); return null; }
      json(res, 402, { error: "payment_required", message: `This call costs ${price} cents and the key has ${r.balance}.`, price_cents: price, balance_cents: r.balance, ...howToPay(base, key) }, { "x-price-cents": String(price) });
      return null;
    }
    res.setHeader("x-price-cents", String(price));
    res.setHeader("x-charged-cents", String(price));
    res.setHeader("x-balance-cents", String(r.balance));
    return { key, charged: price };
  };

  return async function handler(req, res) {
    const BASE_URL = baseOf(req);
    const url = new URL(req.url, BASE_URL);
    const p = url.pathname.replace(/\/+$/, "") || "/";
    const qp = Object.fromEntries(url.searchParams);
    try {
      if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, OPTIONS" }); return res.end(); }

      /* ---------- free, public ---------- */
      if (p === "/" && req.method === "GET") {
        if (/text\/html/.test(req.headers.accept || "")) return text(res, 200, readFileSync(join(here, "..", "public", "index.html"), "utf8").replaceAll("{{CONTACT_URL}}", CONTACT_URL), "text/html; charset=utf-8");
        return json(res, 200, { name: "Softopen", tagline: "Businesses that are about to open, before they pick their vendors.", docs: `${BASE_URL}/openapi.json`, llms: `${BASE_URL}/llms.txt`, mcp: "npx softopen-mcp (see README)", pricing: db.prices(), coverage: `${BASE_URL}/v1/sources`, ...howToPay(BASE_URL, null) });
      }
      if (p === "/health") return json(res, 200, { ok: true, leads: db.leadCount(), today: todayISO() });
      if (p === "/openapi.json") return json(res, 200, openapi(BASE_URL, db.prices()));
      if (p === "/llms.txt") return text(res, 200, readFileSync(join(here, "..", "public", "llms.txt"), "utf8").replaceAll("{{BASE_URL}}", BASE_URL));
      if (p === "/v1/pricing") return json(res, 200, { currency: "USD", unit: "cents", ...db.prices(), daily_cap_default_cents: 2000 });
      if (p === "/v1/sources") return json(res, 200, { total_leads: db.leadCount(), states: db.sourceSummary() });

      /* ---------- account (free, needs key) ---------- */
      if (p === "/v1/account") {
        const key = auth(req);
        if (!key) return json(res, 401, { error: "unauthorized", ...howToPay(BASE_URL, null) });
        return json(res, 200, { key_id: key.id, label: key.label, balance_cents: key.balance_cents, spent_today_cents: db.spentToday(key.id), daily_cap_cents: key.daily_cap_cents, prices: db.prices() });
      }

      /* ---------- metered ---------- */
      if (p === "/v1/leads" && req.method === "GET") {
        const m = meter(req, res, "search_cents", "search");
        if (!m) return;
        const f = { ...qp, kind: qp.stage, has_email: qp.has_email === "true", has_phone: qp.has_phone === "true" };
        const r = db.searchLeads(f);
        return json(res, 200, { total: r.total, limit: r.limit, offset: r.offset, leads: r.rows });
      }
      let mm;
      if ((mm = /^\/v1\/leads\/(so_[a-f0-9]{12})$/.exec(p)) && req.method === "GET") {
        const lead = db.getLead(mm[1]);
        if (!lead) return json(res, 404, { error: "not_found", message: "No lead with that id." });
        const m = meter(req, res, "lead_cents", `lead:${lead.id}`);
        if (!m) return;
        const pend = db.pendingConfirmationFor(lead.id, m.key.id);
        return json(res, 200, { ...lead, confirmation: pend ? db.getConfirmation(pend.id) : null });
      }
      if ((mm = /^\/v1\/leads\/(so_[a-f0-9]{12})\/confirm$/.exec(p)) && req.method === "POST") {
        const lead = db.getLead(mm[1]);
        if (!lead) return json(res, 404, { error: "not_found", message: "No lead with that id." });
        const body = parseJson(await readBody(req));
        if (body === null) return json(res, 400, { error: "bad_json" });
        const questions = Array.isArray(body.questions) ? body.questions.slice(0, 3).map((s) => String(s).slice(0, 200)) : [];
        const key = auth(req);
        if (key) {
          const existing = db.pendingConfirmationFor(lead.id, key.id);
          if (existing) return json(res, 200, db.getConfirmation(existing.id));
        }
        const m = meter(req, res, "confirm_cents", `confirm:${lead.id}`);
        if (!m) return;
        const c = db.createConfirmation({ lead_id: lead.id, key_id: m.key.id, questions, callback_url: body.callback_url, price_cents: m.charged });
        return json(res, 201, { ...c, eta: "within 2 business days", poll: `${BASE_URL}/v1/confirmations/${c.id}` });
      }
      if ((mm = /^\/v1\/confirmations\/(cf_[a-f0-9]{12})$/.exec(p)) && req.method === "GET") {
        const c = db.getConfirmation(mm[1]);
        if (!c) return json(res, 404, { error: "not_found" });
        const { key_id, callback_url, ...pub } = c;
        return json(res, 200, pub);
      }

      /* ---------- operator ---------- */
      if (p === "/v1/admin/ingest" && req.method === "POST") {
        if (!ADMIN_TOKEN || req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return json(res, 401, { error: "unauthorized" });
        const body = parseJson(await readBody(req));
        const leads = Array.isArray(body) ? body : body?.leads;
        if (!Array.isArray(leads)) return json(res, 400, { error: "bad_json", message: "Send the Radar leads.json or an array of leads." });
        const before = db.leadCount();
        db.raw.exec("BEGIN");
        try { for (const l of leads) db.upsertLead(l); db.raw.exec("COMMIT"); } catch (e) { db.raw.exec("ROLLBACK"); throw e; }
        return json(res, 200, { received: leads.length, new: db.leadCount() - before, total: db.leadCount() });
      }
      if (p === "/v1/webhooks/stripe" && req.method === "POST") {
        const raw = await readBody(req);
        if (!STRIPE_WEBHOOK_SECRET || !verifyStripe(raw, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET)) return json(res, 400, { error: "bad_signature" });
        const ev = parseJson(raw);
        if (ev?.type === "checkout.session.completed") {
          const s = ev.data.object;
          const keyId = s.metadata?.key_id;
          const cents = Number(s.amount_total || 0);
          if (keyId && cents > 0 && db.keyById(keyId) && db.recordPayment(s.id, keyId, cents, "stripe")) db.credit(keyId, cents, "topup", "stripe checkout", s.id);
        }
        return json(res, 200, { received: true });
      }

      return json(res, 404, { error: "not_found", message: "See /openapi.json" });
    } catch (e) {
      console.error(e);
      return json(res, 500, { error: "server_error" });
    }
  };
}

export function verifyStripe(rawBody, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(String(sigHeader).split(",").map((kv) => kv.split("=")));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const given = parts.v1 || "";
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

function secondsToMidnightUTC() {
  const d = new Date();
  return Math.max(60, Math.ceil((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - d.getTime()) / 1000));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const db = openDb();
  createServer(createApp(db)).listen(PORT, () => console.log(`Softopen listening on ${FIXED_BASE || `http://localhost:${PORT}`} with ${db.leadCount()} leads`));
}
