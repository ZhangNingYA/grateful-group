---
inclusion: always
---

# Project Overview

This is an **Astro + React + Three.js** project (site name: grateful-group).

## Tech Stack

- **Astro 6** — Static site generator (core framework)
- **React 19** — Interactive UI components via `@astrojs/react`
- **Three.js / React Three Fiber / Drei** — 3D rendering
- **MDX** — Markdown with JSX support
- **Vite** — Bundler (built into Astro)
- **Sharp** — Image optimization

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

## Build Output

The production build output directory is **`dist/`**.

## Deployment

- **Platform**: GitHub Pages
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Deploy branch**: `master`
- **Pages source**: GitHub Actions (not branch-based)

### Important: Do NOT modify deployment config

The current `astro.config.mjs` has `site` and `base` configured and working correctly for GitHub Pages. **Do not change these values** unless explicitly instructed by the user:

```js
site: 'https://ZhangNingYA.github.io',
base: '/',
```

## Project Structure

- `src/pages/` — Astro pages (file-based routing)
- `src/components/` — Astro and React components
- `src/components/r3f/` — React Three Fiber 3D components
- `src/content/` — Content collections (blog, games)
- `src/layouts/` — Page layouts
- `src/styles/` — CSS stylesheets
- `src/data/` — Data files (e.g. 3D model configs)
- `public/` — Static assets served as-is (models, music, favicon)

## Rules

- Do NOT run `git push` without explicit user permission.
- Do NOT modify `astro.config.mjs` site/base config without explicit user permission.
- Do NOT modify existing business code unless asked to.
- Node version requirement: `>=22.12.0`
