# Launch Posts

Three launch surfaces, each with different expectations:

| Where | What to launch | Why |
|---|---|---|
| Indie Hackers | Ratecard | IH readers like honest build stories, including the numbers |
| Product Hunt | Ratecard | A polished product with clear visuals |
| Hacker News (Show HN) | The FREE rate calculator | HN favors things people can try free, right away, with no signup. A paid Gumroad link would likely get flagged or ignored. |

---

## 1. Indie Hackers: "I built" post

**Where:** Indie Hackers, a relevant group or the main feed. Check posting guidelines first.
**Link placement:** One link at the end is normal on IH. Use the product URL.

**Title:** I built an offline pricing tool for freelancers as a single HTML file. Here's why, and my (very small) numbers so far.

**Body:**

I run a business reselling POS systems to merchants, and I tend to approach problems like a strategy consultant: find where the money leaks, then build the smallest tool that fixes it.

For freelancers and consultants, one of the biggest leaks is pricing. Most people set a rate by adding up costs and knocking a bit off so it feels safe. So I built **Ratecard**, a pricing studio that runs as one HTML file in your browser.

**What it does**

1. **Floor rate.** Enter take-home income, tax, expenses, time off, and billable utilization. You get a minimum hourly rate, day rate, and monthly revenue target, plus a "utilization trap" chart showing how the floor climbs when billable time drops.
2. **Value pricing.** Estimate revenue gained, costs saved, and risk reduced for the client, discount for uncertainty, and see a recommended fee range with the client's ROI multiple at each price.
3. **Good / Better / Best proposal builder.** Editable tiers with a live anchoring check (for example, it flags when Best is less than 1.6x Better, or Good is too close to Better). Prints to a clean PDF.
4. **Change order generator.** Enter the extra request, hours, and a rush level (1x to 2x). It writes a friendly or formal message you copy and send.
5. **Pricing playbook.** 10 tactics with word-for-word scripts: diagnosing "too expensive," trading scope instead of discounting, raising rates with 60 days notice, and more.

Six currencies (USD, EUR, GBP, INR, CAD, AUD). Light and dark mode.

**Why a single offline file**

Rates, income targets, and client budgets are sensitive. I didn't want them on a server, including mine. No account, no subscription, nothing to install. Inputs save in your browser only.

**The honest numbers**

My Gumroad store has had 4 product views in 3 months and no sales. I built first and assumed people would show up. They didn't. So now I'm doing the part I skipped: a free rate calculator as the front door, and writing useful posts in places where freelancers already talk.

**What I'd love feedback on**

- Is $24 right for a one-time tool like this, or would you expect $19 or $29?
- Is "single offline file" a selling point for you, or a concern?
- Which of the five modules would you actually use first?

[YOUR STORY: optional, what made you start on pricing tools specifically]

Ratecard is $24, and the code LAUNCH19 takes $5 off through Nov 20: https://nishulegacy.gumroad.com/l/ratecard/LAUNCH19

If you just want the rate math, the free calculator is here: https://nishu1996builds.github.io/TBD-Claude/free/rate-calculator/

---

## 2. Product Hunt launch kit: Ratecard

**Launch timing:** Product Hunt days start at 12:01 a.m. Pacific. Have the first comment ready to post the moment it goes live, and plan to be around to reply through the day.
**Link:** https://nishulegacy.gumroad.com/l/ratecard (mention LAUNCH19 in the first comment, valid through Nov 20)

### Name
Ratecard

### Tagline (under 60 characters)

Primary:
> Offline pricing studio for freelancers and consultants

Alternates:
> Price your freelance work from value, not from fear
> Floor rate, value pricing, and 3-tier proposals offline

### Description (under 260 characters)

> Ratecard is a single-file pricing studio that runs offline in your browser. Find your floor rate, price on client ROI, build a Good/Better/Best proposal that prints to PDF, and turn scope creep into paid change orders. No account. Six currencies.

### Topics (suggested)
Freelance, Productivity, Sales, Consulting (pick from what Product Hunt offers at launch time)

### Maker's first comment

> Hi Product Hunt, I'm [YOUR NAME], the maker of Ratecard.
>
> I run a business reselling POS systems to merchants, so I spend a lot of time around small businesses and how they set prices. Freelancers and consultants have the same problem with fewer tools: most rates are a guess based on costs, with a bit knocked off so it feels safe.
>
> [YOUR STORY: one or two honest lines on why you built this]
>
> Ratecard walks you through five steps:
>
> 1. **Floor rate:** the minimum you can charge after tax, expenses, and unbillable time. The utilization trap chart shows how fast that minimum climbs when billable hours drop.
> 2. **Value pricing:** estimate what the project is worth to the client and see their ROI at every price.
> 3. **Three-tier proposal:** Good / Better / Best, with a live anchoring check, printed to PDF.
> 4. **Change orders:** turn "could you also..." into a ready-to-send message with rush pricing.
> 5. **Playbook:** 10 pricing tactics with word-for-word scripts.
>
> It's one HTML file. No account, no subscription, works offline, and your numbers stay in your browser.
>
> Launch code **LAUNCH19** takes $5 off through Nov 20.
>
> I'd really like to hear which module you'd use first, and what's missing. I'll be here all day answering questions.

### Gallery: 5 images with captions

Existing covers are in `dist/covers/` in the private `ratecard` repo, at 1280x720. There are three cover PNGs and a quick-start page. Image 4 needs to be exported from `quickstart.html`, and image 5 does not exist yet: take a screenshot from the app.

| # | File | Caption |
|---|---|---|
| 1 | `cover-1.png` | Price from value, not from fear. Floor rate, value pricing, three-tier proposals, and change orders in one offline file. |
| 2 | `cover-2.png` | Give clients a choice between yeses. Editable Good / Better / Best packages with a live anchoring check, printed to PDF in one click. |
| 3 | `cover-3.png` | Charge for the outcome, not the hours. Estimate revenue gained, costs saved, and risk reduced, and see the client's ROI at every price. |
| 4 | `quickstart.html` (export to PNG) | Your first better price in ten minutes. Save the file, double-click it, start at Floor rate. No install, no account. |
| 5 | [CREATE: screenshot of the Floor rate tab showing the utilization trap chart] | The utilization trap: see how your minimum rate climbs when billable time drops, before a slow quarter shows you. |

Optional extra: a screenshot of the Change order tab with a filled-in message, captioned "Turn 'could you also...' into a paid change order. Pick a rush level, copy the message, send it."

### Reply bank for common PH questions

- **"Why not a web app?"** Your rate and your client's budget are sensitive. A single file means nothing leaves your machine and there's no account to make.
- **"Does it sync across devices?"** No. Inputs save in the browser you use. You can open the file on any device, but each browser keeps its own inputs.
- **"Which currencies?"** USD, EUR, GBP, INR, CAD, AUD.
- **"Does it work on mobile?"** Yes, it opens in any modern browser on desktop or phone.
- **"Will there be updates?"** Buyers get free updates to future versions.

---

## 3. Hacker News: Show HN (free calculator)

**Post only once the free calculator is live, works on mobile, and needs no signup.** Before posting, confirm the description below matches what the free calculator actually does today, and edit it if not.

**Rules to respect:** Show HN is for things people can try. No signup walls, no landing pages. Don't ask friends to upvote: HN detects voting rings and penalizes them. Answer comments plainly and accept criticism.

**Suggested time:** a weekday morning, US Eastern.

**URL field:** https://nishu1996builds.github.io/TBD-Claude/free/rate-calculator/

**Title options (HN titles are plain and descriptive):**
> Show HN: Freelance hourly rate calculator that accounts for unbillable hours

> Show HN: A free rate calculator for freelancers, runs in the browser

**Text (optional for a URL post; if used, add it as your first comment):**

> I made a free hourly rate calculator for freelancers. Most calculators I found divide your costs by every hour you work, which assumes you bill 100% of your time. In practice a lot of time goes to sales, admin, invoicing, and gaps between projects, and that changes the minimum rate a lot. With one example set of inputs, the floor goes from about $85/hr at 100% billable to about $142/hr at 60%.
>
> It runs in the browser with no signup. [VERIFY: confirm whether any data is sent anywhere, and state it plainly.]
>
> I'd appreciate feedback on the math and on which assumptions should be adjustable.

**If someone asks whether there's a paid version, answer honestly:**
> Yes, I also sell a fuller offline tool called Ratecard (value pricing, three-tier proposals, change orders). The calculator here is free and stands on its own.
