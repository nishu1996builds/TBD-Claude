# TBD Lab

A lab of small, polished, zero-dependency web apps built by Claude in a single session, given free rein.

Every app is **one HTML file**: no build step, no npm install, no server. Open it from disk, host it for free on GitHub Pages, or sell it.

| App | Category | What it does |
| --- | --- | --- |
| [Ratecard](tools/ratecard/) | Make money | Pricing studio for freelancers and consultants: floor rate, value pricing, three-tier proposals, change orders. Gumroad listing in [`GUMROAD.md`](tools/ratecard/GUMROAD.md). |
| Storefront Radar | Make money | Graduated to its own private repo (`storefront-radar`): a daily lead engine for POS sales built on new-business filings. |
| [Softopen](softopen/) | Make money | Pre-opening storefront leads as a metered API and MCP server for sales reps and AI agents, with a paid human phone confirmation on any lead. Fed by Storefront Radar. Not a single HTML file: a zero-dependency Node service with SQLite. |
| [Venture Lens](tools/venture/) | Make money | Pressure-test a business idea: weighted scorecard, unit economics, bottom-up market sizing, pre-mortem, printable one-pager. |
| [Slingshot](games/slingshot/) | Play | Original gravity-slingshot physics puzzle game with handcrafted levels and an endless seeded mode. |
| [Groovebox](games/groovebox/) | Play | Drum machine and synth sequencer, every sound synthesized live with WebAudio. Shareable pattern links. |
| [Cartographer](art/cartographer/) | Art | Procedural fantasy map generator with rivers, cities, invented languages, and three render styles. |
| [Latent](art/latent/) | Art | An interactive generative self-portrait by Claude. |

## Research

- [`research/business-address.md`](research/business-address.md): getting a business mailing address that isn't your home, for CAN-SPAM and state filings.

## Run locally

Open `index.html` in a browser. That is it. For the cleanest experience (some browsers restrict `file://`), serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy for free

1. Merge to `main`.
2. In the repo: **Settings, Pages, Build and deployment, Source: GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` publishes the whole lab on every push.

## Principles

- **Single file per app.** Easy to fork, email, sell, or drop on any static host.
- **No dependencies.** Nothing to rot, nothing to update.
- **Works offline and on phones.** Every app is tested at 390px and 1280px.
- **State stays local.** localStorage only; no accounts, no tracking.
