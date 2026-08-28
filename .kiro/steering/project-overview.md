---
inclusion: always
---

# Project Overview

This is an **Astro + React** project named **Tend**.

## Tech Stack

- **Astro 6** — Static site generator (core framework)
- **React 19** — Interactive UI components via `@astrojs/react`
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
site: 'https://www.fulafu.com',
base: '/',
```

## Project Structure

- `src/pages/` — Astro pages (file-based routing)
- `src/components/` — Astro and React components
- `src/content/` — Content collections (blog, games, works, papers)
- `src/layouts/` — Page layouts
- `src/styles/` — CSS stylesheets
- `src/data/` — Structured data for reading and interactive content
- `public/` — Static assets served as-is (music and favicon)

## Rules

- Do NOT run `git push` without explicit user permission.
- Do NOT modify `astro.config.mjs` site/base config without explicit user permission.
- Do NOT modify existing business code unless asked to.
- Node version requirement: `>=22.12.0`
