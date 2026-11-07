// Softopen operator CLI. This is where the human side of the confirmation service lives.
//
//   node src/admin.mjs key create --label "Acme agent" --credits 2000 --cap 2000
//   node src/admin.mjs key list | key credit <key_id> <cents> | key cap <key_id> <cents> | key revoke <key_id>
//   node src/admin.mjs confirm list                 pending calls to make, oldest first
//   node src/admin.mjs confirm done <cf_id> --verdict confirmed --owner "Maria Lopez" --opening 2026-11-28 --phone 956-555-0100 --pos none --notes "..." --answer "..." --answer "..."
//   node src/admin.mjs confirm done <cf_id> --verdict unreachable     (refunds the requester)
//   node src/admin.mjs price set search_cents 5
//   node src/admin.mjs stats
import { openDb, DEFAULTS } from "./db.mjs";

const [, , group, cmd, ...rest] = process.argv;
const flags = {};
const pos = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) {
    const k = rest[i].slice(2);
    const v = rest[i + 1] !== undefined && !rest[i + 1].startsWith("--") ? rest[++i] : "true";
    if (k === "answer") (flags.answer ||= []).push(v); else flags[k] = v;
  } else pos.push(rest[i]);
}
const db = openDb();
const out = (o) => console.log(typeof o === "string" ? o : JSON.stringify(o, null, 2));
const money = (c) => `$${(c / 100).toFixed(2)}`;

try {
  if (group === "key" && cmd === "create") {
    const k = db.createKey({ label: flags.label, credits_cents: Number(flags.credits || 0), daily_cap_cents: Number(flags.cap || DEFAULTS.daily_cap_cents) });
    out({ ...k, note: "Save the secret now. It is stored hashed and cannot be shown again." });
  } else if (group === "key" && cmd === "list") {
    out(db.listKeys().map((k) => ({ ...k, balance: money(k.balance_cents), spent_today: money(db.spentToday(k.id)) })));
  } else if (group === "key" && cmd === "credit") {
    out({ key_id: pos[0], balance_cents: db.credit(pos[0], Number(pos[1]), "credit", flags.note || "manual credit") });
  } else if (group === "key" && cmd === "cap") {
    out({ key_id: pos[0], updated: db.setCap(pos[0], Number(pos[1])) });
  } else if (group === "key" && cmd === "revoke") {
    out({ key_id: pos[0], revoked: db.revokeKey(pos[0]) });
  } else if (group === "confirm" && cmd === "list") {
    const rows = db.listConfirmations(flags.status || "pending");
    if (!rows.length) out("Nothing pending.");
    for (const c of rows) {
      const age = Math.round((Date.now() - Date.parse(c.requested_at)) / 36e5);
      out(`${c.id}  ${age}h old  ${c.name}  ${c.address}, ${c.city} ${c.state}  phone: ${c.phone || "look up"}  lead: ${c.lead_id}`);
      for (const q of JSON.parse(c.questions || "[]")) out(`    Q: ${q}`);
    }
  } else if (group === "confirm" && cmd === "done") {
    const c = db.getConfirmation(pos[0]);
    if (!c) throw new Error("no such confirmation");
    if (c.status !== "pending") throw new Error(`already ${c.status}`);
    const verdict = flags.verdict;
    if (!["confirmed", "not_opening", "unreachable"].includes(verdict)) throw new Error("--verdict confirmed | not_opening | unreachable");
    const result = { owner_name: flags.owner || null, decision_maker: flags.dm || flags.owner || null, opening_date: flags.opening || null, phone: flags.phone || null, has_pos: flags.pos || null, notes: flags.notes || null, answers: flags.answer || [] };
    const done = db.completeConfirmation(c.id, verdict, result);
    let refunded = 0;
    if (verdict !== "confirmed") { db.credit(c.key_id, c.price_cents, "refund", `confirmation ${c.id} ${verdict}`, c.id); refunded = c.price_cents; }
    if (done.callback_url) {
      try { const r = await fetch(done.callback_url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(done) }); out(`callback ${done.callback_url} -> ${r.status}`); } catch (e) { out(`callback failed: ${e.message}`); }
    }
    out({ ...done, refunded_cents: refunded });
  } else if (group === "price" && cmd === "set") {
    const p = db.prices(); p[pos[0]] = Number(pos[1]); db.setPrices(p); out(p);
  } else if (group === "price") {
    out(db.prices());
  } else if (group === "stats") {
    const keys = db.listKeys();
    const rev = db.raw.prepare("SELECT coalesce(-sum(amount_cents),0) AS n FROM ledger WHERE kind='charge'").get().n;
    const refunds = db.raw.prepare("SELECT coalesce(sum(amount_cents),0) AS n FROM ledger WHERE kind='refund'").get().n;
    const topups = db.raw.prepare("SELECT coalesce(sum(amount_cents),0) AS n FROM ledger WHERE kind='topup'").get().n;
    const calls = db.raw.prepare("SELECT note AS kind, count(*) AS n FROM ledger WHERE kind='charge' GROUP BY note").all();
    out({ leads: db.leadCount(), keys: keys.length, active_keys: keys.filter((k) => !k.revoked).length, charged: money(rev), refunded: money(refunds), topups: money(topups), net: money(rev - refunds), calls, pending_confirmations: db.listConfirmations("pending").length, coverage: db.sourceSummary() });
  } else {
    out(`usage:
  key create --label <text> [--credits <cents>] [--cap <cents>]
  key list | key credit <key_id> <cents> | key cap <key_id> <cents> | key revoke <key_id>
  confirm list [--status pending|confirmed|not_opening|unreachable]
  confirm done <cf_id> --verdict confirmed|not_opening|unreachable [--owner] [--dm] [--opening] [--phone] [--pos] [--notes] [--answer ...]
  price | price set <search_cents|lead_cents|confirm_cents> <cents>
  stats`);
  }
} catch (e) { console.error("error:", e.message); process.exitCode = 1; } finally { db.close(); }
