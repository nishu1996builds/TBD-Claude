# Storefront Radar: data sources

Storefront Radar queries each portal straight from your browser through the Socrata SODA API (`https://<domain>/resource/<dataset>.json`). Socrata sends CORS headers, so no server or API key is needed. An optional Socrata app token (Setup tab) raises rate limits.

## How these were verified

The sandbox used to build this app could not reach the portals directly. Each source below was checked against live API responses and working field maps that other projects captured from the real endpoints between April and October 2026: sample rows, column lists, freshness probes and SoQL filters. Every field name in the config is one that a real response returned. Socrata schemas do drift, though. San Francisco dropped three NAICS columns in July 2026 with no notice. If a source starts failing with `400 no-such-column`, check `https://<domain>/api/views/<dataset>/columns.json` and update the field names.

## Verified sources (in the app)

| Source | Portal | Dataset ID | What it contains | Freshness | Caveats |
|---|---|---|---|---|---|
| San Francisco | [data.sf.gov](https://data.sf.gov/d/g8m3-pdis) | `g8m3-pdis` | Registered Business Locations: every business tax registration, with trade name, owner, address, start dates and a point location | Daily | The host moved from `data.sfgov.org` to `data.sf.gov` on Sept 1, 2026, and the legacy redirects end Dec 31, 2026. The `naic_code` columns were removed in July 2026. Only `self_reported_naics_code` remains, and about 96% of new openings have none, so most SF leads are classified by name. |
| Chicago, business licenses | [data.cityofchicago.org](https://data.cityofchicago.org/d/r5kz-chrr) | `r5kz-chrr` | Business licenses with DBA, legal name, address, business activity, license type, lat/lon | Daily | One license can have several rows (one per activity), and dedupe merges them. Filtered to `application_type = 'ISSUE'` so renewals are excluded. |
| Chicago, pre-license food inspections | [data.cityofchicago.org](https://data.cityofchicago.org/d/4ijn-s7e5) | `4ijn-s7e5` | Food Inspections filtered to `inspection_type like 'License%'`. These health inspections happen before a food license is issued, so they are an early opening signal. | Daily | Includes schools, daycares and hospitals (`facility_type`), which are scored as professional services. A "Fail" result usually means a re-inspection is coming soon. |
| Los Angeles | [data.lacity.org](https://data.lacity.org/d/6rrh-rzua) | `6rrh-rzua` | Listing of Active Businesses: business name, DBA, address, NAICS and description, location start date, point location | Monthly, around the 15th | This is a snapshot of active businesses, not a feed of new ones. Use a 60 or 90 day window. Some rows have future dates, which the app's upper date bound drops. There is no state column, so CA is filled in. |
| New York City, issued licenses | [data.cityofnewyork.us](https://data.cityofnewyork.us/d/w7w3-xahh) | `w7w3-xahh` | DCWP Issued Licenses: business and trade name, category, split address, phone, lat/lon | About daily | DCWP licenses cover specific trades (tobacco retail, sidewalk cafes, electronics stores, laundries, pawnbrokers, home improvement), not restaurants in general. |
| New York City, new applications | [data.cityofnewyork.us](https://data.cityofnewyork.us/d/ptev-4hud) | `ptev-4hud` | DCWP License Applications: submission date, status, category, address, lat/lon | Weekly | Filtered to `application_type like 'New%'`. These are pre-license, so they get the pre-opening boost. |
| Seattle | [cos-data.seattle.gov](https://cos-data.seattle.gov/d/wnbq-64tb) | `wnbq-64tb` | Active Business License Tax Certificates: legal and trade name, NAICS code and description, address, phone | Daily | `license_start_date` is text in `YYYYMMDD` form (`dateFormat: "yyyymmdd"` in the config). `data.seattle.gov` is an alias of the canonical `cos-data.seattle.gov`. No coordinates. |
| New Orleans | [data.nola.gov](https://data.nola.gov/d/hjcd-grvu) | `hjcd-grvu` | Occupational Business Licenses: business name, owner, business type, address, start date, lat/lon | Frequent (live and current in an Aug 2026 probe) | About 24% of rows have zero or missing coordinates, and about 18% are outside Orleans Parish. A few start dates are in the future. |
| Orlando | [data.cityoforlando.net](https://data.cityoforlando.net/d/7388-4re5) | `7388-4re5` | Business Tax Receipts: business and owner name, license type, combined address, received date, phone, email | Daily | Uses `received_date`, the application date, which comes before opening. Recent rows have no usable coordinates (`gpsx`/`gpsy` are Florida State Plane, not lat/lon). This is the only source with both a phone and an email. |
| Norfolk, VA | [data.norfolk.gov](https://data.norfolk.gov/d/dpi6-sct5) | `dpi6-sct5` | Business Licenses: trading-as name, owner, NAICS, address with ZIP, opened date, lat/lon | Daily | About 25% of rows are placeholder "NO NORFOLK ADDRESS REQUIRED" records for special events, and a base filter drops them. |
| Texas sales tax permits | [data.texas.gov](https://data.texas.gov/d/jrea-zgmq) | `jrea-zgmq` | Active Sales Tax Permit Holders: taxpayer and outlet name, outlet address, NAICS, permit issue date, first sales date | Weekly, loaded Saturdays | Statewide and large, so the base filter keeps only POS-relevant NAICS ranges (retail, food service, bakeries, personal care, fitness, auto repair). `outlet_naics_code` is numeric, so the filter uses `between`. A first sales date that is still in the future is scored as pre-opening. |
| Texas liquor applications (TABC) | [data.texas.gov](https://data.texas.gov/d/mxm5-tdpj) | `mxm5-tdpj` | TABC pending original license applications: trade name, owner, license type code, address, city, ZIP, submission date | Daily | Pending liquor applications are among the earliest signals for bars and restaurants. ZIPs are ZIP+4 and get trimmed. License types are codes (MB, BG, BQ), so leads default to Bars and nightlife. |
| Colorado new liquor licenses | [data.colorado.gov](https://data.colorado.gov/d/htyp-tqzh) | `htyp-tqzh` | Recently Approved Liquor Licenses: licensee, DBA, license type, address, issue date, point location | Rolling list of recent approvals | About 98 rows have junk issue dates far in the future (2048 to 2262), and the app's upper date bound excludes them. |
| Colorado new entities | [data.colorado.gov](https://data.colorado.gov/d/4ykn-tg5h) | `4ykn-tg5h` | Business Entities in Colorado (Secretary of State): entity name, principal address, formation date, entity type | Daily, 1 to 3 day lag | No industry field, so classification relies on the name. Nonprofits (`DNC`, `FNC`) and out-of-state principal addresses are filtered out. The principal address is often a home or an agent's address. |
| Connecticut new businesses | [data.ct.gov](https://data.ct.gov/d/n7gp-d28j) | `n7gp-d28j` | Business Registry, Business Master: name, type, billing address, NAICS as "Description (code)", registration date, business email | Daily, 1 to 3 day lag | Non-stock (nonprofit) entities are excluded. The email comes from the registration form, so treat it as a business contact and follow CAN-SPAM. |
| New York State new corporations | [data.ny.gov](https://data.ny.gov/d/n9v6-gdp6) | `n9v6-gdp6` | Active Corporations: Beginning 1800 (Department of State): entity name, location address, initial filing date, entity type, county | Daily, 1 to 3 day lag | No industry field. Not-for-profits are excluded. Statewide volume is high, so lower the per-source cap or use a short window. |
| Oregon new businesses | [data.oregon.gov](https://data.oregon.gov/d/tckn-sxa6) | `tckn-sxa6` | Active Businesses, ALL (Secretary of State): business name, entity type, registry date, address | Daily, about 1 day lag | The dataset has one row per associated name or address, so it is filtered to `associated_name_type = 'PRINCIPAL PLACE OF BUSINESS'`. Assumed business names (sole-trader DBAs) are kept because they are often small shops. |
| Oregon liquor applications (OLCC) | [data.oregon.gov](https://data.oregon.gov/d/qad4-bnxp) | `qad4-bnxp` | OLCC Liquor License Applications Received: trade name, license type, address, date received, application status | Live in an Aug 2026 probe | Field names come from a live-verified field map (Aug 2026), but no independent sample confirmed that `date_received` is a true date column. If the source errors, see the troubleshooting note above. There is no city column. |

## Manual import feeds (CSV)

These are some of the best early signals, but browsers cannot fetch them directly: they are not Socrata, they have no CORS, or they are file downloads. Download the file, then use **Sources and log > Manual import (CSV)**. The importer guesses the column mapping and lets you fix it. Imported leads are scored the same way as scanned leads, and later scans do not remove them.

| Feed | Where | Tips |
|---|---|---|
| California ABC new license applications | https://www.abc.ca.gov/licensing/licensing-reports/new-applications/ | Updated daily. Set record type to "Application" and default state to CA. License types 41 (beer and wine eating place) and 47 (general eating place) are restaurants, and 48 is bars. |
| Texas Comptroller recent sales tax permits | https://comptroller.texas.gov/transparency/open-data/recent-sales-tax-permits | Weekly file of newly issued permits. Set record type to "Sales tax permit". Map the outlet name to Business name and the NAICS column to Industry. |
| Florida Sunbiz daily filings | https://dos.fl.gov/sunbiz/other-services/data-downloads/daily-data/ | Daily corporate filings. The files are fixed-width text, so open one in a spreadsheet, split the columns, and save as CSV first. Set record type to "State entity filing" and state to FL. |

Any spreadsheet with a header row works: comma, tab, semicolon or pipe separated. Dates can be `YYYY-MM-DD`, `YYYYMMDD` or `MM/DD/YYYY`.

## Checked but not included

| Candidate | Why it is not in the app |
|---|---|
| Cincinnati `ehdi-ajku` (data.cincinnati-oh.gov), Licenses and Use Permits | Live and geocoded (`entered_date`, `latitude`, `longitude`, `full_address`), but the business name and type columns could not be confirmed. Good to add once you check `columns.json`. |
| Chicago building permits `ydr8-5enu` | An early build-out signal, but there is no business name field (only work description and address). |
| Missouri new liquor licenses `dymb-xy5c` (data.mo.gov) | Fields are verified, but `original_date` is `MM/DD/YYYY` text, so SoQL cannot filter it by date. Download it as CSV and import it instead. |
| WA LCB local authority letters `vgcw-qfjm` | Held 0 rows on Sept 30, 2026. |
| Baton Rouge `xw6s-bcqm` | Has NAICS and geometry but no open-date column. |
| Kansas City `data.kcmo.org` | The license dataset was about 7 months stale in Aug 2026. |
| Austin | No business license dataset. Austin's catalog moved to the Texas portal, which is covered by the Texas sources above. |
| Iowa, Baltimore, Dallas | Not verified during this build. Add them with the guide below once you confirm field names. |

## How to add a new city

1. **Find the dataset.** Search `"<city> open data business license"` or use the Socrata catalog: `https://api.us.socrata.com/api/catalog/v1?q=business%20license&domains=<domain>`. You want a dataset with a date that marks a new business (issue, start, registration, received or application date), not just an expiry date.
2. **Read one real row.** Open `https://<domain>/resource/<dataset>.json?$limit=1` in your browser. The keys in that JSON are the API field names. The column list is at `https://<domain>/api/views/<dataset>/columns.json`.
3. **Check the date column.** Open `https://<domain>/resource/<dataset>.json?$order=<date_field> DESC&$limit=5`. If the dates look like `2026-11-03T00:00:00.000`, you are set. If they look like `20261103`, add `"dateFormat": "yyyymmdd"`. If they look like `11/03/2026`, the column is text that cannot be range-filtered, so use the CSV importer instead.
4. **Add an entry.** Either paste JSON into **Setup > Custom sources** (no code edits), or add an object to the `SOURCES` array at the top of the script in `index.html`:

```json
{
  "id": "mycity",
  "label": "My City",
  "group": "City",
  "state": "XX",
  "domain": "data.mycity.gov",
  "dataset": "abcd-1234",
  "kind": "license",
  "dateField": "issue_date",
  "nameField": "legal_name",
  "dbaField": "dba_name",
  "addressField": "address",
  "cityField": "city",
  "zipField": "zip",
  "categoryFields": ["license_type", "naics_code"],
  "latField": "latitude",
  "lonField": "longitude",
  "baseWhere": "status = 'Active'"
}
```

Field reference:

- `kind`: `license`, `registration`, `application`, `inspection`, `permit`, `tax`, or `entity`. Applications, pre-license inspections and build-out permits get the pre-opening boost. State entity filings lose a few storefront points, because their address is often a home or a registered agent.
- `addressField` can be an array, such as `["address_building", "address_street_name"]`, when the street is split across columns.
- Use `locationField` instead of `latField`/`lonField` when coordinates come as a Socrata point (`{"type":"Point","coordinates":[lon,lat]}`).
- `defaultCity`, `phoneField`, `emailField`, `statusField`, `firstSalesField` and `defaultClass` (for example `"bars"` for a liquor feed) are optional.
- `baseWhere` is any SoQL condition, and the app ANDs it with the date window. Use it to drop renewals, nonprofits or placeholder rows.

5. **Scan and check the log.** Every request appears in **Sources and log** with its full SoQL URL. A 400 error usually means a field name is wrong. A 0-row result with a 200 usually means the date window is too short, or the dataset updates monthly.

## Live check, November 6, 2026

The daily pipeline (`pipeline/radar/`) queried every source live. All 18 responded. What it found:

| Source | Newest filing on the portal | Note |
|---|---|---|
| NYC DCWP issued licenses | 2026-08-19 | The city has not updated this dataset since August. It returns leads again when NYC refreshes it. |
| NYC DCWP new applications | 2026-04-17 | Same: stale at the source, not a query problem. |
| Orlando business tax receipts | 2026-11-05 | No email column in the live data, so the email mapping was removed. Phone numbers are present. |
| NY State corporations | 2026-11-04 | Address columns are `dos_process_*` (the service-of-process address, often a lawyer or agent). Mapped, but treat these addresses as a starting point. |
| Connecticut business registry | 2026-11-04 | The best email source: about 180 new businesses a week with an owner email on file. |
| Texas TABC and sales tax permits | 2026-11-05 | The biggest source by volume. No emails; use for walk-ins and mailers. |

`data/radar/source-health.json` is refreshed every morning with each source's newest date and the columns it actually returned.
