// Softopen MCP server (stdio). Zero dependencies.
// Env: SOFTOPEN_API_KEY (required), SOFTOPEN_URL (default https://api.softopen.dev)
// Claude Desktop / Cursor / any MCP client: { "command": "node", "args": ["path/to/src/mcp.mjs"], "env": { "SOFTOPEN_API_KEY": "so_live_..." } }
import { createInterface } from "node:readline";

const BASE = (process.env.SOFTOPEN_URL || "https://api.softopen.dev").replace(/\/$/, "");
const KEY = process.env.SOFTOPEN_API_KEY || "";
const PROTOCOL = "2025-06-18";

const TOOLS = [
  { name: "search_leads", description: "Find businesses about to open (restaurants, bars, shops, salons, gyms, auto) from public pre-opening filings. Returns scored leads sorted hot first. Costs a few cents per call; each page is one call. Use first_seen_since for a daily delta.",
    inputSchema: { type: "object", properties: { state: { type: "string", description: "Two-letter state, e.g. TX" }, city: { type: "string" }, zip_prefix: { type: "string", description: "First 3 to 5 digits of a ZIP" }, industry: { type: "string", enum: ["Restaurants and food", "Bars and nightlife", "Retail", "Beauty and wellness", "Fitness", "Auto"] }, min_score: { type: "integer", description: "55 warm, 75 hot" }, filed_since: { type: "string", description: "YYYY-MM-DD" }, first_seen_since: { type: "string", description: "YYYY-MM-DD" }, stage: { type: "string", enum: ["application", "inspection", "tax", "license", "registration", "entity"] }, has_email: { type: "boolean" }, has_phone: { type: "boolean" }, limit: { type: "integer", maximum: 50 }, offset: { type: "integer" } } } },
  { name: "get_lead", description: "Fetch one lead by its so_ id, including any confirmation you requested on it. Costs one cent.", inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } } },
  { name: "request_confirmation", description: "Pay for a human to phone the business and confirm it is real and opening, who the decision maker is, the opening date, and up to 3 of your questions. Usually done within 2 business days. Refunded if unreachable or not opening.", inputSchema: { type: "object", required: ["lead_id"], properties: { lead_id: { type: "string" }, questions: { type: "array", maxItems: 3, items: { type: "string" } }, callback_url: { type: "string" } } } },
  { name: "get_confirmation", description: "Check the status and result of a confirmation request. Free.", inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } } },
  { name: "get_account", description: "Balance in cents, spend today, daily cap, and current prices. Free.", inputSchema: { type: "object", properties: {} } },
  { name: "get_coverage", description: "Which states have leads, how many, newest filing date, and how many have email or phone. Free.", inputSchema: { type: "object", properties: {} } },
];

async function api(method, path, body, query) {
  const url = new URL(BASE + path);
  if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  const r = await fetch(url, { method, headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data, charged: r.headers.get("x-charged-cents"), balance: r.headers.get("x-balance-cents") };
}

async function callTool(name, a = {}) {
  let r;
  switch (name) {
    case "search_leads": r = await api("GET", "/v1/leads", null, a); break;
    case "get_lead": r = await api("GET", `/v1/leads/${a.id}`); break;
    case "request_confirmation": r = await api("POST", `/v1/leads/${a.lead_id}/confirm`, { questions: a.questions, callback_url: a.callback_url }); break;
    case "get_confirmation": r = await api("GET", `/v1/confirmations/${a.id}`); break;
    case "get_account": r = await api("GET", "/v1/account"); break;
    case "get_coverage": r = await api("GET", "/v1/sources"); break;
    default: return { content: [{ type: "text", text: `Unknown tool ${name}` }], isError: true };
  }
  const meta = r.charged ? `\n\n(charged ${r.charged} cents, ${r.balance} cents left)` : "";
  if (r.status >= 400) return { content: [{ type: "text", text: `HTTP ${r.status}: ${JSON.stringify(r.data)}` }], isError: true };
  return { content: [{ type: "text", text: JSON.stringify(r.data, null, 2) + meta }], structuredContent: r.data };
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  line = line.trim();
  if (!line) return;
  let m;
  try { m = JSON.parse(line); } catch { return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }
  const { id, method, params } = m;
  if (id === undefined) return; // notification
  try {
    if (method === "initialize") return send({ jsonrpc: "2.0", id, result: { protocolVersion: params?.protocolVersion || PROTOCOL, capabilities: { tools: {} }, serverInfo: { name: "softopen", version: "0.1.0" }, instructions: "Softopen finds businesses about to open. Calls cost cents from a prepaid key; the tool result says what was charged. If you get HTTP 402, tell the user to add credits at the add_credits link in the error." } });
    if (method === "ping") return send({ jsonrpc: "2.0", id, result: {} });
    if (method === "tools/list") return send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    if (method === "tools/call") return send({ jsonrpc: "2.0", id, result: await callTool(params?.name, params?.arguments) });
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) {
    send({ jsonrpc: "2.0", id, error: { code: -32000, message: e.message } });
  }
});
if (!KEY) process.stderr.write("softopen-mcp: SOFTOPEN_API_KEY is not set; every metered call will return 401\n");
