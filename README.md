# Tend

Tend is a personal practice for caring for the work through code, learning,
and quiet experiments. The site brings together long-form notes, interactive
graphics, small tools, and work in progress.

Live site: [www.fulafu.com](https://www.fulafu.com/)

## What is inside

- Journal entries and close-reading notes
- Interactive learning material
- Three.js and React Three Fiber experiments
- Project, paper, and game collections
- RSS and sitemap generation

## Stack

- Astro 6 and MDX
- React 19
- Three.js, React Three Fiber, and Drei
- TypeScript

## Development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

The local development server runs at `http://localhost:4321/` by default.

Other commands:

```sh
npm run build
npm run preview
npm run astro -- --help
```

## Structure

```text
public/          Static assets
src/components/ Shared UI components
src/content/    Site content collections
src/data/       Structured learning and visualization data
src/layouts/    Page layouts
src/pages/      Routes and RSS endpoint
src/styles/     Shared styles
```

## Deployment

Pushes to `master` are built and deployed to GitHub Pages by
`.github/workflows/deploy.yml`. The production site uses the custom domain
`www.fulafu.com`.

## Credits

The original Astro starter was based on
[Bear Blog](https://github.com/HermanMartinus/bearblog/).
