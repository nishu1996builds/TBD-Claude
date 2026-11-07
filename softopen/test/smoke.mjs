// End-to-end smoke test: in-memory db, real HTTP server, real MCP process. node test/smoke.mjs
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
process.env.SOFTOPEN_ADMIN_TOKEN = "admin_test";
const { openDb } = await import("../src/db.mjs");
const { createApp, verifyStripe } = await import("../src/server.mjs");

const here = dirname(fileURLToPath(import.meta.url));
const db = openDb(":memory:");
const server = createServer(createApp(db));
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;
const fixture = JSON.parse(readFileSync(join(here, "fixture-leads.json"), "utf8"));
let passed = 0;
const ok = (name) => { passed++; console.log("  ok", name); };
const call = async (path, { key, method = "GET", body, headers = {} } = {}) => {
  const r = await fetch(BASE + path, { method, headers: { ...(key ? { authorization: `Bearer ${key}` } : {}), "content-type": "application/json", ...headers }, body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
  return { status: r.status, h: r.headers, body: await r.json().catch(() => null) };
};

// ingest over the admin endpoint
let r = await call("/v1/admin/ingest", { method: "POST", body: fixture, headers: { authorization: "Bearer admin_test" } });
assert.equal(r.status, 200); assert.equal(r.body.new, 3); ok("admin ingest");
r = await call("/v1/admin/ingest", { method: "POST", body: fixture, headers: { authorization: "Bearer admin_test" } });
assert.equal(r.body.new, 0); assert.equal(r.body.total, 3); ok("ingest is idempotent (stable ids)");
r = await call("/v1/admin/ingest", { method: "POST", body: fixture });
assert.equal(r.status, 401); ok("ingest needs the admin token");

// free endpoints
r = await call("/health"); assert.equal(r.body.leads, 3); ok("health");
r = await call("/openapi.json"); assert.equal(r.body.openapi, "3.1.0"); assert.ok(r.body.paths["/v1/leads"]); ok("openapi");
r = await call("/v1/sources"); assert.equal(r.body.total_leads, 3); assert.equal(r.body.states[0].leads, 1); ok("coverage");
const llms = await (await fetch(BASE + "/llms.txt")).text(); assert.ok(llms.includes(BASE + "/openapi.json")); ok("llms.txt");
const html = await (await fetch(BASE + "/", { headers: { accept: "text/html" } })).text(); assert.ok(html.includes("<title>Softopen</title>") && !html.includes("{{")); ok("landing page");

// auth and metering
r = await call("/v1/leads?state=TX"); assert.equal(r.status, 401); assert.ok(r.body.get_a_key); ok("401 without key, tells you where to get one");
const k = db.createKey({ label: "test agent", credits_cents: 20, daily_cap_cents: 1000 });
r = await call("/v1/leads?state=TX", { key: k.secret });
assert.equal(r.status, 200); assert.equal(r.body.total, 1); assert.equal(r.body.leads[0].name, "Pecan Street Taqueria");
assert.equal(r.h.get("x-charged-cents"), "5"); assert.equal(r.h.get("x-balance-cents"), "15"); ok("search charges 5c and reports balance");
const id = r.body.leads[0].id; assert.match(id, /^so_[a-f0-9]{12}$/);
r = await call(`/v1/leads/${id}`, { key: k.secret }); assert.equal(r.status, 200); assert.equal(r.h.get("x-balance-cents"), "14"); assert.equal(r.body.confirmation, null); ok("get lead charges 1c");
r = await call(`/v1/leads/so_000000000000`, { key: k.secret }); assert.equal(r.status, 404); assert.equal(r.h.get("x-charged-cents"), null); ok("404 is not charged");
r = await call("/v1/leads?industry=beauty&has_email=true", { key: k.secret }); assert.equal(r.body.total, 1); assert.equal(r.body.leads[0].email, "owner@example.com"); ok("filters: industry substring + has_email");
r = await call("/v1/leads?min_score=75", { key: k.secret }); assert.equal(r.body.total, 2); ok("filter: min_score");
r = await call(`/v1/leads/${id}/confirm`, { key: k.secret, method: "POST", body: { questions: ["Who picks the POS?"] } });
assert.equal(r.status, 402); assert.equal(r.body.price_cents, 300); assert.ok(r.body.add_credits.includes(k.id)); ok("402 when short, with a top-up link for this key");

// stripe top-up webhook
const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_test_1", amount_total: 500, metadata: { key_id: k.id } } } });
const t = Math.floor(Date.now() / 1000);
const sig = `t=${t},v1=${createHmac("sha256", "whsec_test").update(`${t}.${payload}`).digest("hex")}`;
r = await call("/v1/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": sig } }); assert.equal(r.status, 200);
r = await call("/v1/account", { key: k.secret }); assert.equal(r.body.balance_cents, 504); ok("stripe webhook credits the key");
r = await call("/v1/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": sig } });
r = await call("/v1/account", { key: k.secret }); assert.equal(r.body.balance_cents, 504); ok("replayed webhook is ignored");
assert.equal(verifyStripe(payload, `t=${t},v1=deadbeef`, "whsec_test"), false); ok("bad signature rejected");

// confirmation flow
r = await call(`/v1/leads/${id}/confirm`, { key: k.secret, method: "POST", body: { questions: ["Who picks the POS?", "When do you open?"] } });
assert.equal(r.status, 201); assert.equal(r.body.status, "pending"); const cf = r.body.id; assert.equal(r.h.get("x-balance-cents"), "204"); ok("confirmation created and charged $3");
r = await call(`/v1/leads/${id}/confirm`, { key: k.secret, method: "POST", body: {} }); assert.equal(r.status, 200); assert.equal(r.body.id, cf); ok("second request on same lead returns the pending one, no charge");
r = await call(`/v1/leads/${id}`, { key: k.secret }); assert.equal(r.body.confirmation.id, cf); ok("lead shows my pending confirmation");
r = await call(`/v1/confirmations/${cf}`); assert.equal(r.status, 200); assert.equal(r.body.key_id, undefined); ok("confirmation is readable without a key and hides key_id");
// operator completes it as unreachable -> refund
const done = db.completeConfirmation(cf, "unreachable", { notes: "number disconnected" });
db.credit(k.id, done.price_cents, "refund", "test", cf);
r = await call("/v1/account", { key: k.secret }); assert.equal(r.body.balance_cents, 503); ok("unreachable refunds in full");

// daily cap
const capped = db.createKey({ label: "capped", credits_cents: 1000, daily_cap_cents: 6 });
r = await call("/v1/leads", { key: capped.secret }); assert.equal(r.status, 200);
r = await call("/v1/leads", { key: capped.secret }); assert.equal(r.status, 429); assert.equal(r.body.error, "daily_cap_reached"); assert.ok(r.h.get("retry-after")); ok("daily cap returns 429 with Retry-After");

// revoked key
db.revokeKey(capped.id);
r = await call("/v1/account", { key: capped.secret }); assert.equal(r.status, 401); ok("revoked key is rejected");

// MCP over stdio
const mcp = spawn(process.execPath, ["--no-warnings=ExperimentalWarning", join(here, "..", "src", "mcp.mjs")], { env: { ...process.env, SOFTOPEN_URL: BASE, SOFTOPEN_API_KEY: k.secret }, stdio: ["pipe", "pipe", "inherit"] });
const replies = [];
let buf = "";
mcp.stdout.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { replies.push(JSON.parse(buf.slice(0, i))); buf = buf.slice(i + 1); } });
const rpc = (id, method, params) => mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
const waitFor = (id) => new Promise((res, rej) => { const t0 = Date.now(); const iv = setInterval(() => { const m = replies.find((x) => x.id === id); if (m) { clearInterval(iv); res(m); } else if (Date.now() - t0 > 5000) { clearInterval(iv); rej(new Error("mcp timeout " + id)); } }, 10); });
rpc(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
let m = await waitFor(1); assert.equal(m.result.serverInfo.name, "softopen"); ok("mcp initialize");
mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
rpc(2, "tools/list"); m = await waitFor(2); assert.equal(m.result.tools.length, 6); ok("mcp tools/list");
rpc(3, "tools/call", { name: "search_leads", arguments: { state: "IL" } }); m = await waitFor(3);
assert.equal(m.result.isError, undefined); assert.equal(m.result.structuredContent.leads[0].name, "Lakeview Fitness"); assert.ok(m.result.content[0].text.includes("charged 5 cents")); ok("mcp tools/call search_leads, reports charge");
rpc(4, "tools/call", { name: "get_coverage", arguments: {} }); m = await waitFor(4); assert.equal(m.result.structuredContent.total_leads, 3); ok("mcp get_coverage");
mcp.kill();

server.close(); db.close();
console.log(`\n${passed} checks passed`);
