# Storefront Radar daily pipeline

Every morning a GitHub Action pulls new business filings from 18 city and state open-data portals, scores each one for POS fit with the same rules as the Radar app (`tools/radar/`), and saves the results.

## What you get each morning

- **An email.** The workflow opens a GitHub issue labeled `radar-digest` with the day's new leads, grouped by city. GitHub emails you every new issue on your repo.
- **`data/radar/outreach-ready.csv`**: leads that have an email address on file, with a personalized subject and body already written. Import it into Gmail mail merge, GMass, YAMM, or Instantly.
- **`data/radar/leads.csv`**: every qualified lead, with phone, address, Google Maps and Google search links, and the reason for its score.
- **`data/radar/archive/leads-YYYY-MM-DD.csv`**: only that day's new leads.
- **`data/radar/source-health.json`**: which portals answered and which fields were missing. Check this if a source goes quiet.

## Set it up for your territory

Edit `pipeline/radar/config.json`:

| Setting | What it does |
|---|---|
| `territory.states` | e.g. `["FL", "TX"]`. Empty means everywhere. |
| `territory.cities` | e.g. `["Orlando", "Austin"]`. Empty means every city in those states. |
| `territory.zipPrefixes` | e.g. `["328", "787"]` for a metro area. |
| `industries` | `food`, `bars`, `retail`, `beauty`, `fitness`, `auto`, `services` |
| `minScore` | Leads below this score are left out. 55 is warm, 75 is hot. |
| `lookbackDays` | How many days of filings to pull each run. |
| `sender` | Your name, company, phone, email, and mailing address. A physical address is required in every commercial email by the CAN-SPAM Act. |
| `emailTemplate` | Which Radar template to use: `seq1` (friendly hello, default), `email` (fuller cold email). |

## Honor opt-outs

Anyone who replies "stop" goes into `pipeline/radar/do-not-contact.txt`, one email address or business name per line. They are removed from `outreach-ready.csv` on the next run.

## Run it now

Actions tab, **Storefront Radar daily**, **Run workflow**. Or locally (needs network access to the portals):

```bash
TZ=America/New_York node pipeline/radar/run.mjs
```

Offline test with generated rows:

```bash
RADAR_MOCK=1 node pipeline/radar/run.mjs
```

## Optional: Socrata app token

Without one, portals allow a modest number of requests, which is plenty for a daily run. If you see HTTP 429 errors in source health, create a free app token at any Socrata portal (for example data.cityofchicago.org, Developer settings) and save it as a repository secret named `SOCRATA_APP_TOKEN`.
