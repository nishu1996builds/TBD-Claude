# New Outreach Channel for a POS Reseller: Catching Businesses Before They Pick a Processor

**Prepared:** 2026-11-05
**For:** Owner, POS and merchant services reseller (residual-based)
**Scope:** AI sales agents ("Harvey"), public new-business data sources, outreach compliance, and the field playbook for winning new merchants.

**How to read this memo.** Every factual claim carries a source number that maps to the Sources list at the end. Statements marked **[Estimate]** are my analysis or assumptions, not verified facts. Many pricing figures come from third-party review sites because vendor pricing pages could not be fetched from this research environment; treat those as directional and confirm on the vendor's own page before you buy.

---

## Executive summary

**The opportunity.** A restaurant or retailer chooses its POS and processor once, usually months before opening, then rarely switches. One vendor timeline puts POS research and selection at 6+ months before opening, hardware ordering at 4 to 5 months, and installation at 2 to 3 months [S30]. Whoever shows up first with a credible offer wins a residual stream that lasts for years. Public records reveal many of these businesses during that window, for free.

**Top recommendations**

1. **Build a "pre-opening radar" from 3 free government feeds, not an expensive AI SDR.** The highest-value feeds are (a) liquor license applications (California ABC publishes a daily new-applications report [S12]; New York requires applicants to notify the community board 30 days before filing [S15]), (b) commercial building and tenant-improvement permits plus health department plan reviews, and (c) new sales tax permits and state entity filings (Texas Comptroller weekly new permits [S9]; Florida Sunbiz free daily filings [S10]). Pick the feeds that cover your territory.

2. **"Harvey" is most likely the open-source AI sales agent on GitHub (ethanplusai/harvey), not the legal AI company Harvey (harvey.ai).** It is free (MIT license), runs on a Claude Pro or Max subscription, and finds, researches, emails, and follows up with local businesses [S1]. It is a reasonable low-cost email engine for *existing* merchants (switch campaigns). It cannot see businesses that are not open yet, which is where your best leads are. Pair it, or a cheap stack like Instantly plus Clay, with the government feeds in recommendation 1. Do not pay $36k to $45k a year for an enterprise AI SDR such as 11x [S4].

3. **Lead with the cash discount / dual pricing offer and free hardware, delivered with clean compliance.** A merchant on a properly built cash discount program pays little or nothing in processing, which is the easiest "yes" for a new owner watching cash. It can also produce roughly 2x to 3x the residual per merchant compared with interchange-plus pricing **[Estimate]**. Structure it as a discount from the posted card price, especially in Connecticut and Massachusetts, which restrict surcharging [S27].

4. **Make channel partners do the prospecting.** Restaurant consultants, commercial real estate brokers and landlords, CPAs, kitchen equipment dealers, franchise brokers, and food truck commissaries all see new businesses before any database does. Pay them a flat referral fee or a slice of the residual [S31]. Five good partners will likely beat any data feed **[Estimate]**.

5. **Run the math before buying tools.** On my base case ($40k/month volume, about $96/month to you on standard pricing, 25% annual attrition), a merchant is worth roughly $2,300 to you over 3 years. A $10k/month residual book in 24 months takes about 5.6 new merchants per month on standard pricing, or about 2.3 per month on cash discount **[Estimate; model in Section 5]**. That pace is achievable with a focused pre-opening channel, and it sets your tool budget: a few hundred dollars a month, not thousands.

---

## 1. "Harvey" as an AI sales agent

### 1.1 What it most likely refers to

There are two "Harveys" in AI, and only one is a sales agent.

| Candidate | What it is | Sales agent? |
|---|---|---|
| **Harvey (harvey.ai)** | Generative AI platform for law firms and corporate legal departments, backed by Sequoia, OpenAI and a16z [S2] | **No.** Searches turn up only Harvey hiring *human* SDRs to sell its legal product [S2][S3]. There is no Harvey sales agent product. |
| **Harvey (github.com/ethanplusai/harvey)** | Open-source autonomous sales agent built on Claude Code [S1] | **Yes.** This is almost certainly what you heard about. Tech newsletters covered it as an open-source sales agent that runs on a Claude subscription [S3b]. |

**Verified facts about the open-source Harvey** (from the project README [S1]):
- **What it does:** Finds businesses, researches each one, writes cold emails that cite specific facts about the business, sends them, handles replies, and works conversations toward a booked meeting. It runs in a loop (every 15 minutes by default) with a local dashboard.
- **Architecture:** Five sub-agents (Scout, Writer, Sender, Handler, Analyst), an editable "skills" library in Markdown, and a 29-signal catalog you approve before collection.
- **Lead discovery:** OpenStreetMap (free, default), with paid options such as DataForSEO (about $0.37 per 1,000 businesses), Serper and others. A free website profiler reads public pages for facts.
- **Requirements:** A Claude Pro or Max subscription with the Claude CLI (or ChatGPT via Codex CLI); no API key needed. Python 3.11+. A mailbox (Google Workspace recommended, about $7/month), ideally on a separate warmed-up domain.
- **Status:** MIT license, about 4.4k GitHub stars, release 0.2.1 at time of research.
- **Safety defaults:** Every email waits for your approval unless you switch on autopilot. LinkedIn automation is off by default because it violates LinkedIn's terms. Fully autonomous AI cold calling is explicitly excluded; voice is limited to consent-gated callbacks. The README states it is not legal advice.

**Pricing.** The software is free. Your running cost is a Claude subscription plus a $7/month mailbox plus optional paid discovery [S1]. Claude Pro is about $20/month and Max starts around $100/month **[Estimate from my background knowledge; verify on claude.com]**. Realistic all-in: $30 to $130/month.

### 1.2 Fit for a small POS reseller

| Strength | Weakness |
|---|---|
| Near-zero cost; no annual contract | It finds businesses that already exist on OpenStreetMap or the web. Pre-opening restaurants are not there yet. The README itself notes OpenStreetMap is thin for some business types [S1]. |
| Built for local-business prospecting, which matches merchant services | Requires technical comfort (command line, Python, domain warmup) |
| Approval-by-default keeps you in control of what goes out | Email only. Your best channel for new owners is in person and by phone. |
| You can edit the "skills" to teach it POS-specific pitches (cash discount, free hardware) | Early-stage open-source software (v0.2.x); expect rough edges |

**Verdict [Estimate]:** Good as a cheap, controllable email engine for a "switch and save" campaign aimed at *existing* merchants. It is not the core of a new-business strategy. The core is the data feeds in Section 2. A reasonable setup is to feed Harvey or Instantly with leads you pull from public records.

### 1.3 The 3 best alternatives for this use case

Enterprise AI SDRs are overkill for you. 11x "Alice" lists around $3,750/month billed annually (about $45k/year), with a reported floor of $36k [S4]. Artisan "Ava" pricing is now sales-gated, with reported deals of $1,500 to $5,000/month [S5]. Both are built for B2B software companies selling into mid-market firms, not for owner-operated restaurants.

| Rank | Tool | Why it fits a POS reseller | Price (third-party reported, verify) |
|---|---|---|---|
| **1** | **Instantly** (cold email platform plus lead database) | Cheapest reliable sending infrastructure with mailbox warmup and an AI reply agent. Pairs with any lead list, including your public-record feeds. | Outreach Growth about $47/mo ($37.60 annual); Hypergrowth about $97/mo. Leads database sold separately from about $47/mo [S6] |
| **2** | **Clay** (data enrichment and workflow) | The glue layer. Upload a CSV of new liquor or sales tax permit holders and Clay finds owner names, emails and phone numbers, then pushes them to Instantly or your CRM. | Free tier (100 data credits); Launch about $185/mo; Growth about $495/mo, after a March 2026 pricing overhaul [S7] |
| **3** | **Apollo.io** (B2B database, sequences, dialer) | All-in-one for prospecting *existing* small businesses by industry and zip code, with a built-in dialer. Weak on brand-new businesses. | Basic $49/user/mo annual ($59 monthly); Professional $79 annual ($99 monthly) [S8] |

**Honorable mention:** AiSDR, a true "AI SDR" that is much cheaper than 11x. Sources conflict: a Solo plan reportedly starts at $250/month, while other sources list a $900/month floor [S8b]. Consider it only if you want a hands-off AI that writes and replies for you and you are willing to pay for it.

**Recommended stack [Estimate]:** Public-record feeds (free) → Clay Launch ($185) for enrichment → Instantly Growth ($47) or Harvey ($30 to $130) for email → you or a part-time rep on the phone and in person. Total: about $250 to $350/month.

---

## 2. New business data sources (US)

### 2.1 Source-by-source assessment

| Source | Example (verified) | Freshness | Cost | Lead quality for POS |
|---|---|---|---|---|
| **Liquor license applications** | **California ABC**: a daily "New Applications" report for any report date, plus a daily raw data export of all pending and active licenses, refreshed each business day at 7 a.m. PT [S12][S13]. **New York SLA**: by statute must publish a daily-updated list of all pending applications [S14]; there is also a "Current SLA Pending Licenses" open dataset [S14b]. Applicants must notify the community board **30 days before filing** [S15]. | Daily | Free | **Highest.** A bar or restaurant, months from opening, with high card volume and a real budget. In California a 30-day protest window follows the posting [S16]. |
| **Building / tenant-improvement permits** | Socrata datasets: NYC DOB NOW approved permits (rbx6-tga4), Austin issued construction permits (3syk-w9eu), Seattle building permits (76t5-zqzr) [S17]. Most large cities publish similar data. | Daily to weekly (varies) | Free | **High, but noisy.** A permit for a restaurant build-out signals a new business 3 to 9 months out **[Estimate]**. You must filter by occupancy or work description, and the tenant name is often missing. |
| **Health department plan review / food permits** | Montgomery County, MD publishes a "Food and Pool Plan Review" dataset for new or remodeled food facilities, updated daily [S18]. Chicago's Food Inspections dataset (4ijn-s7e5) includes a "License" inspection type alongside Canvass and Complaint [S19]. | Varies widely | Free | **Very high where available.** Plan review comes before construction [S18b]. Few jurisdictions publish it as open data; most require a public records request. Chicago's "License" inspections appear to be pre-license inspections **[unconfirmed]**, which is late in the cycle. |
| **City business license portals (Socrata)** | **Chicago** Business Licenses (r5kz-chrr): 2002 to present, includes an application-created date and an "ISSUE" record type for initial applications [S20]. **San Francisco** Registered Business Locations (g8m3-pdis), reportedly refreshed daily [S21]. **Los Angeles** Listing of Active Businesses (6rrh-rzua), reportedly monthly [S21]. Also NYC, Seattle, and others. | Daily (Chicago, SF); monthly (LA) | Free | **Medium to high.** Chicago's application-created date gives you a pre-issuance signal. Many cities issue the license close to opening. |
| **Sales tax permits** | **Texas Comptroller** "Recent Active Sales Tax Permit Holders": permits issued in the past week, with taxpayer and outlet information, plus a weekly "New Sales Tax Permits" file [S9][S9b]. The full active list (jrea-zgmq) is on the Texas open data portal [S9c]. Texas taxpayers self-assign NAICS codes on application [S9d]. | Weekly | Free | **High.** Anyone selling taxable goods needs a permit before selling, so this captures retail and restaurants across the whole state. It is usually issued weeks before opening **[Estimate]**. Other states vary; most do not publish this. |
| **State Secretary of State entity filings** | **Florida Sunbiz**: free daily files of every new corporation, LLC and LP, generated each work day, via browser or SFTP [S10]. **New York** publishes Department of State corporation data on its open portal; **Colorado** reportedly offers its full entity dataset free [S22]. Paid bulk examples: Maine $600 for monthly records; Connecticut $3,000/year subscription; Indiana about $20 to $30 per filing type; West Virginia historically $12,000 full plus $1,000/month [S22]. **Ohio** reportedly publishes free monthly bulk reports of new filings [S22]. | Daily (FL) to monthly | Free to $3,000+/yr | **Earliest, but noisiest.** An LLC can be formed 6 to 12 months before opening, or for a holding company that never opens a storefront **[Estimate]**. Use it to start a watch list, then confirm with a second signal. |
| **County fictitious business name (DBA) filings** | **Los Angeles County** runs an FBN search portal [S23]. California requires publication once a week for 4 consecutive weeks in an adjudicated newspaper [S23b], so local legal-notice pages are a de facto weekly feed. | Weekly (via newspapers) | Free to low | **Medium.** These capture sole proprietors and small operators that never form an LLC. Bulk access is rare; expect manual or scraped collection. |
| **UCC filings** | A UCC-1 is filed when a business borrows, leases equipment, or takes a merchant cash advance [S24]. | Daily at most SOS offices | Scrapers about $5 to $20 per 1,000 records; brokers claim $0.20 to $0.75 per lead [S24] | **Low for new businesses** (they rarely have financing yet). **Useful for switch campaigns:** equipment leases and MCAs often signal a merchant locked into a bad deal. |

### 2.2 Commercial providers

| Provider | What it offers | Price (third-party reported, verify) | Use for you |
|---|---|---|---|
| **Data Axle (Salesgenie)** | National business database; includes a "new businesses" file [S25] | Subscriptions about $99 to $299/month; downloads use credits; per-record mailing lists reported from $0.065/record with a $150 minimum [S25] | Decent for mail and phone lists by zip and SIC. Less timely than raw government feeds. |
| **OpenCorporates** | Normalized company registry data across states | API tiers reportedly £2,250/yr (Essentials) and £6,600/yr (Starter); bulk data "from £99/year" [S26] | Overkill unless you cover many states and want one schema. |
| **Cobalt Intelligence** | Real-time Secretary of State lookup API across all 50 states; UCC API covers 11 states [S26b] | Reportedly from $1,000/month [S26b] | Built for verification by lenders, not lead discovery. **Not recommended.** |
| **Apify "actors" (scrapers)** | Dozens of ready-made scrapers for these exact feeds: Texas new sales tax permits, CA ABC new applications, Florida Sunbiz, city business licenses, building permits [S9][S12b][S10][S21][S17] | Typically pay-per-result; low cost | The fastest way to automate the feeds without writing code. Third-party and unverified, so spot-check the output against the source. |

### 2.3 Which signal comes earliest?

Ranked from earliest to latest relative to opening day **[Estimate, based on the licensing timelines cited]**:

| Signal | Typical lead time before opening | Is the POS decision still open? |
|---|---|---|
| 1. State entity filing (LLC) | 3 to 12+ months | Yes, but intent is unclear |
| 2. Commercial lease signed / CRE broker knows | 6 to 12 months | **Yes, and wide open** (only reachable through partners) |
| 3. Health plan review submitted / building or TI permit filed | 4 to 9 months | **Yes. The sweet spot.** |
| 4. Liquor license 30-day notice or application | 2 to 9 months. Sources advise starting the liquor process 9 to 12 months out, and it can take 60 to 120+ days [S30] | **Yes. The sweet spot**, with the highest card volume |
| 5. DBA / FBN filing | 1 to 6 months | Usually |
| 6. Sales tax permit issued | Weeks to 3 months | Often, but competitors are now calling |
| 7. City business license issued | Weeks | Sometimes |
| 8. Pre-opening health inspection | Days to weeks | Usually too late. Hardware is installed 2 to 3 months before opening [S30] |

**Bottom line:** The earliest *actionable* public signal is the **health plan review or commercial building/TI permit**, followed closely by the **liquor license application** (in New York, the 30-day community board notice comes even before the SLA filing [S15]). Entity filings are earlier still but too noisy to work alone. The single earliest signal is not public at all: the **commercial lease**. That is why landlord and CRE broker partnerships matter.

**Best 3 sources to start with (free):**
1. **California ABC daily New Applications report:** https://www.abc.ca.gov/licensing/licensing-reports/new-applications/ (for other states, use the equivalent: NY SLA pending licenses, Texas TABC, etc.)
2. **Texas Comptroller weekly new sales tax permits:** https://comptroller.texas.gov/transparency/open-data/recent-sales-tax-permits
3. **Florida Sunbiz daily new-entity files:** https://dos.fl.gov/sunbiz/other-services/data-downloads/daily-data/

If you work a single metro area, replace one of these with the city's Socrata building-permit or business-license feed (for example Chicago r5kz-chrr, which has an application-created date [S20]).

---

## 3. Compliance (practical, not legal advice)

**Overall posture:** Email and in-person visits are low risk. Manual phone calls to business landlines are low risk. Texts, autodialers, prerecorded or AI voices, and anything sent to a cell phone are where the lawsuits are. Many new owners list their personal cell phone on applications, so treat every number as a cell unless you know otherwise.

### 3.1 Email: CAN-SPAM
- **It applies to B2B.** The FTC says: "The law makes no exception for business-to-business email" [S32].
- **Requirements:** accurate From and routing headers, a non-deceptive subject line, identification as an ad, a valid physical postal address, a working opt-out, and opt-outs honored within 10 business days [S32].
- **Penalty:** up to $53,088 per violating email, per the FTC guide (inflation-adjusted, so check the current figure) [S32].
- **Practical:** Cold email to a business address is legal if compliant. Send from a separate domain, keep volume low per mailbox, and stop above about a 3% bounce rate (the Harvey README's guidance) [S1].

### 3.2 Calls: TCPA and Do Not Call
- **Do Not Call:** The FTC's Telemarketing Sales Rule exempts most calls to a business made to solicit that business [S33]. The national registry covers "residential subscribers" [S33]. A **sole proprietor's personal cell phone is a gray area**, so scrub against the DNC list anyway.
- **Autodialers:** *Facebook v. Duguid* (2021) narrowed the federal autodialer definition to equipment that uses a random or sequential number generator [S34]. Even so, B2B calls are **not** exempt from the TCPA's wireless-number rules when an autodialer or prerecorded voice is used [S33].
- **AI voices:** In February 2024 the FCC ruled that AI-generated voices are "artificial" voices under the TCPA, which requires prior express consent before calling a cell phone [S35]. **Do not use AI voice agents for cold outbound calls.** Harvey's own roadmap excludes it [S1].
- **Shifting ground:** In June 2025 the Supreme Court held (*McLaughlin Chiropractic v. McKesson*) that district courts are not bound by FCC interpretations of the TCPA [S36]. The Eleventh Circuit vacated the FCC's "one-to-one consent" rule in *Insurance Marketing Coalition v. FCC* (2025) [S36b]. Expect inconsistent outcomes across courts, which argues for a conservative approach.

### 3.3 Texts and state "mini-TCPAs"
- **Texts count as calls** under the TCPA for consent purposes. Get consent before sending a marketing text **[standard reading; confirm with counsel]**.
- **Florida (FTSA):** amended in 2023 to narrow the autodialer definition and add a 15-day cure period after a STOP reply in text class actions [S37]. Sources say it still "aggressively targets" unsolicited calls [S35b].
- **Oklahoma (OTSA, 2022)** and **Maryland (Stop the Spam Calls Act, 2023)** regulate automated calls and texts. Maryland requires prior express written consent for automated solicitations to cell phones and landlines [S37].
- **Texas (SB 140, effective September 1, 2025):** extended the state telemarketing law to texts (SMS, MMS, RCS). Unless an exemption applies, senders must register with the Texas Secretary of State (Form 3401, $200/year) [S38]. Exemptions are narrow, and no clear B2B exemption appears in the sources reviewed [S38].
- **Practical rule [Estimate]:** No cold texts. Text only after a person gives you their number and agrees to receive texts (for example at a walk-in visit or on a web form).

### 3.4 Using public records for marketing
- **Most open-data portals allow commercial reuse.** For example, Austin and Seattle permit datasets are published as public domain [S17]. Florida Sunbiz data is offered free "for informational purposes," "as is" [S10].
- **Some states regulate commercial use of public records.** Arizona (A.R.S. 39-121.03) requires a requester to state any commercial purpose, explicitly including "obtaining names and addresses from public records for the purpose of solicitation." It allows higher fees for commercial requests and penalizes misstatement or misuse [S39].
- **Practical:** Read each portal's terms page before automating. Disclose commercial purpose on any formal records request. Do not scrape sites whose terms prohibit it (Harvey avoids LinkedIn for this reason) [S1]. Do not use personal home addresses from filings for door-knocking; go to the business premises.

---

## 4. The playbook: how successful POS and merchant services agents win new businesses

### 4.1 Timing
- **Show up 2 to 6 months before opening**, when the owner is building the menu, ordering equipment and choosing a POS [S30]. After installation, you are selling a switch, which is much harder.
- **First touch should be in person or by phone, backed by a one-page offer by email.** New owners are on site supervising build-out, so a visit to the construction site is often the highest-converting touch **[Estimate, common field practice]**.
- **Re-touch at each public milestone:** permit filed, liquor application, sales tax permit, license issued. Each record is a new reason to call.

### 4.2 Offers that win
| Offer | What it is | Notes |
|---|---|---|
| **Free hardware** | Many ISOs give agents free terminals or full POS systems for merchants. United Bank Card (now North) paid $350 to $500 upfront per merchant that took a free terminal [S40]. Total Merchant Services added its Groovv POS to a free-hardware program [S40]. | "Free" usually means a contract term, an equipment return clause, or a monthly software fee. Disclose this clearly; deals that hide it get canceled and hurt referrals [S40]. |
| **Cash discount / dual pricing** | The posted price is the card price; cash payers get a discount. Per one vendor, this is legal in all 50 states when structured as a price reduction [S27]. | Connecticut and Massachusetts ban surcharges [S27]. A fee added at the register on top of the shelf price is a surcharge under another name. Signage must appear before purchase and the discount on the receipt [S40b]. |
| **Surcharging** | A fee added to credit card transactions. One source reports Visa caps credit surcharges at 3% with 30-day notice to the acquirer [S27]. | Not allowed on debit cards. State rules vary; one count says 22 states ban or restrict it [S27]. Cash discount is the safer default. |
| **Interchange-plus with a transparent markup** | Competitive SMB markup is about 0.20% to 0.50% plus 10 to 20 cents per transaction [S29] | Best for sophisticated or larger operators who will shop around |
| **Speed and service** | Same-week install, menu build, staff training on opening week | Your real edge over Square and Toast's national sales teams **[Estimate]** |

### 4.3 Partnerships (where new businesses surface before any database)
| Partner | Why they see the merchant early | Suggested arrangement [Estimate] |
|---|---|---|
| **Restaurant consultants / opening specialists** | Hired months before opening to plan build-out and operations | 10% to 20% residual share or $250 to $500 per signed merchant |
| **Commercial real estate brokers and retail landlords** | Know about the lease before anything else exists | Flat referral fee; offer to include "POS and payments set up" as a tenant perk |
| **Kitchen equipment dealers and contractors** | Quote the build-out | Reciprocal referrals |
| **CPAs and bookkeepers** | Often see what clients pay for processing; Green Sheet lists CPAs as likely referral partners [S31] | Residual share; free statement analysis for their clients |
| **Banks and SBA lenders (local and community banks)** | Fund the opening and know the timeline | Formal referral agreement; many banks lack their own POS offering |
| **Franchise brokers / franchise development teams** | Place new franchisees months before opening | Check the brand's mandated POS first; target brands without one |
| **Food truck commissaries and shared kitchens** | Every new food truck and ghost kitchen must use one | Sponsor a "launch kit" (free reader plus cash discount) |
| **Liquor license attorneys and expediters** | Handle the ABC or SLA filing | Referral fee; they are often the first professional the owner hires |

**Referral agreement basics:** Define up front whether the partner gets a flat fee or an ongoing residual, and who handles closing and onboarding [S31]. Your closing experience reflects on the partner, so protect it [S31b].

### 4.4 Benchmarks
| Metric | Figure | Source / status |
|---|---|---|
| Agent residual split | Commonly 50/50 or 60/40 in the agent's favor; some programs advertise 70% to 80%, but the buy rate matters more than the headline split | [S28] verified as reported ranges |
| Merchant-level salesperson (employee) share | Often only 5% to 15% of total margin | [S28] |
| Upfront bonus per merchant | $350 to $500 (United Bank Card free-terminal program) | [S40] |
| Annual merchant attrition | 22% to 27% industry average (First Annapolis); 23.6% overall and 24.1% for SMB (Strawhecker); 10% or less for integrated software | [S41] (dates uncertain) |
| Restaurant first-year failure | About 26% (Parsa, Ohio State); about 17% for full-service startups in BLS-based analyses | [S42] |
| Portfolio resale value | Typically 18x to 28x monthly residual; premium books 26x to 36x | [S43] broker figures |
| Average card volume per Toast location | About $1.3M/year (about $109k/month), calculated from $195.1B 2025 GPV across an average of about 149k locations | [S44] inputs verified; division is my **[Estimate]**. Toast skews to established restaurants. |
| Small business card volume | $220k/year average SMB (Strawhecker, 2018) | [S45] dated |

**Implication:** $40k/month ($480k/year) for a new independent restaurant is a conservative base case. It sits between the general SMB average and the average Toast location.

---

## 5. Residual math model [Estimate]

### 5.1 Assumptions
| Input | Standard pricing | Cash discount program | Basis |
|---|---|---|---|
| Monthly card volume | $40,000 | $40,000 | Conservative vs. benchmarks in 4.4 |
| Net margin pool (after interchange and processor buy rate, including per-item fees) | 0.40% = $160/mo | 1.00% = $400/mo | Markup range in [S29]; cash discount margin is my estimate and varies widely by program |
| Your split | 60% | 60% | [S28] |
| **Your monthly residual per merchant** | **$96** | **$240** | |
| Annual attrition | 25% (monthly retention 97.6%) | 25% | [S41], adjusted for new-business failure [S42] |

### 5.2 Value of one merchant
| Measure | Standard ($96/mo) | Cash discount ($240/mo) |
|---|---|---|
| 12 months, no attrition | $1,152 | $2,880 |
| 36 months, no attrition | $3,456 | $8,640 |
| **36 months, attrition-adjusted (expected value)** | **$2,343** | **$5,857** |
| Expected lifetime at 25% attrition | about 42 months | about 42 months |
| Resale value at 20x monthly residual | $1,920 | $4,800 |
| Plus typical upfront bonus | $350 to $500 | $350 to $500 |

**Sensitivity (36-month expected value, standard / cash discount):** 15% attrition: $2,754 / $6,885. 25% attrition: $2,343 / $5,857. 35% attrition: $1,975 / $4,937.

### 5.3 How many new merchants per month to hit a target
Accounts for 25% annual attrition on the book as it builds.

| Target monthly residual | Active merchants needed (std / CD) | New per month to reach it in **24 months** (std / CD) | New per month to reach it in **36 months** (std / CD) | New per month to *sustain* once there (std / CD) |
|---|---|---|---|---|
| $5,000 | 52 / 21 | 2.8 / 1.1 | 2.1 / 0.9 | 1.2 / 0.5 |
| $10,000 | 104 / 42 | 5.6 / 2.3 | 4.3 / 1.7 | 2.5 / 1.0 |
| $20,000 | 208 / 83 | 11.3 / 4.5 | 8.5 / 3.4 | 4.9 / 2.0 |

**Funnel check [Estimate]:** At 5 to 6 new merchants per month, assuming a 20% close rate on qualified pre-opening conversations and 25% of contacted leads converting to a real conversation, you need about 100 to 120 *qualified* new-business leads per month. One mid-size metro's liquor applications, food-related building permits and new sales tax permits should supply that.

---

## 6. 30-day action plan

| Days | Action | Output |
|---|---|---|
| **1 to 3** | Pick 1 to 2 metros. List which feeds cover them: state liquor board, city Socrata permits and licenses, county health plan review, state sales tax or SOS. Read each portal's terms. | Source map with URLs and refresh cadence |
| **4 to 7** | Set up a free pipeline: download or subscribe to each feed (Socrata export, CA ABC daily CSV, Texas weekly file, or Sunbiz SFTP). Filter to food service, bars and retail NAICS or license types. Optionally use an Apify actor for automation. | Weekly lead sheet (Google Sheet or CRM) |
| **5 to 10** | Buy a separate sending domain and Google Workspace mailbox and start the 2 to 4 week warmup [S1]. Sign up for Clay (free tier first) and Instantly Growth, or install Harvey if you are comfortable with the command line. | Outreach infrastructure warming |
| **7 to 10** | Confirm with your ISO: free hardware terms, cash discount program details, buy rates, split, and upfront bonuses. Build a one-page offer ("Free POS + $0 processing via cash discount + opening-week install"). Check the cash discount rules in your states. | Offer sheet and compliance checklist |
| **8 to 14** | Partner sprint: list and contact 20 potential partners (restaurant consultants, 5 CRE brokers, equipment dealers, 3 CPAs, liquor license expediters, commissaries). Offer a written referral agreement. | 5+ partner meetings booked |
| **10 to 30** | Work the radar every week: visit sites with active permits, call liquor and sales tax applicants on business lines, email owners found through Clay. Log every touch. Phone and email only; no cold texts or AI voice. | 25+ pre-opening conversations |
| **15 to 30** | Run a small switch campaign (Harvey or Instantly, approval mode on) to existing restaurants in the same metro, offering a free statement analysis. | Pipeline from existing merchants |
| **30** | Review: leads by source, conversation rate, close rate, cost. Cut the worst source, double the best. Re-run the Section 5 model with your real numbers. | Go / no-go on scaling |

**Success criteria at Day 30 [Estimate]:** 100+ qualified new-business leads in the system, 25+ conversations, 3+ signed partners, and 2 to 4 signed merchants or merchants in underwriting.

---

## 7. What is verified vs. estimated

**Verified (with sources):** What the open-source Harvey does and requires; that harvey.ai is a legal AI company with no sales agent product; the existence, cadence and access method of CA ABC, NY SLA, Texas Comptroller, Florida Sunbiz, and the Chicago, SF, NYC, Austin and Seattle datasets; CAN-SPAM B2B coverage and requirements; the FCC AI-voice ruling; *Duguid* and *McLaughlin*; Texas SB 140 registration; Arizona commercial-purpose rules; Toast 2025 GPV and locations; published ranges for splits, attrition, failure rates and portfolio multiples.

**Third-party reported, not verified on the vendor site:** All SaaS pricing (11x, Artisan, AiSDR, Instantly, Clay, Apollo, Data Axle, OpenCorporates, Cobalt). Some state bulk-data prices (Colorado, Ohio). The refresh frequency for SF and LA datasets. Whether Chicago "License" inspections are pre-opening.

**My estimates:** Signal lead times before opening; cash discount margin (1.0%); the residual model; partner fee levels; funnel conversion rates; Claude subscription prices; the recommended tool stack and its cost.

---

## Sources

- [S1] Harvey open-source sales agent, README: https://github.com/ethanplusai/harvey
- [S2] Harvey (legal AI) job listing and company description: https://startup.jobs/manager-sales-development-harvey-8062635 ; https://builtin.com/job/manager-sales-development/9761379
- [S3] Harvey SDR job postings (human SDRs): https://www.builtinsf.com/job/sales-development-representative/10320473
- [S3b] Coverage of open-source Harvey: https://alphasignal.ai/news/harvey-turns-claude-subscriptions-into-a-full-open-source-sales-agent ; https://hermes-ai.net/news/harvey-turns-claude-subscriptions-into-a-full-open-source-sales-agent/
- [S4] 11x pricing (third-party): https://www.landbase.com/blog/11x-ai-pricing ; https://marketbetter.ai/blog/11x-ai-pricing-2026/ ; https://getbreakout.ai/blog/11x-pricing-ai-sdr-cost-2026
- [S5] Artisan pricing (third-party): https://landbase.com/blog/artisan-ai-pricing ; https://pricingsaas.com/companies/artisan ; https://www.joinvalley.co/blog/artisan-alternatives-2026
- [S6] Instantly pricing: https://instantly.ai/pricing.md ; https://www.landbase.com/blog/instantly-ai-pricing ; https://marketbetter.ai/blog/instantly-pricing-breakdown-2026/
- [S7] Clay pricing: https://pricingsaas.com/companies/clay/diffs/2026W12 ; https://crustdata.com/reviews/clay ; https://www.joinvalley.co/blog/clay-pricing-and-credits-explained-2026
- [S8] Apollo pricing: https://docket.io/resources/research/apollo-pricing ; https://www.landbase.com/blog/apollo-pricing ; https://www.capterra.com/p/158696/Apollo/pricing/
- [S8b] AiSDR pricing: https://aisdr.com/pricing.md ; https://costbench.com/changelog/aisdr-pricing-update-2026-08/ ; https://toolradar.com/tools/aisdr/pricing
- [S9] Texas Comptroller, Recent Sales Tax Permits: https://comptroller.texas.gov/transparency/open-data/recent-sales-tax-permits ; Apify Texas actor: https://apify.com/deadwood_data_solutions/texas-new-business-leads
- [S9b] Texas Comptroller tax files list (weekly New Sales Tax Permits): https://comptroller.texas.gov/data/openrec/requests/taxfiles.php
- [S9c] Active Sales Tax Permit Holders (data.gov catalog): https://catalog.data.gov/dataset/active-sales-tax-permit-holders
- [S9d] Texas Comptroller NAICS note: https://comptroller.texas.gov/transparency/revenue/watch/naics
- [S10] Florida Sunbiz daily data: https://dos.fl.gov/sunbiz/other-services/data-downloads/daily-data/ ; quarterly: https://dos.fl.gov/sunbiz/other-services/data-downloads/quarterly-data
- [S12] California ABC New Applications report: https://www.abc.ca.gov/licensing/licensing-reports/new-applications/
- [S12b] Apify CA liquor license monitor: https://apify.com/scrapersdelight/liquor-license-monitor
- [S13] California ABC Licensing Reports: https://www.abc.ca.gov/licensing/licensing-reports
- [S14] NY ABC Law 110-C (daily pending list): https://newyork.public.law/laws/n.y._alcoholic_beverage_control_law_section_110-c
- [S14b] NY Current SLA Pending Licenses dataset: https://catalog.data.gov/dataset/current-sla-pending-licenses
- [S15] NYC community board 30-day notice: https://www.nyc.gov/site/brooklyncb9/resources/liquor-licenses.page ; https://cbmanhattan.cityofnewyork.us/cb12/wp-content/uploads/sites/2/2026/01/2026.01-CB12M-SLA-Licensing-Manual.pdf
- [S16] California ABC protest FAQ: https://www.abc.ca.gov/contact/file-complaint/protest-against-alcoholic-beverage-license-application/frequently-asked-questions ; https://www.abc.ca.gov/form/abc-510
- [S17] Building permit datasets (NYC rbx6-tga4, Austin 3syk-w9eu, Seattle 76t5-zqzr), via: https://apify.com/jserle/nyc-dob-permits-feed ; https://apify.com/formal_sadness_xvx/us-building-permits ; https://apify.com/xtracto/building-permits
- [S18] Montgomery County MD Food and Pool Plan Review: https://catalog-old.data.gov/dataset/food-and-pool-plan-review
- [S18b] Plan review purpose (Ewing Twp, NJ): https://ewingnj.org/documents-list/department-documents/health/677-health-plan-review-guide/file ; Southern Nevada Health District: https://southernnevadahealthdistrict.org/?p=299506
- [S19] Chicago Food Inspections: https://catalog.data.gov/dataset/food-inspections ; https://dev.to/mayd-it/restaurant-health-inspection-data-by-city-apis-and-traps-2o9p
- [S20] Chicago Business Licenses: https://catalog.data.gov/dataset/business-licenses ; https://www.johnsnowlabs.com/marketplace/chicago-business-licenses/ ; https://www.chicago.gov/content/dam/city/depts/bacp/general/flyerdataportal20150325.pdf
- [S21] City license feeds (SF g8m3-pdis, LA 6rrh-rzua): https://apify.com/j0401/ca-business-registry ; https://apify.com/malonestar/city-business-license-leads
- [S22] State bulk data: https://blog.opencorporates.com/2025/09/15/sourcing-data-directly-from-us-state-registries ; https://www.maine.gov/sos/corporations-commissions/bulk-data ; https://test-cd.ct.gov/-/media/connecticut-interactive/files/bulk-data-images-subscription---request-form.pdf ; https://www.in.gov/sos/business/files/Regulatory-Analysis-Business-Entity-Bulk-Data-Fees-LSA-25-155-OMB-2025-01R.pdf ; https://www.wvlegislature.gov/Bill_Text_HTML/2006_SESSIONS/RS/signed_bills/house/HB4458%20ENR_signed.pdf ; https://www.sos.ky.gov/bus/Pages/Bulk-Data-Service.aspx ; https://zephira.ai/colorado-business-entity-search/ ; https://zephira.ai/ohio-business-entity-search/
- [S23] LA County FBN search: https://lavote.gov/fbn-search
- [S23b] LA County FBN filing requirements: https://lavote.gov/home/county-clerk/fictitious-business-names/filing/requirements
- [S24] UCC filing lead sources: https://apify.com/deadwood_data_solutions/ucc-filing-leads ; https://apify.com/intelscrape/ucc-financing-scraper ; https://debanked.com/?p=143925
- [S25] Data Axle / Salesgenie pricing: https://www.g2.com/products/salesgenie-by-data-axle/pricing ; https://trustradius.com/products/data-axle-genie/pricing ; https://prospeo.io/s/data-axle-pricing-reviews-pros-and-cons
- [S26] OpenCorporates pricing: https://opencorporates.com/pricing/ ; https://dev.to/openregistry/opencorporates-alternatives-compared-1ip1 ; https://zephira.ai/opencorporates-pricing-explained-2026-plans-api-limits-licensing-and-what-it-means-in-production/
- [S26b] Cobalt Intelligence: https://blog.cobaltintelligence.com/post/how-do-credits-work-in-cobalt-intelligences-pricing-model ; https://www.capterra.co.nz/software/1021610/secretary-of-state-api
- [S27] Surcharge and cash discount rules: https://lifelongpos.com/resources/blog/cash-discount-vs-surcharge-state-by-state ; https://lifelongpos.com/resources/blog/visa-surcharge-rules-2026-compliance-guide ; https://sasquatchstudio.co/blog/credit-card-surcharge-laws-by-state-2026 ; https://www.katalystos.com/blog/is-credit-card-surcharging-legal-in-your-state
- [S28] Residual splits: https://shawmerchantgroup.medium.com/credit-card-processing-residual-income-merchant-services-commission-structure-ffef0fa69fff ; https://www.orderpin.co/?p=8902 ; https://www.digitaltransactions.net/magazine_articles/splitting-the-difference/
- [S29] Markups and basis points: https://www.cardfellow.com/blog/basis-points ; https://merchantmaverick.com/basis-points-calculate ; https://chargebacks911.com/interchange-plus-pricing.md
- [S30] Restaurant opening timelines: https://loop.fans/blog/opening-a-restaurant-checklist ; https://aaronallen.com/blog/opening-a-restaurant ; https://www.orderout.co/blog/checklist-opening-restaurant/
- [S31] Referral partner structures (Green Sheet): https://greensheet.com/ebooks/gs190501/files/basic-html/page33.html ; https://greensheet.com/emagazine&article_id=6303
- [S31b] American Banker on referrals: https://www.americanbanker.com/payments/news/the-inside-scoop-working-with-referrals
- [S32] FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- [S33] DNC and B2B: https://www.govinfo.gov/content/pkg/FR-2005-04-13/html/05-7346.htm ; https://webarchive.library.unt.edu/web/20121027205655/http://business.ftc.gov/documents/alt129-qa-telemarketers-sellers-about-dnc-provisions-tsr ; https://www.compliancepoint.com/marketing-compliance/well-what-about-you-why-b2b-marketers-ask-it/
- [S34] Facebook v. Duguid: https://www.reedsmith.com/our-insights/blogs/consumer-finance-spotlight/102k13m/scotus-unanimously-reverses-ninth-circuit-in-facebook-v-duguid-limits-tcpa-auto ; https://en.wikipedia.org/wiki/Facebook,_Inc._v._Duguid
- [S35] FCC AI voice ruling (Feb 2024): https://wiley.law/alert-FCC-Extends-Regulatory-Reach-Over-AI-Announces-TCPA-Restrictions-Cover-AI-Generated-Voices-in-Outbound-Calls ; https://infobytes.orrick.com/2024-02-16/fcc-ruling-determines-ai-calls-are-subject-tcpa-regulations/
- [S35b] B2B and Florida FTSA note: https://pharosiq.com/blog/what-a-b2b-revenue-team-needs-to-know-about-tcpa-and-ai-bot-cold-calls/
- [S36] McLaughlin Chiropractic v. McKesson: https://www.faegredrinker.com/en/insights/publications/2025/6/supreme-court-decides-mclaughlin-chiropractic-associates-v-mckesson-corp ; https://www.cooley.com/news/insight/2025/2025-07-01-mclaughlin-chiropractic-us-supreme-court-invites-new-era-of-tcpa-jurisprudence
- [S36b] One-to-one consent vacatur: https://www.manatt.com/insights/newsletters/client-alert/mclaughlin-v-mckesson-what-the-supreme-court-s-decision-means-for-tcpa-litigation-compliance
- [S37] Florida, Oklahoma, Maryland mini-TCPAs: https://www.mcguirewoods.com/client-resources/alerts/2023/5/pro-business-amendments-to-floridas-mini-tcpa-now-in-effect ; https://www.lewisrice.com/publications/florida-softens-its-mini-tcpa-statute-while-maryland-enacts-its-own/ ; https://goodwinlaw.com/en/insights/publications/2023/02/02_28-mini-tcpa-laws-you-should-know
- [S38] Texas SB 140: https://www.jw.com/news/insights-texas-tcpa-sb-140/ ; https://www.paulhastings.com/insights/ph-privacy/marketing-texts-in-texas-sb-140-broadens-state-telemarketing-regulations ; https://sakari.io/blog/texas-sms-marketing-laws-and-regulations-compliance-guide-for-businesses-texting-texas-customers
- [S39] Arizona commercial-purpose public records (A.R.S. 39-121.03): https://azdot.gov/sites/default/files/2019/08/15-046-arizona-public-records-law-statutory-excerpts.pdf
- [S40] Free hardware programs: https://www.americanbanker.com/payments/news/united-bank-card-claims-success-with-free-pos-systems-PS3008728 ; https://www.digitaltransactions.net/tms-adds-its-groovv-pos-system-to-... ; https://www.websiteplanet.com/credit-card-processing/pos-pros ; https://babyboomer.org/?p=710984
- [S40b] Cash discount signage (Green Sheet): https://greensheet.com/emagazine&article_id=5739
- [S41] Merchant attrition: https://www.americanbanker.com/payments/news/effective-communication-can-stem-merchant-exodus ; https://www.digitaltransactions.net/magazine_articles/the-war-on-attrition/ ; https://www.digitaltransactions.net/merchant-attrition-dipped-in-2014-but-larger-isos-and-acquirers-saw-less-benefit/
- [S42] Restaurant failure rates: https://news.osu.edu/restaurant-failure-rate-much-lower-than-commonly-assumed-study-finds/ ; https://econ.ucsb.edu/%7Etedb/Courses/Ec1F07/restaurantsfail.pdf ; https://www.duck-hub.com/blog/restaurant-failure-rate-statistics
- [S43] Portfolio multiples: https://733park-demo.pages.dev/guides/merchant-portfolio-valuation ; https://www.ctacquisitions.com/sell-your-business/payment-processing/ ; https://digitaltransactions.net/how-the-details-strongly-influence-merchant-portfolio-valuations/
- [S44] Toast Q4 and FY2025 results: https://www.businesswire.com/news/home/20260212058106/en/Toast-Announces-Fourth-Quarter-and-Full-Year-2025-Financial-Results
- [S45] SMB card volume (Strawhecker via Digital Transactions): https://www.digitaltransactions.net/small-merchants-are-generating-bigger-payment-volumes-analysis-finds/

*Note on research limits:* Many vendor and government sites (instantly.ai, apollo.io, aisdr.com, data.texas.gov, data.sfgov.org, alphasignal.ai) could not be fetched directly from this research environment. Their facts above come from search-result excerpts and third-party pages. GitHub was fetched directly.
