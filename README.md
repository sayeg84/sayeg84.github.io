# sayeg84.github.io

Personal academic website, built with [Eleventy (11ty)](https://www.11ty.dev/).

## Run locally

```sh
npm install
npm start          # dev server with live reload at http://localhost:8080
npm run build      # writes the site to _site/
```

Pushing to `main` builds and deploys via `.github/workflows/deploy.yml`
(repo Settings → Pages → Source must be **GitHub Actions**).

## Where things live

| What | Where |
| --- | --- |
| Name, bio, header menu, footer links | `src/_data/site.json` |
| Home page | `src/index.md` |
| Bio | `src/bio.md` |
| Projects / publications / teaching / talks / internships / blog posts | one Markdown file each in `src/projects/`, `src/publications/`, `src/teaching/`, `src/talks/`, `src/internships/`, `src/posts/` |
| Old URLs that should redirect | `src/_data/redirects.json` |
| Colours (light + dark), layout | `src/assets/css/main.css` |
| Dark-mode toggle + Plotly theming | `src/assets/js/theme.js` |
| Interactive simulations | `src/assets/js/sims/` |
| Downloadable files, images | `src/files/`, `src/images/` (copied as-is) |
| Page templates | `src/_includes/layouts/` |

## Adding content

Create a Markdown file in the right folder. Front matter fields:

```yaml
---
title: "Paper title"          # all
permalink: /publication/my-paper/   # all — the URL, keep the trailing slash
date: 2026-03-01              # sorts newest first
order: 1                      # optional: explicit order (used by projects, internships)
excerpt: "One-line summary"   # shown in lists
venue: "Nature Communications"
paperurl: "https://doi.org/…" # publications: list links straight to the paper
subtitle: "Poster"            # talks/teaching: type of entry
period: "June 2018 - August 2018"  # internships: free-text dates
location: "Berlin, Germany"
lang: es                      # pages not in English
---
```

Page options:

```yaml
math: true      # load MathJax ($…$, \(…\), $$…$$)
plotly: true    # load Plotly
scripts:        # extra scripts for this page
  - /assets/js/sims/my-sim.js
```

## Dark mode

The theme follows the OS setting until the visitor clicks the toggle; the choice
is then stored in `localStorage`. All colours are CSS variables in `main.css`
(`:root` for light, `:root[data-theme="dark"]` for dark).

- **Plotly**: create figures with `SiteTheme.plot(el, data, layout, config)`
  instead of `Plotly.newPlot(...)`. They get theme colours (transparent
  background, text, grid, sliders, buttons) and are recoloured on toggle.
- **Canvas / custom JS**: read colours with `SiteTheme.cssVar("--text")` and
  listen for `document.addEventListener("themechange", …)` to redraw.
