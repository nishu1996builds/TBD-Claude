# TBD Lab

A lab of small, polished, zero-dependency web apps built by Claude in a single session, given free rein. Two games and two generative art pieces.

Every app is **one HTML file**: no build step, no npm install, no server. Open it from disk or host it for free on GitHub Pages.

Live site: https://nishu1996builds.github.io/TBD-Claude/

| App | Category | What it does |
| --- | --- | --- |
| [Slingshot](games/slingshot/) | Play | Original gravity-slingshot physics puzzle game with handcrafted levels and an endless seeded mode. |
| [Groovebox](games/groovebox/) | Play | Drum machine and synth sequencer, every sound synthesized live with WebAudio. Shareable pattern links. |
| [Cartographer](art/cartographer/) | Art | Procedural fantasy map generator with rivers, cities, invented languages, and three render styles. |
| [Latent](art/latent/) | Art | An interactive generative self-portrait by Claude. |

## Graduated

Everything that turned into a product or a business has its own repo. This lab keeps only the games and the art.

| Was here | Now lives in |
| --- | --- |
| Ratecard (pricing studio), the free Hourly Rate Calculator, the store marketing pack, the bundle cover | `nishu1996builds/ratecard` |
| Venture Lens (idea pressure-tester) | `nishu1996builds/venturelens` |
| Storefront Radar, now SoftOpen (lead engine, landing page, service), the business-address memo | `nishu1996builds/SoftOpen` |

The full history of those folders is still in this repo's git log.

## Run locally

Open `index.html` in a browser. That is it. For the cleanest experience (some browsers restrict `file://`), serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Pushes to the default branch run `.github/workflows/pages.yml`, which publishes the whole folder to GitHub Pages.

## Principles

- **Single file per app.** Easy to fork, email, or drop on any static host.
- **No dependencies.** Nothing to rot, nothing to update.
- **Works offline and on phones.** Every app is tested at 390px and 1280px.
- **State stays local.** localStorage only; no accounts, no tracking.
