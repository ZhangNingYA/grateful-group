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
.article > astro-island{
  display:block;
  position:relative;
  left:50%;
  transform:translateX(-50%);
  width:min(1280px, calc(100vw - 2rem));
  max-width:none;
  margin:2.4rem 0;
}
@media (max-width: 980px){
  .article > astro-island{
    width:calc(100vw - 1.5rem);
  }
}
/* On narrow viewports collapse demos' two-column grids to single column */
@media (max-width: 860px){
  .article astro-island div[style*="grid-template-columns"]{
    grid-template-columns: 1fr !important;
  }
  .article astro-island div[style*="border-right"]{
    border-right: none !important;
    border-bottom: 1px solid rgba(126,196,154,0.18) !important;
  }
}

/* Demo card outer shell (panelStyle + ad-hoc copies) */
.article div[style*="linear-gradient(180deg, #0c0c18"],
.article div[style*="linear-gradient(180deg,#0c0c18"]{
  background:linear-gradient(180deg,#fbfdfb 0%,#f5f9f5 100%) !important;
  border:1px solid rgba(126,196,154,0.22) !important;
  box-shadow:0 4px 20px rgba(45,80,60,0.06) !important;
}

/* Canvas / svg containers (deep dark fills used as demo viewports) */
.article div[style*="background: #0a0a14"],
.article div[style*="background:#0a0a14"]{
  background:linear-gradient(160deg,#f8fbf9 0%,#f1f6f9 100%) !important;
  border-right-color:rgba(126,196,154,0.18) !important;
}
.article svg[style*="background: #070710"],
.article svg[style*="background:#070710"],
.article div[style*="background: #070710"],
.article div[style*="background:#070710"]{
  background:linear-gradient(160deg,#f4f8f4,#eef2f7) !important;
  border-radius:8px !important;
}
.article svg[style*="background: #0a0a14"],
.article svg[style*="background:#0a0a14"]{
  background:linear-gradient(160deg,#f8fbf9,#f1f6f9) !important;
}

/* Side panels (sidePanel + inline copies) */
.article div[style*="rgba(15,15,26,0.6)"]{
  background:linear-gradient(180deg,rgba(248,251,249,0.7),rgba(255,255,255,0.5)) !important;
  border-left-color:rgba(126,196,154,0.18) !important;
  color:rgba(45,58,51,0.78) !important;
}

/* Header titles (mid-blue text on dark → ink + tint) */
.article div[style*="color: #c7d2fe"],
.article div[style*="color:#c7d2fe"]{
  color:#1a2b22 !important;
}
/* Subtitles & secondary copy that were grey */
.article div[style*="color: #666"],
.article div[style*="color:#666"]{
  color:rgba(45,58,51,0.55) !important;
}
.article div[style*="color: #888"],
.article div[style*="color:#888"]{
  color:rgba(45,58,51,0.5) !important;
}
.article div[style*="color: #aaa"],
.article div[style*="color:#aaa"]{
  color:rgba(45,58,51,0.7) !important;
}
.article div[style*="color: #ccc"],
.article div[style*="color:#ccc"]{
  color:#2a4035 !important;
}

/* Borders that were white at low opacity → mint at low opacity */
.article div[style*="rgba(255,255,255,0.04)"],
.article svg[style*="rgba(255,255,255,0.04)"]{
  /* fall-through: just soften the visible black edges */
}

/* Buttons / pills — accent fills tuned for light bg */
.article button[style*="rgba(99,102,241"]{
  /* keep indigo but on a soft white pill */
  background:#fff !important;
  border:1px solid rgba(139,164,230,0.45) !important;
  color:#6a7fce !important;
}

/* SVG stroke colors that were near-white become ink for legibility */
.article svg text[fill="#aaa"],
.article svg text[fill="#ccc"],
.article svg text[fill="#bbb"]{
  fill:rgba(45,58,51,0.7) !important;
}
.article svg text[fill="#666"],
.article svg text[fill="#777"],
.article svg text[fill="#888"]{
  fill:rgba(45,58,51,0.55) !important;
}
.article svg line[stroke="rgba(255,255,255,0.05)"],
.article svg line[stroke="rgba(255,255,255,0.06)"],
.article svg line[stroke="rgba(255,255,255,0.08)"]{
  stroke:rgba(45,80,60,0.08) !important;
}
/* Pure white text labels on previously dark canvases */
.article svg text[fill="#fff"],
.article svg text[fill="white"]{
  fill:#1a2b22 !important;
}

/* ----------------------------------------------------------------- */
/* Code blocks — same Shiki-dark override as the rt2 page            */
/* ----------------------------------------------------------------- */
.article pre,
.article pre.astro-code,
.article pre[class*="language-"]{
  background:linear-gradient(135deg,#f5faf6,#f0f4fb) !important;
  color:#2a4035 !important;
  border:1px solid rgba(126,196,154,0.22);
  border-radius:14px;
  padding:1.1rem 1.35rem 1.1rem 1.35rem;
  margin:1.4rem 0;
  box-shadow:0 2px 12px rgba(45,80,60,0.05);
  position:relative;
  font-family:'JetBrains Mono','Fira Code','SF Mono',ui-monospace,monospace;
}
.article pre.astro-code::before{
  content:'';position:absolute;top:10px;left:14px;
  width:8px;height:8px;border-radius:50%;
  background:#e8a838;box-shadow:14px 0 0 #d18a8a,28px 0 0 #7ec49a;
  opacity:0.8;
}
.article pre.astro-code{padding-top:1.8rem;}
.article pre code{background:transparent !important;border:none !important;padding:0 !important;font-size:0.86rem;line-height:1.7;color:#2a4035 !important;}
.article pre.astro-code code,
.article pre.astro-code .line,
.article pre.astro-code span{background:transparent !important;}
.article pre.astro-code,
.article pre.astro-code code,
.article pre.astro-code .line > span:not([style*="color"]){color:#2a4035 !important;}
.article pre.astro-code .line{display:block;}
.article pre.astro-code span[style*="#F97583"],
.article pre.astro-code span[style*="#FF7B72"],
.article pre.astro-code span[style*="#D73A49"]{ color:#a85a8c !important; }
.article pre.astro-code span[style*="#9ECBFF"],
.article pre.astro-code span[style*="#A5D6FF"],
.article pre.astro-code span[style*="#032F62"]{ color:#3d7a98 !important; }
.article pre.astro-code span[style*="#79B8FF"],
.article pre.astro-code span[style*="#B392F0"],
.article pre.astro-code span[style*="#6F42C1"]{ color:#6a7fce !important; }
.article pre.astro-code span[style*="#6A737D"],
.article pre.astro-code span[style*="#8B949E"]{ color:#8b9c92 !important; font-style:italic; }
.article pre.astro-code span[style*="#FFAB70"],
.article pre.astro-code span[style*="#E36209"]{ color:#c87a3a !important; }
.article pre.astro-code span[style*="#E1E4E8"],
.article pre.astro-code span[style*="#24292E"]{ color:#2a4035 !important; }
`

export default function PageStyles() {
  return <style dangerouslySetInnerHTML={{ __html: STYLES }} />
}
