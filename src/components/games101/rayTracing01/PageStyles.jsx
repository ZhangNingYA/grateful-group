import React from 'react'

const STYLES = `
/* ----------------------------------------------------------------- */
/* Ray Tracing 01 — light-theme harmonization layer                 */
/* Most demo components in this lecture page were authored with     */
/* hardcoded inline dark backgrounds. Rather than editing 19 files, */
/* we override them here via attribute selectors that win against   */
/* inline styles (with !important). This keeps the page consistent  */
/* with the airy WorksPost layout.                                  */
/* ----------------------------------------------------------------- */

/* ---------- Wide breakout for hydrated demo islands -------------- */
/* Every interactive demo in this page is mounted via an astro-island.
   By default it inherits the article's 960px width. We break it out
   to the viewport width (capped at 1280px) so the canvas + side-panel
   layout has room to breathe — matching the rayTracing02 design.     */
.article-body > astro-island{
  display:block;
  position:relative;
  left:50%;
  transform:translateX(-50%);
  width:min(1280px, calc(100vw - 2rem));
  max-width:none;
  margin:2.4rem 0;
}
@media (max-width: 980px){
  .article-body > astro-island{
    width:calc(100vw - 1.5rem);
  }
}
/* On narrow viewports collapse demos' two-column grids to single column */
@media (max-width: 860px){
  .article-body astro-island div[style*="grid-template-columns"]{
    grid-template-columns: 1fr !important;
  }
  .article-body astro-island div[style*="border-right"]{
    border-right: none !important;
    border-bottom: 1px solid rgba(126,196,154,0.18) !important;
  }
}

/* Demo card outer shell (panelStyle + ad-hoc copies) */
.article-body div[style*="linear-gradient(180deg, #0c0c18"],
.article-body div[style*="linear-gradient(180deg,#0c0c18"]{
  background:linear-gradient(180deg,#fbfdfb 0%,#f5f9f5 100%) !important;
  border:1px solid rgba(126,196,154,0.22) !important;
  box-shadow:0 4px 20px rgba(45,80,60,0.06) !important;
}

/* Canvas / svg containers (deep dark fills used as demo viewports) */
.article-body div[style*="background: #0a0a14"],
.article-body div[style*="background:#0a0a14"]{
  background:linear-gradient(160deg,#f8fbf9 0%,#f1f6f9 100%) !important;
  border-right-color:rgba(126,196,154,0.18) !important;
}
.article-body svg[style*="background: #070710"],
.article-body svg[style*="background:#070710"],
.article-body div[style*="background: #070710"],
.article-body div[style*="background:#070710"]{
  background:linear-gradient(160deg,#f4f8f4,#eef2f7) !important;
  border-radius:8px !important;
}
.article-body svg[style*="background: #0a0a14"],
.article-body svg[style*="background:#0a0a14"]{
  background:linear-gradient(160deg,#f8fbf9,#f1f6f9) !important;
}

/* Side panels (sidePanel + inline copies) */
.article-body div[style*="rgba(15,15,26,0.6)"]{
  background:linear-gradient(180deg,rgba(248,251,249,0.7),rgba(255,255,255,0.5)) !important;
  border-left-color:rgba(126,196,154,0.18) !important;
  color:rgba(45,58,51,0.78) !important;
}

/* Header titles (mid-blue text on dark → ink + tint) */
.article-body div[style*="color: #c7d2fe"],
.article-body div[style*="color:#c7d2fe"]{
  color:#1a2b22 !important;
}
/* Subtitles & secondary copy that were grey */
.article-body div[style*="color: #666"],
.article-body div[style*="color:#666"]{
  color:rgba(45,58,51,0.55) !important;
}
.article-body div[style*="color: #888"],
.article-body div[style*="color:#888"]{
  color:rgba(45,58,51,0.5) !important;
}
.article-body div[style*="color: #aaa"],
.article-body div[style*="color:#aaa"]{
  color:rgba(45,58,51,0.7) !important;
}
.article-body div[style*="color: #ccc"],
.article-body div[style*="color:#ccc"]{
  color:#2a4035 !important;
}

/* Borders that were white at low opacity → mint at low opacity */
.article-body div[style*="rgba(255,255,255,0.04)"],
.article-body svg[style*="rgba(255,255,255,0.04)"]{
  /* fall-through: just soften the visible black edges */
}

/* Buttons / pills — accent fills tuned for light bg */
.article-body button[style*="rgba(99,102,241"]{
  /* keep indigo but on a soft white pill */
  background:#fff !important;
  border:1px solid rgba(139,164,230,0.45) !important;
  color:#6a7fce !important;
}

/* SVG stroke colors that were near-white become ink for legibility */
.article-body svg text[fill="#aaa"],
.article-body svg text[fill="#ccc"],
.article-body svg text[fill="#bbb"]{
  fill:rgba(45,58,51,0.7) !important;
}
.article-body svg text[fill="#666"],
.article-body svg text[fill="#777"],
.article-body svg text[fill="#888"]{
  fill:rgba(45,58,51,0.55) !important;
}
.article-body svg line[stroke="rgba(255,255,255,0.05)"],
.article-body svg line[stroke="rgba(255,255,255,0.06)"],
.article-body svg line[stroke="rgba(255,255,255,0.08)"]{
  stroke:rgba(45,80,60,0.08) !important;
}
/* Pure white text labels on previously dark canvases */
.article-body svg text[fill="#fff"],
.article-body svg text[fill="white"]{
  fill:#1a2b22 !important;
}
`

export default function PageStyles() {
  return <style dangerouslySetInnerHTML={{ __html: STYLES }} />
}
