// Softopen storage: one SQLite file, no dependencies (node:sqlite, Node 22.5+).
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const DEFAULT_PRICES = {
  search_cents: 5,      // one search call, up to 50 leads
  lead_cents: 1,        // one lead by id
  confirm_cents: 300,   // one human confirmation, refunded if the business is unreachable
};

export const DEFAULTS = {
  daily_cap_cents: 2000, // $20 a day per key unless raised
  free_credits_cents: 0,
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  radar_id TEXT,
  name TEXT NOT NULL,
  legal_name TEXT,
  industry TEXT,
  category TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  filed TEXT,
  first_seen TEXT,
  kind TEXT,
  score INTEGER,
  band TEXT,
  phone TEXT,
  email TEXT,
  sources TEXT,
  why TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_state_city ON leads(state, city);
CREATE INDEX IF NOT EXISTS leads_zip ON leads(zip);
CREATE INDEX IF NOT EXISTS leads_filed ON leads(filed);
CREATE INDEX IF NOT EXISTS leads_score ON leads(score);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  key_hint TEXT NOT NULL,
  label TEXT,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  daily_cap_cents INTEGER NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  kind TEXT NOT NULL,
  ref TEXT,
  note TEXT
);
CREATE INDEX IF NOT EXISTS ledger_key_ts ON ledger(key_id, ts);

CREATE TABLE IF NOT EXISTS confirmations (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  key_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  questions TEXT,
  callback_url TEXT,
  price_cents INTEGER NOT NULL,
  result TEXT,
  requested_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS confirmations_status ON confirmations(status);

CREATE TABLE IF NOT EXISTS settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  key_id TEXT,
  amount_cents INTEGER NOT NULL,
  provider TEXT NOT NULL,
  ts TEXT NOT NULL
);
`;

export const nowISO = () => new Date().toISOString();
export const todayISO = () => nowISO().slice(0, 10);
export const sha256 = (s) => createHash("sha256").update(s).digest("hex");

export function leadId(l) {
  const key = [l.name, l.address, l.zip].map((s) => String(s || "").trim().toLowerCase()).join("|");
  return "so_" + sha256(key).slice(0, 12);
}

export function openDb(path = process.env.SOFTOPEN_DB || "./data/softopen.db") {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return wrap(db);
}

function wrap(db) {
  const q = (sql) => db.prepare(sql);
  const getSetting = (k, fallback) => {
    const r = q("SELECT v FROM settings WHERE k = ?").get(k);
    return r ? JSON.parse(r.v) : fallback;
  };
  const setSetting = (k, v) => q("INSERT INTO settings(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(k, JSON.stringify(v));

  return {
    raw: db,
    close: () => db.close(),

    prices: () => ({ ...DEFAULT_PRICES, ...getSetting("prices", {}) }),
    setPrices: (p) => setSetting("prices", p),
    getSetting, setSetting,

    /* ---------- leads ---------- */
    upsertLead(l) {
      const id = leadId(l);
      const ts = nowISO();
      q(`INSERT INTO leads(id, radar_id, name, legal_name, industry, category, address, city, state, zip, filed, first_seen, kind, score, band, phone, email, sources, why, created_at, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           radar_id = excluded.radar_id, legal_name = excluded.legal_name, industry = excluded.industry,
           category = excluded.category, filed = excluded.filed, kind = excluded.kind, score = excluded.score,
           band = excluded.band, phone = CASE WHEN excluded.phone <> '' THEN excluded.phone ELSE leads.phone END,
           email = CASE WHEN excluded.email <> '' THEN excluded.email ELSE leads.email END,
           sources = excluded.sources, why = excluded.why, updated_at = excluded.updated_at`)
        .run(id, l.id || null, l.name, l.legal || null, l.industry || null, l.category || null, l.address || null,
          l.city || null, l.state || null, l.zip || null, l.filed || null, l.firstSeen || todayISO(), l.kind || null,
          l.score ?? null, l.band || null, l.phone || "", l.email || "", JSON.stringify(l.sources || []),
          JSON.stringify(l.why || []), ts, ts);
      return id;
    },
    getLead: (id) => hydrate(q("SELECT * FROM leads WHERE id = ?").get(id)),
    searchLeads(f) {
      const where = [];
      const args = [];
      if (f.state) { where.push("state = ?"); args.push(String(f.state).toUpperCase()); }
      if (f.city) { where.push("lower(city) = lower(?)"); args.push(f.city); }
      if (f.zip_prefix) { where.push("zip LIKE ?"); args.push(String(f.zip_prefix) + "%"); }
      if (f.industry) { where.push("lower(industry) LIKE lower(?)"); args.push("%" + f.industry + "%"); }
      if (f.min_score != null) { where.push("score >= ?"); args.push(Number(f.min_score)); }
      if (f.filed_since) { where.push("filed >= ?"); args.push(f.filed_since); }
      if (f.first_seen_since) { where.push("first_seen >= ?"); args.push(f.first_seen_since); }
      if (f.kind) { where.push("kind = ?"); args.push(f.kind); }
      if (f.has_email) where.push("email <> ''");
      if (f.has_phone) where.push("phone <> ''");
      where.push("status = 'open'");
      const limit = Math.min(Math.max(Number(f.limit) || 25, 1), 50);
      const offset = Math.max(Number(f.offset) || 0, 0);
      const sql = `SELECT * FROM leads WHERE ${where.join(" AND ")} ORDER BY score DESC, filed DESC, id LIMIT ? OFFSET ?`;
      const rows = q(sql).all(...args, limit, offset).map(hydrate);
      const total = q(`SELECT count(*) AS n FROM leads WHERE ${where.join(" AND ")}`).get(...args).n;
      return { rows, total, limit, offset };
    },
    sourceSummary: () => q(`SELECT state, count(*) AS leads, max(filed) AS newest_filing, sum(email <> '') AS with_email, sum(phone <> '') AS with_phone
                            FROM leads WHERE status = 'open' GROUP BY state ORDER BY leads DESC`).all(),
    leadCount: () => q("SELECT count(*) AS n FROM leads").get().n,

    /* ---------- keys and money ---------- */
    createKey({ label, credits_cents = DEFAULTS.free_credits_cents, daily_cap_cents = DEFAULTS.daily_cap_cents }) {
      const secret = "so_live_" + randomBytes(24).toString("base64url");
      const id = "key_" + randomBytes(6).toString("hex");
      q("INSERT INTO api_keys(id, key_hash, key_hint, label, balance_cents, daily_cap_cents, created_at) VALUES(?, ?, ?, ?, ?, ?, ?)")
        .run(id, sha256(secret), secret.slice(-6), label || null, 0, daily_cap_cents, nowISO());
      if (credits_cents > 0) this.credit(id, credits_cents, "grant", "initial credits");
      return { id, secret, label, daily_cap_cents, balance_cents: credits_cents };
    },
    keyBySecret: (secret) => q("SELECT * FROM api_keys WHERE key_hash = ? AND revoked = 0").get(sha256(String(secret))),
    keyById: (id) => q("SELECT * FROM api_keys WHERE id = ?").get(id),
    listKeys: () => q("SELECT id, key_hint, label, balance_cents, daily_cap_cents, revoked, created_at FROM api_keys ORDER BY created_at").all(),
    revokeKey: (id) => q("UPDATE api_keys SET revoked = 1 WHERE id = ?").run(id).changes,
    setCap: (id, cap) => q("UPDATE api_keys SET daily_cap_cents = ? WHERE id = ?").run(cap, id).changes,

    spentToday(keyId) {
      const r = q("SELECT coalesce(-sum(amount_cents), 0) AS n FROM ledger WHERE key_id = ? AND kind = 'charge' AND ts >= ?").get(keyId, todayISO());
      return r.n;
    },
    credit(keyId, cents, kind = "credit", note = null, ref = null) {
      q("UPDATE api_keys SET balance_cents = balance_cents + ? WHERE id = ?").run(cents, keyId);
      q("INSERT INTO ledger(key_id, ts, amount_cents, kind, ref, note) VALUES(?, ?, ?, ?, ?, ?)").run(keyId, nowISO(), cents, kind, ref ?? null, note ?? null);
      return this.keyById(keyId).balance_cents;
    },
    // Atomic charge: returns {ok, balance, spent_today, reason}
    charge(keyId, cents, ref, note) {
      const key = this.keyById(keyId);
      if (!key || key.revoked) return { ok: false, reason: "revoked" };
      const spent = this.spentToday(keyId);
      if (spent + cents > key.daily_cap_cents) return { ok: false, reason: "daily_cap", balance: key.balance_cents, spent_today: spent, cap: key.daily_cap_cents };
      const r = q("UPDATE api_keys SET balance_cents = balance_cents - ? WHERE id = ? AND balance_cents >= ?").run(cents, keyId, cents);
      if (r.changes === 0) return { ok: false, reason: "insufficient", balance: key.balance_cents, spent_today: spent, cap: key.daily_cap_cents };
      q("INSERT INTO ledger(key_id, ts, amount_cents, kind, ref, note) VALUES(?, ?, ?, 'charge', ?, ?)").run(keyId, nowISO(), -cents, ref ?? null, note ?? null);
      return { ok: true, balance: key.balance_cents - cents, spent_today: spent + cents, cap: key.daily_cap_cents };
    },
    recordPayment(id, keyId, cents, provider) {
      const r = q("INSERT OR IGNORE INTO payments(id, key_id, amount_cents, provider, ts) VALUES(?, ?, ?, ?, ?)").run(id, keyId, cents, provider, nowISO());
      return r.changes === 1;
    },

    /* ---------- confirmations ---------- */
    createConfirmation({ lead_id, key_id, questions, callback_url, price_cents }) {
      const id = "cf_" + randomBytes(6).toString("hex");
      q("INSERT INTO confirmations(id, lead_id, key_id, status, questions, callback_url, price_cents, requested_at) VALUES(?, ?, ?, 'pending', ?, ?, ?, ?)")
        .run(id, lead_id, key_id, JSON.stringify(questions || []), callback_url || null, price_cents, nowISO());
      return this.getConfirmation(id);
    },
    getConfirmation(id) {
      const r = q("SELECT * FROM confirmations WHERE id = ?").get(id);
      if (!r) return null;
      r.questions = JSON.parse(r.questions || "[]");
      r.result = r.result ? JSON.parse(r.result) : null;
      return r;
    },
    pendingConfirmationFor: (leadId, keyId) => q("SELECT id FROM confirmations WHERE lead_id = ? AND key_id = ? AND status = 'pending'").get(leadId, keyId),
    listConfirmations: (status = "pending") => q("SELECT c.*, l.name, l.address, l.city, l.state, l.phone FROM confirmations c JOIN leads l ON l.id = c.lead_id WHERE c.status = ? ORDER BY c.requested_at").all(status),
    completeConfirmation(id, status, result) {
      q("UPDATE confirmations SET status = ?, result = ?, completed_at = ? WHERE id = ? AND status = 'pending'").run(status, JSON.stringify(result), nowISO(), id);
      return this.getConfirmation(id);
    },
  };
}

function hydrate(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    legal_name: r.legal_name,
    industry: r.industry,
    category: r.category,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    filed: r.filed,
    first_seen: r.first_seen,
    stage: r.kind,
    score: r.score,
    band: r.band,
    phone: r.phone || null,
    email: r.email || null,
    sources: JSON.parse(r.sources || "[]"),
    why: JSON.parse(r.why || "[]"),
    status: r.status,
    updated_at: r.updated_at,
  };
}
