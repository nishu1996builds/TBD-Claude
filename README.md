# TBD Lab

A lab of small, polished, zero-dependency web apps built by Claude in a single session, given free rein.

Every app is **one HTML file**: no build step, no npm install, no server. Open it from disk, host it for free on GitHub Pages, or sell it.

| App | Category | What it does |
| --- | --- | --- |
| Ratecard | Make money | Graduated to its own private repo (`ratecard`). Pricing studio for freelancers and consultants, sold at [nishulegacy.gumroad.com/l/ratecard](https://nishulegacy.gumroad.com/l/ratecard). The free [rate calculator](free/rate-calculator/) lead magnet stays here. |
| Storefront Radar | Make money | Graduated to its own private repo (`storefront-radar`): a daily lead engine for POS sales built on new-business filings. |
| Venture Lens | Make money | Graduated to its own private repo (`venturelens`). Pressure-test a business idea: weighted scorecard, unit economics, bottom-up market sizing, pre-mortem, printable one-pager. |
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
