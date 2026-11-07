# Handoff: Softopen and the TBD Lab, as of 2026-11-07

Written to unite two parallel Claude Code chats into one. Read this first, then `softopen/README.md`.

## Where everything actually is (correct a common misunderstanding)

Softopen has **not** been moved to its own repo. It exists in exactly one place:

| Thing | Location | State |
|---|---|---|
| Softopen service (API, MCP, CLI, tests) | `nishu1996builds/TBD-Claude`, branch `claude/intelligent-newton-6f4bhn`, folder `softopen/` | Committed and pushed, commit `2cfd269`. Tests pass (29 checks). Not deployed. |
| Storefront Radar (the lead engine that feeds Softopen) | `nishu1996builds/storefront-radar`, private | Runs daily on GitHub Actions. Unchanged by either chat. |
| The lab site (free tools, Ratecard, games, art) | `nishu1996builds/TBD-Claude`, default branch `claude/festive-allen-pedczk` | Live on GitHub Pages. |
| Marketing pack | `marketing/` on the default branch | The other chat added `marketing/channels.md` (channel scorecard and submission kit) in commit `b10c852`. |

The two branches share base `3d67c3a` and touch different files, so merging `claude/intelligent-newton-6f4bhn` into the default branch is clean. The Pages workflow on the Softopen branch already excludes `softopen/` from the public site.

Repos that exist on the account: `TBD-Claude` (public), `storefront-radar` (private), `tailorscan` (public), `ResumeBuildngRepo` (private). There is no `softopen` repo yet.

## First moves for the new chat

1. `git fetch origin` and merge `claude/intelligent-newton-6f4bhn` into the default branch, or keep working on it. Either way, one branch from here on.
2. Decide Softopen's permanent home. Recommendation: a new private repo `softopen`, created by hand on GitHub, then `git subtree split` or a plain copy of `softopen/` into it. Radar graduated the same way. Do this before issuing the first real API key, because the pricing and scoring logic should not sit in a public repo.
3. Add the one-step ingest hook to Radar's `.github/workflows/daily.yml` (snippet in `softopen/README.md`, section "Daily feed from Radar"). Needs two repo secrets: `SOFTOPEN_URL`, `SOFTOPEN_ADMIN_TOKEN`.
4. Work the launch checklist at the bottom of `softopen/README.md`.

## The business decision, in short

**Thesis.** Agents will increasingly be the buyer. They pay for what a model cannot fabricate: ground truth, side effects, accountability. They choose vendors by integration cost, so the docs, the OpenAPI spec and the MCP server are the sales team.

**Market check.** Raw new-business filings are a commodity. Apify lists a dozen scrapers at $4 to $20 per 1,000 rows, including one called "filingradar". Competitors with similar names: FirstFiled, Firstfile, FiledToday, SMB Sales Boost. So Softopen does not sell filings. It sells two things the scrapers lack:

1. **Earlier, qualified signals.** Liquor applications, pre-license inspections, sales tax permits, scored for POS fit, physical storefront, independent owner and pre-opening stage.
2. **Human confirmation.** A person phones the business, confirms it is real and opening, finds the decision maker and opening date, answers up to 3 buyer questions. Nishu is the human for now (confirmed yes).

**Product ladder and pricing (live in the code, changeable with the CLI):**

| Rung | Price |
|---|---|
| Search, up to 50 leads | $0.05 per call |
| One lead by id | $0.01 |
| Human confirmation | $3.00, refunded if unreachable or not opening |
| Daily cap per key | $20 default |

**Name.** "Softopen" (a soft open is the pre-opening phase, exactly the signal). Clear in web search. Domains and USPTO were not checked from the cloud environment; do that before committing. "Radar" was dropped because Radar Labs is a known location SDK company.

**Open question Nishu has not answered.** Which territory to run confirmations in personally. Texas has the volume (606 of 1,651 leads); Connecticut has the emails (184 of 188).

## What Radar covers (measured 2026-11-07)

| Measure | Value |
|---|---|
| Sources polled daily | 18 Socrata portals, all returning HTTP 200 |
| Qualified leads on file | 1,651 from filings dated 2026-10-30 to 2026-11-06 |
| By state | TX 606, NY 395, CT 184, CO 139, IL 117, CA 90, WA 47, OR 46, others small |
| By stage | entity 769, tax 451, application 165, license 162, registration 89, inspection 15 |
| Hot (75+) | 1,268 |
| With email / phone | 188 / 51 |
| New per day | 236 to 390 |

Known data issues: two NYC feeds and the Colorado liquor feed return zero rows (stale at the source). Scoring bug: "Izzi Market #20" scored 100 with full independent-owner points, so numbered chain locations slip through. A task card was queued for that fix in the Radar repo.

## What Softopen v1 contains

```
softopen/
  src/server.mjs     HTTP API: metering, keys, 401/402/429 JSON, Stripe webhook, admin ingest
  src/db.mjs         SQLite via node:sqlite (Node 22.5+), schema, ledger, confirmations
  src/openapi.mjs    OpenAPI 3.1 builder, prices in the summaries
  src/ingest.mjs     node src/ingest.mjs path/to/leads.json  (idempotent, stable so_ ids)
  src/admin.mjs      key create/list/credit/cap/revoke, confirm list/done, price, stats
  src/mcp.mjs        stdio MCP server, 6 tools, talks to the HTTP API
  public/            landing page, llms.txt
  test/smoke.mjs     29 end-to-end checks: real HTTP server, real MCP process, in-memory db
  Dockerfile         node:22-alpine, volume at /data
  README.md          run, env vars, Radar hook, human loop, MCP config, what's done vs not, launch checklist
```

Verified live against the real 1,651 leads: search Houston restaurants, charge and balance headers, confirmation request, operator closes it from the CLI, agent polls the result, an empty key gets a 402 with a top-up link.

Not done: hosting, domain, self-serve key signup, Stripe Payment Link for top-ups (webhook is ready), x402 per-request payment (402 body is shaped for it), contact enrichment, registry listings (official MCP registry, Smithery, Glama, PulseMCP).

## Cloud environment

A personal Claude Code cloud environment named `TBD-Claude` exists for this repo: limited network (fonts.googleapis.com, fonts.gstatic.com, nishu1996builds.github.io, nishulegacy.gumroad.com, github.com, plus package registries and connector hosts), variables `SITE_URL` and `STORE_URL`, and a setup script that installs rsync, LibreOffice Writer and fonts. The script has not yet run in a fresh session, so the first session on it proves it. The Default environment still carries an older LibreOffice install line that can be removed. Research sessions that fetch arbitrary web pages should use Default.

## Suggested opening message for the new chat

> Read HANDOFF.md at the repo root, then softopen/README.md. Softopen is on branch claude/intelligent-newton-6f4bhn under softopen/. Merge it into the default branch, then help me move it to a new private repo called softopen, add the ingest step to storefront-radar's daily workflow, and start the launch checklist. My confirmation territory is: [TEXAS or CONNECTICUT].
