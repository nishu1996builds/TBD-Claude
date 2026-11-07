# Softopen

**Businesses that are about to open, before they pick their vendors.**

Softopen takes the scored pre-opening leads that Storefront Radar produces every morning and sells them two ways: as a metered HTTP API that AI agents and sales tools call directly, and as a human phone confirmation on any lead. Zero dependencies, one SQLite file, one process.

```
Storefront Radar (daily, GitHub Actions)  ──leads.json──▶  Softopen API  ◀──  agents, reps, MCP clients
                                                              │
                                                              └──▶ confirmation queue ──▶ you, on the phone ──▶ result back to the agent
```

## Why this and not another filings scraper

Raw new-business filings are a commodity. Marketplaces sell state registry rows for under a cent each. Softopen sells the two things those feeds don't have:

1. **Earlier signals, already qualified.** Liquor applications, pre-license inspections and sales tax permits fire weeks before an entity shows up in a registry scrape. Radar scores each one for POS fit, physical storefront, independent ownership and pre-opening stage, so a buyer gets 400 plausible shops instead of 4,700 corporations.
2. **A human who confirms it.** For a few dollars, a person phones the business, confirms it's real and opening, finds the decision maker and the opening date, and asks the buyer's questions. No model and no scraper can do that, and it moves risk off the agent.

## Pricing

| Call | Price | Notes |
|---|---|---|
| `GET /v1/leads` | $0.05 | Up to 50 leads per call, every page is a call |
| `GET /v1/leads/{id}` | $0.01 | |
| `POST /v1/leads/{id}/confirm` | $3.00 | Refunded in full if unreachable or not opening |
| coverage, pricing, account, confirmation status | free | |

Keys hold prepaid credits in cents. Default daily cap $20 per key. Prices live in the database and change with `admin price set`.

## Run it

```bash
node --version                      # 22.5 or newer (node:sqlite)
npm run ingest -- ../storefront-radar/data/leads.json
npm run admin -- key create --label "first customer" --credits 2000
npm start                           # http://localhost:8402
curl -H "Authorization: Bearer so_live_..." "localhost:8402/v1/leads?state=TX&city=Houston&min_score=75"
npm test                            # 29 end-to-end checks, in-memory db, real HTTP and MCP
```

Environment:

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `8402` | |
| `SOFTOPEN_DB` | `./data/softopen.db` | SQLite file. Back this up. |
| `SOFTOPEN_BASE_URL` | from the request's Host header | Set in production, e.g. `https://api.softopen.dev` |
| `SOFTOPEN_ADMIN_TOKEN` | unset, endpoint disabled | Bearer token for `POST /v1/admin/ingest` |
| `SOFTOPEN_TOPUP_URL` | `{base}/topup` | Where 402 responses send buyers to add credits (a Stripe Payment Link works) |
| `STRIPE_WEBHOOK_SECRET` | unset, endpoint disabled | Verifies `POST /v1/webhooks/stripe`; `checkout.session.completed` with `metadata.key_id` credits that key by `amount_total` |
| `SOFTOPEN_CONTACT_URL` | the Gumroad store | Shown on the landing page and in 401 bodies |
| `SOFTOPEN_RATE_PER_MIN` | `120` | Per-key request limit |

Docker: `docker build -t softopen . && docker run -p 8402:8402 -v softopen-data:/data -e SOFTOPEN_ADMIN_TOKEN=... softopen`. Any $5 VPS, Fly.io or Railway box runs it.

## Daily feed from Radar

Add one step to the end of Radar's `daily.yml`, after it commits `data/`:

```yaml
      - name: Push leads to Softopen
        run: |
          curl -sS -X POST "$SOFTOPEN_URL/v1/admin/ingest" \
            -H "Authorization: Bearer $SOFTOPEN_ADMIN_TOKEN" \
            -H "content-type: application/json" \
            --data-binary @data/leads.json
        env:
          SOFTOPEN_URL: ${{ secrets.SOFTOPEN_URL }}
          SOFTOPEN_ADMIN_TOKEN: ${{ secrets.SOFTOPEN_ADMIN_TOKEN }}
```

Ingest is idempotent. A lead's id is a hash of name, address and ZIP, so the same business keeps the same `so_` id across days and buyers can diff with `first_seen_since`.

## The human loop

This is the part you run.

```bash
npm run admin -- confirm list
# cf_faafb5e36af5  3h old  Galaxy Mart  4710 Fairbanks North Houston Rd Ste A, Houston TX  phone: look up  lead: so_2a64346bfdf4
#     Q: Who decides on the POS system?

npm run admin -- confirm done cf_faafb5e36af5 --verdict confirmed \
  --owner "Maria Lopez" --opening 2026-11-28 --phone 713-555-0100 --pos none \
  --answer "Maria, the owner" --notes "Soft open first, grand opening Dec 5"

npm run admin -- confirm done cf_... --verdict unreachable     # refunds the buyer automatically
```

If the buyer gave a `callback_url`, the result is POSTed there when you close it. Otherwise they poll `GET /v1/confirmations/{id}`.

Promise "within 2 business days" and keep it. The queue is sorted oldest first.

## MCP

`src/mcp.mjs` is a stdio MCP server with six tools: `search_leads`, `get_lead`, `request_confirmation`, `get_confirmation`, `get_account`, `get_coverage`. Claude Desktop, Cursor or any MCP client:

```json
{ "mcpServers": { "softopen": { "command": "node", "args": ["/path/to/softopen/src/mcp.mjs"], "env": { "SOFTOPEN_URL": "https://api.softopen.dev", "SOFTOPEN_API_KEY": "so_live_..." } } } }
```

Every tool result says what it cost and what's left on the key. A 402 comes back as a tool error with the top-up link so the agent can hand it to its user.

## For agents and their developers

- `GET /openapi.json` is the full spec, with prices in the summaries.
- `GET /llms.txt` is the plain-text version.
- Unauthenticated and unpaid calls return JSON that says how to get a key and where to add credits. No HTML error pages.
- `X-Price-Cents`, `X-Charged-Cents`, `X-Balance-Cents` on every metered response.
- CORS is open, so a browser-based agent can call it too.

## What's real and what's not yet

| Done | Not yet |
|---|---|
| Metered API, keys, credits, ledger, daily cap, rate limit | Self-serve key signup (keys are issued by hand with the CLI) |
| Stable lead ids, idempotent ingest, admin ingest endpoint | Payment page: set `SOFTOPEN_TOPUP_URL` to a Stripe Payment Link whose success metadata carries `key_id` |
| Stripe webhook that credits a key, with replay protection | Per-request payment (x402). The 402 body is shaped so it can carry an `accepts` block later |
| Confirmation queue, operator CLI, refunds, callbacks | Contact enrichment (owner names, phones) beyond what the filing had |
| MCP server, OpenAPI, llms.txt, landing page | Registry listings: official MCP registry, Smithery, Glama, PulseMCP |
| 29-check smoke test | Hosting. Nothing is deployed yet |

## Launch checklist

1. Pick a domain (check `softopen.*` and the USPTO first; the name is clear in web search but domains weren't checked).
2. Deploy the container with a persistent volume. Set `SOFTOPEN_BASE_URL`, `SOFTOPEN_ADMIN_TOKEN`, `STRIPE_WEBHOOK_SECRET`.
3. Add the ingest step to Radar's workflow and the two secrets.
4. Create a Stripe Payment Link for credits ($10, $25, $50), point `SOFTOPEN_TOPUP_URL` at it, and pass `key_id` through to checkout metadata.
5. Issue three keys by hand to people who sell POS and ask them to point an agent at it.
6. List the MCP server in the registries and watch two numbers for 30 days: metered calls from non-human user agents, and dollars charged.

## Layout

```
src/server.mjs     HTTP API, metering, Stripe webhook, admin ingest
src/db.mjs         SQLite schema and all queries (node:sqlite)
src/openapi.mjs    Spec builder
src/ingest.mjs     node src/ingest.mjs leads.json
src/admin.mjs      Keys, credits, prices, the confirmation queue
src/mcp.mjs        Stdio MCP server (talks to the HTTP API)
public/            Landing page and llms.txt
test/smoke.mjs     End-to-end test with a 3-lead fixture
Dockerfile
```

Softopen started inside the TBD Lab repo, the same way Storefront Radar did. It should move to its own private repo before the first real key is issued.
