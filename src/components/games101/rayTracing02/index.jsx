import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html, Grid as DreiGrid } from '@react-three/drei'
import * as THREE from 'three'

// ----------------------------------------------------------------------------
// Page-wide light styles — match the WorksPost layout palette
// (mint #7ec49a, lilac #8ba4e6, peach #e8b4bc, paper #fafcfb)
// ----------------------------------------------------------------------------
const PAGE_STYLES = `
.rt2{
  --mint:#7ec49a;--mint-deep:#4a9e6e;--mint-soft:#c8e6d4;
  --lilac:#8ba4e6;--lilac-deep:#6a7fce;--lilac-soft:#d6dffa;
  --peach:#e8b4bc;--peach-deep:#c46971;
  --butter:#f1e4b9;--butter-deep:#c89a3a;
  --amber:#e8a838;
  --ink:#1a2b22;--ink-soft:#2a4035;
  --body:rgba(45,58,51,0.78);--mute:rgba(45,58,51,0.55);
  --paper:#fafcfb;
  --card:rgba(255,255,255,0.78);--cardHi:rgba(255,255,255,0.94);
  --bd:rgba(126,196,154,0.22);--bdHi:rgba(126,196,154,0.4);
  --bdSoft:rgba(126,196,154,0.12);
  --shadow:0 4px 20px rgba(45,80,60,0.06);
  --shadowMd:0 8px 28px rgba(45,80,60,0.09);
  --shadowLg:0 16px 48px rgba(45,80,60,0.12);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  color:var(--ink-soft);
}
.rt2 *{box-sizing:border-box;}

/* ============================================================== */
/* Wide breakout — center any rt2 element to viewport, capped     */
/* ============================================================== */
.rt2-breakout{
  position:relative;left:50%;transform:translateX(-50%);
  width:min(1280px,calc(100vw - 2rem));
}

/* ============================================================== */
/* Hero — magazine-style intro card with chapter map              */
/* ============================================================== */
.rt2-hero{
  position:relative;
  background:
    radial-gradient(800px 380px at 100% 0%,rgba(139,164,230,0.18),transparent 65%),
    radial-gradient(600px 300px at 0% 100%,rgba(126,196,154,0.18),transparent 60%),
    linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,253,250,0.85));
  border:1px solid var(--bdHi);
  border-radius:24px;
  padding:2.2rem 2.4rem;
  margin:0.8rem 0 2.6rem;
  overflow:hidden;
  box-shadow:var(--shadowMd);
  backdrop-filter:blur(14px);
}
.rt2-hero::before{
  content:'';position:absolute;top:-2px;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--mint),var(--lilac),var(--peach));
}
.rt2-hero-meta{
  display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;
  font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--mint-deep);font-weight:700;margin-bottom:1rem;
}
.rt2-hero-meta .dot{width:6px;height:6px;border-radius:50%;background:var(--mint);box-shadow:0 0 8px rgba(126,196,154,0.6);}
.rt2-hero-meta .sep{color:rgba(45,58,51,0.25);}
.rt2-hero-meta .lec{color:var(--lilac-deep);}
.rt2-hero-tagline{
  font-size:1.05rem;line-height:1.7;color:var(--body);
  max-width:38em;margin:0 0 1.6rem;
}
.rt2-hero-tagline strong{
  color:var(--ink);
  background:linear-gradient(180deg,transparent 65%,rgba(241,228,185,0.7) 65%);
  padding:0 2px;
}
.rt2-hero-route{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(155px,1fr));
  gap:0.55rem;
  margin-top:1.2rem;
  padding-top:1.4rem;
  border-top:1px dashed rgba(126,196,154,0.3);
}
.rt2-hero-step{
  display:flex;align-items:center;gap:0.55rem;
  background:rgba(255,255,255,0.55);
  border:1px solid var(--bd);
  border-radius:10px;
  padding:0.45rem 0.65rem;
  font-size:0.78rem;
  color:rgba(45,58,51,0.7);
  transition:transform 0.2s,box-shadow 0.2s;
}
.rt2-hero-step:hover{transform:translateY(-1px);box-shadow:var(--shadow);}
.rt2-hero-step .num{
  flex-shrink:0;
  width:1.4rem;height:1.4rem;
  display:flex;align-items:center;justify-content:center;
  border-radius:50%;
  font-family:'JetBrains Mono',monospace;
  font-size:0.68rem;font-weight:700;
  background:rgba(126,196,154,0.15);
  color:var(--mint-deep);
  border:1px solid rgba(126,196,154,0.25);
}
.rt2-hero-step.active{
  background:linear-gradient(135deg,rgba(126,196,154,0.18),rgba(139,164,230,0.14));
  border-color:rgba(74,158,110,0.4);
  color:var(--ink);
  font-weight:600;
}
.rt2-hero-step.active .num{
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  color:#fff;border-color:transparent;
  box-shadow:0 2px 6px rgba(74,158,110,0.35);
}

/* ============================================================== */
/* Section divider — large chapter marker                          */
/* ============================================================== */
.rt2-section{
  display:flex;align-items:flex-end;gap:1rem;
  margin:3.6rem 0 1.4rem;
  padding-bottom:0.8rem;
  border-bottom:1px solid var(--bdSoft);
}
.rt2-section-num{
  font-family:'JetBrains Mono',monospace;
  font-size:3.2rem;line-height:1;
  font-weight:700;
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  -webkit-background-clip:text;background-clip:text;color:transparent;
  flex-shrink:0;
  letter-spacing:-0.04em;
}
.rt2-section-body{flex:1;min-width:0;}
.rt2-section-eyebrow{
  font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--mint-deep);font-weight:700;margin-bottom:0.25rem;
}
.rt2-section-title{
  font-size:clamp(1.4rem,2.4vw,1.85rem);
  font-weight:750;color:var(--ink);
  line-height:1.25;letter-spacing:-0.015em;margin:0;
}
.rt2-section-lead{
  font-size:0.96rem;color:var(--body);line-height:1.7;
  margin:0.6rem 0 1.2rem;max-width:42em;
}

/* ============================================================== */
/* Callouts — soft pastel cards                                    */
/* ============================================================== */
.rt2-callout{
  display:flex;gap:0.95rem;align-items:flex-start;
  background:linear-gradient(135deg,rgba(126,196,154,0.06),rgba(139,164,230,0.04));
  border:1px solid var(--bd);border-left:3px solid var(--mint);
  border-radius:14px;
  padding:1rem 1.15rem;margin:1.3rem 0;
  box-shadow:var(--shadow);
}
.rt2-callout.warning{
  background:linear-gradient(135deg,rgba(232,180,188,0.10),rgba(241,228,185,0.10));
  border-color:rgba(232,180,188,0.35);border-left-color:var(--peach-deep);
}
.rt2-callout.impl{
  background:linear-gradient(135deg,rgba(126,196,154,0.10),rgba(180,220,200,0.08));
  border-color:rgba(126,196,154,0.35);border-left-color:var(--mint-deep);
}
.rt2-callout.mental{
  background:linear-gradient(135deg,rgba(139,164,230,0.10),rgba(200,180,230,0.08));
  border-color:rgba(139,164,230,0.35);border-left-color:var(--lilac-deep);
}
.rt2-callout.insight{
  background:linear-gradient(135deg,rgba(126,196,154,0.10),rgba(241,228,185,0.10));
  border-color:rgba(126,196,154,0.30);border-left-color:var(--mint-deep);
}
.rt2-callout-icon{
  font-size:1.25rem;flex-shrink:0;line-height:1.3;
  width:2rem;height:2rem;
  display:flex;align-items:center;justify-content:center;
  background:#fff;border-radius:10px;
  box-shadow:0 2px 8px rgba(45,80,60,0.08);
}
.rt2-callout-body{flex:1;min-width:0;}
.rt2-callout-title{
  font-weight:700;color:var(--ink);font-size:0.78rem;
  letter-spacing:0.08em;margin-bottom:0.4rem;text-transform:uppercase;
}
.rt2-callout-body p{margin:0.2rem 0;color:var(--body);font-size:0.95rem;line-height:1.75;}
.rt2-callout-body code{background:rgba(126,196,154,0.12);}

/* ============================================================== */
/* Formula card                                                    */
/* ============================================================== */
.rt2-formula{
  background:linear-gradient(135deg,rgba(248,253,250,0.95),rgba(245,248,255,0.85));
  border:1px solid rgba(126,196,154,0.22);
  border-radius:14px;
  padding:1.1rem 1.4rem;margin:1.3rem 0;
  font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace;
  font-size:0.96rem;color:var(--ink-soft);text-align:center;
  box-shadow:var(--shadow);
  position:relative;
}
.rt2-formula::before{
  content:'∮';position:absolute;top:8px;left:14px;
  font-size:0.85rem;color:var(--mint);opacity:0.5;font-family:serif;
}

/* ============================================================== */
/* Demo card — wide, light, layered                                */
/* ============================================================== */
.rt2-demo{
  background:var(--cardHi);
  border:1px solid var(--bd);
  border-radius:22px;
  overflow:hidden;
  margin:2rem 0;
  box-shadow:var(--shadowMd);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  transition:box-shadow 0.3s;
}
.rt2-demo:hover{box-shadow:var(--shadowLg);}
.rt2-demo-head{
  padding:1.15rem 1.5rem 1rem;
  border-bottom:1px solid rgba(126,196,154,0.15);
  background:linear-gradient(135deg,rgba(126,196,154,0.05),rgba(139,164,230,0.04));
  position:relative;
}
.rt2-demo-head::after{
  content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(126,196,154,0.4),transparent);
}
.rt2-demo-title{
  font-size:1.08rem;font-weight:700;color:var(--ink);
  letter-spacing:-0.01em;display:flex;align-items:center;gap:0.7rem;
}
.rt2-demo-title::before{
  content:'';width:10px;height:10px;border-radius:50%;
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  box-shadow:0 0 14px rgba(126,196,154,0.55);
  flex-shrink:0;
}
.rt2-demo-desc{
  font-size:0.88rem;color:var(--body);
  margin-top:0.45rem;line-height:1.7;
}
.rt2-demo-body{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:0;}
@media(max-width:980px){.rt2-demo-body{grid-template-columns:1fr;}}

.rt2-canvas-wrap{
  position:relative;
  background:linear-gradient(160deg,#f8fbf9 0%,#f1f6f9 100%);
  min-height:420px;
}
.rt2-canvas-wrap::before{
  content:'';position:absolute;top:0;left:0;right:0;height:30px;
  background:linear-gradient(180deg,rgba(255,255,255,0.4),transparent);
  pointer-events:none;z-index:1;
}

.rt2-panel{
  padding:1.15rem 1.25rem;
  background:linear-gradient(180deg,rgba(248,251,249,0.78),rgba(255,255,255,0.55));
  border-left:1px solid rgba(126,196,154,0.18);
  display:flex;flex-direction:column;gap:0.95rem;font-size:0.86rem;
  max-height:560px;overflow-y:auto;
  scrollbar-width:thin;scrollbar-color:rgba(126,196,154,0.4) transparent;
}
.rt2-panel::-webkit-scrollbar{width:6px;}
.rt2-panel::-webkit-scrollbar-thumb{background:rgba(126,196,154,0.4);border-radius:3px;}
@media(max-width:980px){
  .rt2-panel{border-left:none;border-top:1px solid rgba(126,196,154,0.18);max-height:none;}
}

/* ============================================================== */
/* Controls                                                        */
/* ============================================================== */
.rt2-ctrl{display:flex;flex-direction:column;gap:0.4rem;}
.rt2-ctrl-label{
  display:flex;justify-content:space-between;align-items:center;
  color:rgba(45,58,51,0.55);font-size:0.72rem;
  letter-spacing:0.06em;text-transform:uppercase;font-weight:700;
}
.rt2-ctrl-label .v{
  color:var(--mint-deep);font-family:'JetBrains Mono',monospace;
  font-size:0.84rem;text-transform:none;letter-spacing:0;font-weight:700;
  background:rgba(126,196,154,0.10);
  padding:0.1rem 0.45rem;border-radius:5px;
}
.rt2-ctrl input[type=range]{
  width:100%;height:6px;-webkit-appearance:none;appearance:none;
  background:linear-gradient(90deg,rgba(126,196,154,0.3),rgba(139,164,230,0.3));
  border-radius:3px;outline:none;cursor:pointer;
}
.rt2-ctrl input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;width:18px;height:18px;
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  border-radius:50%;cursor:pointer;
  box-shadow:0 2px 8px rgba(74,158,110,0.4);
  border:3px solid #fff;
  transition:transform 0.15s;
}
.rt2-ctrl input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15);}
.rt2-ctrl input[type=range]::-moz-range-thumb{
  width:14px;height:14px;
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  border-radius:50%;cursor:pointer;border:3px solid #fff;
}
.rt2-ctrl select,.rt2-ctrl input[type=number]{
  background:#fff;border:1px solid var(--bd);color:var(--ink-soft);
  padding:0.45rem 0.65rem;border-radius:8px;font-size:0.86rem;outline:none;
  font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;
}
.rt2-ctrl select:focus,.rt2-ctrl input[type=number]:focus{
  border-color:var(--mint-deep);
  box-shadow:0 0 0 3px rgba(126,196,154,0.18);
}

.rt2-toggle{
  display:flex;align-items:center;gap:0.55rem;cursor:pointer;
  color:var(--body);font-size:0.85rem;user-select:none;
  padding:0.3rem 0;
  transition:color 0.15s;
}
.rt2-toggle:hover{color:var(--ink);}
.rt2-toggle input{width:16px;height:16px;accent-color:var(--mint-deep);cursor:pointer;}

.rt2-btn{
  background:linear-gradient(135deg,rgba(126,196,154,0.18),rgba(139,164,230,0.14));
  color:var(--mint-deep);border:1px solid rgba(126,196,154,0.35);
  padding:0.5rem 0.9rem;border-radius:9px;cursor:pointer;
  font-size:0.84rem;font-weight:600;transition:all 0.15s;font-family:inherit;
}
.rt2-btn:hover{transform:translateY(-1px);box-shadow:var(--shadow);}

/* ============================================================== */
/* Stats                                                           */
/* ============================================================== */
.rt2-stat{
  display:flex;justify-content:space-between;align-items:center;
  background:#fff;border:1px solid rgba(126,196,154,0.18);
  border-radius:10px;padding:0.55rem 0.85rem;font-size:0.84rem;
  transition:transform 0.15s,box-shadow 0.15s;
}
.rt2-stat:hover{transform:translateX(2px);box-shadow:0 2px 8px rgba(45,80,60,0.05);}
.rt2-stat-k{
  color:rgba(45,58,51,0.5);font-size:0.7rem;
  letter-spacing:0.06em;text-transform:uppercase;font-weight:700;
}
.rt2-stat-v{color:var(--ink);font-family:'JetBrains Mono',monospace;font-weight:700;font-size:0.86rem;}
.rt2-stat-v.cyan{color:var(--lilac-deep);}
.rt2-stat-v.green{color:var(--mint-deep);}
.rt2-stat-v.orange{color:#d18a4f;}
.rt2-stat-v.red{color:var(--peach-deep);}
.rt2-stat-v.purple{color:#9576c9;}

/* ============================================================== */
/* Legend                                                          */
/* ============================================================== */
.rt2-legend{display:flex;flex-wrap:wrap;gap:0.45rem;font-size:0.74rem;color:var(--body);}
.rt2-legend-item{
  display:inline-flex;align-items:center;gap:0.4rem;
  background:#fff;padding:0.28rem 0.65rem;border-radius:100px;
  border:1px solid var(--bd);
  box-shadow:0 1px 3px rgba(45,80,60,0.04);
}
.rt2-legend-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.rt2-divider{
  height:1px;background:linear-gradient(90deg,transparent,rgba(126,196,154,0.3),transparent);
  margin:0.4rem 0;
}

/* Two-up grid */
.rt2-grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin:1.5rem 0;}
@media(max-width:740px){.rt2-grid2{grid-template-columns:1fr;}}

/* ============================================================== */
/* Cheat sheet — multi-card grid                                   */
/* ============================================================== */
.rt2-cheat{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1.2rem;
  margin:1.6rem 0;
}
@media(max-width:780px){.rt2-cheat{grid-template-columns:1fr;}}
.rt2-cheat-card{
  background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,253,250,0.85));
  border:1px solid var(--bdHi);
  border-radius:18px;
  padding:1.4rem 1.5rem;
  box-shadow:var(--shadow);
  position:relative;
  overflow:hidden;
}
.rt2-cheat-card.span2{grid-column:span 2;}
@media(max-width:780px){.rt2-cheat-card.span2{grid-column:span 1;}}
.rt2-cheat-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--mint),var(--lilac));
}
.rt2-cheat-card.peach::before{background:linear-gradient(90deg,var(--peach),var(--butter));}
.rt2-cheat-card.lilac::before{background:linear-gradient(90deg,var(--lilac),var(--mint));}
.rt2-cheat-card-eyebrow{
  font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--mint-deep);font-weight:700;margin-bottom:0.4rem;
}
.rt2-cheat-card.peach .rt2-cheat-card-eyebrow{color:var(--peach-deep);}
.rt2-cheat-card.lilac .rt2-cheat-card-eyebrow{color:var(--lilac-deep);}
.rt2-cheat-card h3{
  margin:0 0 0.8rem;font-size:1.05rem;font-weight:700;color:var(--ink);
  letter-spacing:-0.005em;
}
.rt2-cheat-card .rt2-formula{margin:0.5rem 0;}
.rt2-cheat-card pre{margin:0.6rem 0 !important;}
.rt2-cheat-card table{margin:0.4rem 0 0;font-size:0.86rem;}

/* ============================================================== */
/* Self-quiz numbered grid                                         */
/* ============================================================== */
.rt2-q-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:0.85rem;
  margin:1.4rem 0;
  list-style:none;padding:0;counter-reset:q;
}
.rt2-q-grid li{
  counter-increment:q;
  background:linear-gradient(135deg,#fff,rgba(248,253,250,0.7));
  border:1px solid var(--bd);
  border-radius:14px;
  padding:1rem 1.1rem 1rem 3.2rem;
  position:relative;font-size:0.92rem;color:var(--ink-soft);line-height:1.65;
  box-shadow:var(--shadow);
  transition:transform 0.2s,box-shadow 0.2s;
}
.rt2-q-grid li:hover{transform:translateY(-2px);box-shadow:var(--shadowMd);}
.rt2-q-grid li::before{
  content:counter(q,decimal-leading-zero);
  position:absolute;left:0.8rem;top:0.95rem;
  width:1.85rem;height:1.85rem;
  background:linear-gradient(135deg,var(--mint),var(--lilac));
  color:#fff;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-size:0.74rem;font-weight:700;font-family:'JetBrains Mono',monospace;
  box-shadow:0 2px 6px rgba(74,158,110,0.3);
  letter-spacing:-0.02em;
}

/* ============================================================== */
/* SBS comparison labels                                           */
/* ============================================================== */
.rt2-sbs-label{
  position:absolute;top:14px;left:16px;z-index:2;
  font-size:0.72rem;letter-spacing:0.12em;font-weight:700;
  background:rgba(255,255,255,0.96);padding:0.35rem 0.8rem;
  border-radius:100px;border:1px solid var(--bd);
  box-shadow:var(--shadow);
  display:inline-flex;align-items:center;gap:0.45rem;
}
.rt2-sbs-label::before{
  content:'';width:7px;height:7px;border-radius:50%;
}
.rt2-sbs-label.mint{color:var(--mint-deep);}
.rt2-sbs-label.mint::before{background:var(--mint);}
.rt2-sbs-label.lilac{color:var(--lilac-deep);}
.rt2-sbs-label.lilac::before{background:var(--lilac);}

.rt2-callout code{font-size:0.86em;}
`

export function PageStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
}


// ----------------------------------------------------------------------------
// Shared UI primitives
// ----------------------------------------------------------------------------
export function Callout({ kind = 'insight', title, children }) {
  const icons = { insight: '💡', warning: '⚠️', impl: '🔧', mental: '🧠' }
  return (
    <div className={`rt2 rt2-callout ${kind}`}>
      <div className="rt2-callout-icon">{icons[kind] || '💡'}</div>
      <div className="rt2-callout-body">
        <div className="rt2-callout-title">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function Formula({ children }) {
  return <div className="rt2 rt2-formula">{children}</div>
}

export function Route() {
  const steps = [
    { n: '01', label: '课程定位', active: false },
    { n: '02', label: 'AABB Slab', active: true },
    { n: '03', label: 'Uniform Grid', active: true },
    { n: '04', label: 'Spatial Partition', active: true },
    { n: '05', label: 'KD-Tree', active: true },
    { n: '06', label: 'BVH', active: true },
    { n: '07', label: 'Spatial vs Object', active: true },
    { n: '08', label: 'Radiometry', active: true },
    { n: '09', label: 'Flux', active: true },
    { n: '10', label: 'Solid Angle', active: true },
    { n: '11', label: 'Isotropic Source', active: true },
    { n: '12', label: '速查表', active: false },
  ]
  return (
    <div className="rt2 rt2-breakout">
      <div className="rt2-hero">
        <div className="rt2-hero-meta">
          <span className="dot" />
          <span>GAMES 101</span>
          <span className="sep">·</span>
          <span className="lec">Lecture 14</span>
          <span className="sep">·</span>
          <span>Acceleration &amp; Radiometry</span>
        </div>
        <p className="rt2-hero-tagline">
          这一讲分两半：前半场用 <strong>AABB / Grid / KD-Tree / BVH</strong> 让光线追踪跑得动；后半场用 <strong>Flux / Solid Angle / Radiant Intensity</strong> 把"光"重新定义为可度量的物理量。下面的 11 个 3D 交互演示把抽象概念全部摆到面前。
        </p>
        <div className="rt2-hero-route">
          {steps.map((s) => (
            <div key={s.n} className={`rt2-hero-step${s.active ? ' active' : ''}`}>
              <span className="num">{s.n}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Section({ num, eyebrow, title, lead }) {
  return (
    <div className="rt2 rt2-section">
      <div className="rt2-section-num">{num}</div>
      <div className="rt2-section-body">
        {eyebrow && <div className="rt2-section-eyebrow">{eyebrow}</div>}
        <h2 className="rt2-section-title">{title}</h2>
        {lead && <div className="rt2-section-lead">{lead}</div>}
      </div>
    </div>
  )
}

export function Cheat({ children }) {
  return <div className="rt2 rt2-cheat rt2-breakout">{children}</div>
}

export function CheatCard({ tone = 'mint', eyebrow, title, span2, children }) {
  return (
    <div className={`rt2-cheat-card ${tone}${span2 ? ' span2' : ''}`}>
      {eyebrow && <div className="rt2-cheat-card-eyebrow">{eyebrow}</div>}
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}

export function QGrid({ items }) {
  return (
    <ol className="rt2 rt2-q-grid rt2-breakout">
      {items.map((q, i) => (
        <li key={i}>{q}</li>
      ))}
    </ol>
  )
}

export function StatBadge({ label, value, tone = 'cyan' }) {
  return (
    <div className="rt2-stat">
      <span className="rt2-stat-k">{label}</span>
      <span className={`rt2-stat-v ${tone}`}>{value}</span>
    </div>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt = (v) => v }) {
  return (
    <label className="rt2-ctrl">
      <span className="rt2-ctrl-label">
        <span>{label}</span>
        <span className="v">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="rt2-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function Legend({ items }) {
  return (
    <div className="rt2-legend">
      {items.map((it, i) => (
        <span key={i} className="rt2-legend-item">
          <span className="rt2-legend-dot" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

export function DemoShell({ title, desc, children, panel, height = 460 }) {
  return (
    <div className="rt2 rt2-breakout">
      <div className="rt2-demo">
        <div className="rt2-demo-head">
          <div className="rt2-demo-title">{title}</div>
          {desc && <div className="rt2-demo-desc">{desc}</div>}
        </div>
        <div className="rt2-demo-body">
          <div className="rt2-canvas-wrap" style={{ minHeight: height }}>
            {children}
          </div>
          <div className="rt2-panel">{panel}</div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Math / geometry helpers
// ----------------------------------------------------------------------------
export function intersectRayAABB(o, d, bmin, bmax) {
  let tNear = -Infinity
  let tFar = Infinity
  let nearAxis = 0
  let farAxis = 0
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < bmin[i] || o[i] > bmax[i]) return null
    } else {
      let t1 = (bmin[i] - o[i]) / d[i]
      let t2 = (bmax[i] - o[i]) / d[i]
      if (t1 > t2) {
        const tmp = t1
        t1 = t2
        t2 = tmp
      }
      if (t1 > tNear) {
        tNear = t1
        nearAxis = i
      }
      if (t2 < tFar) {
        tFar = t2
        farAxis = i
      }
      if (tNear > tFar || tFar < 0) return null
    }
  }
  return { tNear, tFar, nearAxis, farAxis }
}

export function raySphere(o, d, c, r) {
  const ox = o[0] - c[0]
  const oy = o[1] - c[1]
  const oz = o[2] - c[2]
  const a = d[0] * d[0] + d[1] * d[1] + d[2] * d[2]
  const b = 2 * (ox * d[0] + oy * d[1] + oz * d[2])
  const cc = ox * ox + oy * oy + oz * oz - r * r
  const disc = b * b - 4 * a * cc
  if (disc < 0) return null
  const s = Math.sqrt(disc)
  const t0 = (-b - s) / (2 * a)
  const t1 = (-b + s) / (2 * a)
  if (t0 > 1e-4) return t0
  if (t1 > 1e-4) return t1
  return null
}

export function unionBoxes(items) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const it of items) {
    for (let i = 0; i < 3; i++) {
      if (it.min[i] < min[i]) min[i] = it.min[i]
      if (it.max[i] > max[i]) max[i] = it.max[i]
    }
  }
  return { min, max }
}

export function longestAxis(min, max) {
  const ex = max[0] - min[0]
  const ey = max[1] - min[1]
  const ez = max[2] - min[2]
  if (ex >= ey && ex >= ez) return 0
  if (ey >= ez) return 1
  return 2
}

export function makeSeededRand(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

export function genRandomSpheres(n, seed = 7, size = 6) {
  const rand = makeSeededRand(seed)
  const out = []
  for (let i = 0; i < n; i++) {
    const r = 0.18 + rand() * 0.32
    const c = [(rand() - 0.5) * size, (rand() - 0.5) * size * 0.6, (rand() - 0.5) * size]
    out.push({
      id: i,
      c,
      r,
      min: [c[0] - r, c[1] - r, c[2] - r],
      max: [c[0] + r, c[1] + r, c[2] + r],
    })
  }
  return out
}


// ----------------------------------------------------------------------------
// Light-theme palette for 3D content
// ----------------------------------------------------------------------------
const COLOR = {
  ray: '#4a8ad6',         // soft blue ray
  rayHit: '#4a9e6e',      // mint when hits
  rayMiss: '#d18a8a',     // dusty rose when misses
  hit: '#e8a838',         // amber marker
  box: '#7ec49a',         // mint AABB
  boxAlt: '#8ba4e6',      // lilac alt box
  boxScene: '#9bb0d4',    // soft scene box
  visited: '#e8a838',     // amber for traversal
  leaf: '#b89cd6',        // lavender leaf
  primary: '#62a3d6',     // sphere material main
  primaryHit: '#7ec49a',  // hit sphere
  slabX: '#c46971',
  slabY: '#4a9e6e',
  slabZ: '#4a8ad6',
  arrow: '#d18a4f',
  ground: '#e8edea',
}

// ----------------------------------------------------------------------------
// R3F primitive components
// ----------------------------------------------------------------------------
export function RayLine({ origin, dir, length = 12, color = COLOR.ray, dashed = false }) {
  const o = new THREE.Vector3(...origin)
  const d = new THREE.Vector3(...dir).normalize()
  const end = o.clone().add(d.clone().multiplyScalar(length))
  return (
    <Line
      points={[o.toArray(), end.toArray()]}
      color={color}
      lineWidth={2.2}
      dashed={dashed}
      dashSize={0.18}
      gapSize={0.12}
    />
  )
}

export function AABBBox({ min, max, color = COLOR.box, opacity = 1, lineWidth = 1.4 }) {
  const cx = (min[0] + max[0]) / 2
  const cy = (min[1] + max[1]) / 2
  const cz = (min[2] + max[2]) / 2
  const sx = max[0] - min[0]
  const sy = max[1] - min[1]
  const sz = max[2] - min[2]
  return (
    <mesh position={[cx, cy, cz]}>
      <boxGeometry args={[sx, sy, sz]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  )
}

export function HitMarker({ position, color = COLOR.hit, size = 0.09 }) {
  if (!position) return null
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export function DirectionArrow({ origin, dir, length = 1.2, color = COLOR.arrow }) {
  const o = new THREE.Vector3(...origin)
  const d = new THREE.Vector3(...dir).normalize()
  const tip = o.clone().add(d.clone().multiplyScalar(length))
  return (
    <>
      <Line points={[o.toArray(), tip.toArray()]} color={color} lineWidth={2.5} />
      <mesh position={tip.toArray()}>
        <coneGeometry args={[0.07, 0.2, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  )
}

export function SceneRig({ children, fov = 45, position = [6, 5, 8], showGrid = true, showAxes = true }) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.6]}
      camera={{ position, fov }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 6]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#dce6ff" />
      <hemisphereLight args={['#ffffff', '#cfd9d2', 0.4]} />
      {showGrid && (
        <DreiGrid
          args={[24, 24]}
          cellColor="#cfd9d2"
          sectionColor="#9bb0a4"
          sectionSize={4}
          fadeDistance={28}
          fadeStrength={1.2}
          infiniteGrid
          position={[0, -0.001, 0]}
        />
      )}
      {showAxes && <axesHelper args={[2.2]} />}
      {children}
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxDistance={40} minDistance={1.5} />
    </Canvas>
  )
}


// ----------------------------------------------------------------------------
// Demo: AABB Slab Method
// ----------------------------------------------------------------------------
export function AABBSlabDemo() {
  const [ox, setOx] = useState(-3.0)
  const [oy, setOy] = useState(0.6)
  const [oz, setOz] = useState(-2.4)
  const [theta, setTheta] = useState(28)
  const [phi, setPhi] = useState(15)
  const [boxSx, setBoxSx] = useState(2.0)
  const [boxSy, setBoxSy] = useState(1.4)
  const [boxSz, setBoxSz] = useState(1.6)
  const [showSlabs, setShowSlabs] = useState(true)

  const dir = useMemo(() => {
    const t = (theta * Math.PI) / 180
    const p = (phi * Math.PI) / 180
    return [Math.cos(p) * Math.cos(t), Math.sin(p), Math.cos(p) * Math.sin(t)]
  }, [theta, phi])

  const origin = [ox, oy, oz]
  const bmin = [-boxSx / 2, -boxSy / 2, -boxSz / 2]
  const bmax = [boxSx / 2, boxSy / 2, boxSz / 2]

  const result = useMemo(
    () => intersectRayAABB(origin, dir, bmin, bmax),
    [origin[0], origin[1], origin[2], dir[0], dir[1], dir[2], bmin[0], bmin[1], bmin[2], bmax[0], bmax[1], bmax[2]],
  )

  const enter = result && result.tNear >= 0
    ? [origin[0] + dir[0] * result.tNear, origin[1] + dir[1] * result.tNear, origin[2] + dir[2] * result.tNear]
    : null
  const exit = result
    ? [origin[0] + dir[0] * result.tFar, origin[1] + dir[1] * result.tFar, origin[2] + dir[2] * result.tFar]
    : null

  const SlabPlane = ({ axis, min, max, color }) => {
    const planes = []
    for (const v of [min, max]) {
      let pos = [0, 0, 0]
      let scale = [1, 1, 1]
      const w = 4
      if (axis === 0) { pos = [v, 0, 0]; scale = [0.001, w, w] }
      else if (axis === 1) { pos = [0, v, 0]; scale = [w, 0.001, w] }
      else { pos = [0, 0, v]; scale = [w, w, 0.001] }
      planes.push(
        <mesh key={`${axis}-${v}`} position={pos} scale={scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>,
      )
    }
    return <>{planes}</>
  }

  const panel = (
    <>
      <Slider label="Origin X" value={ox} min={-5} max={5} step={0.05} onChange={setOx} fmt={(v) => v.toFixed(2)} />
      <Slider label="Origin Y" value={oy} min={-3} max={3} step={0.05} onChange={setOy} fmt={(v) => v.toFixed(2)} />
      <Slider label="Origin Z" value={oz} min={-5} max={5} step={0.05} onChange={setOz} fmt={(v) => v.toFixed(2)} />
      <Slider label="Yaw θ" value={theta} min={-180} max={180} step={1} onChange={setTheta} fmt={(v) => `${v}°`} />
      <Slider label="Pitch φ" value={phi} min={-80} max={80} step={1} onChange={setPhi} fmt={(v) => `${v}°`} />
      <div className="rt2-divider" />
      <Slider label="Box Size X" value={boxSx} min={0.6} max={4} step={0.1} onChange={setBoxSx} fmt={(v) => v.toFixed(1)} />
      <Slider label="Box Size Y" value={boxSy} min={0.6} max={4} step={0.1} onChange={setBoxSy} fmt={(v) => v.toFixed(1)} />
      <Slider label="Box Size Z" value={boxSz} min={0.6} max={4} step={0.1} onChange={setBoxSz} fmt={(v) => v.toFixed(1)} />
      <Toggle label="show X / Y / Z slabs" checked={showSlabs} onChange={setShowSlabs} />
      <div className="rt2-divider" />
      <StatBadge label="Hit?" value={result ? 'YES' : 'MISS'} tone={result ? 'green' : 'red'} />
      <StatBadge label="t_enter" value={result ? result.tNear.toFixed(3) : '—'} tone="cyan" />
      <StatBadge label="t_exit" value={result ? result.tFar.toFixed(3) : '—'} tone="orange" />
      <StatBadge label="entry axis" value={result ? ['X', 'Y', 'Z'][result.nearAxis] : '—'} tone="purple" />
      <Legend
        items={[
          { color: COLOR.slabX, label: 'X slabs' },
          { color: COLOR.slabY, label: 'Y slabs' },
          { color: COLOR.slabZ, label: 'Z slabs' },
          { color: COLOR.hit, label: 'enter / exit' },
        ]}
      />
    </>
  )

  return (
    <DemoShell
      title="AABB ↔ Ray: Slab Method 求交"
      desc="拖动 origin 与方向滑块，观察 t_enter / t_exit 在三组 slab 上是如何被取最大 / 最小值。"
      panel={panel}
      height={460}
    >
      <SceneRig position={[7, 5.5, 7]}>
        <AABBBox min={bmin} max={bmax} color={COLOR.box} />
        {showSlabs && (
          <>
            <SlabPlane axis={0} min={bmin[0]} max={bmax[0]} color={COLOR.slabX} />
            <SlabPlane axis={1} min={bmin[1]} max={bmax[1]} color={COLOR.slabY} />
            <SlabPlane axis={2} min={bmin[2]} max={bmax[2]} color={COLOR.slabZ} />
          </>
        )}
        <RayLine origin={origin} dir={dir} length={20} color={result ? COLOR.rayHit : COLOR.rayMiss} />
        <mesh position={origin}>
          <sphereGeometry args={[0.08, 14, 10]} />
          <meshBasicMaterial color="#4a4a4a" />
        </mesh>
        {enter && <HitMarker position={enter} color={COLOR.hit} size={0.10} />}
        {exit && <HitMarker position={exit} color="#d18a4f" size={0.08} />}
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// Demo: Uniform Grid
// ----------------------------------------------------------------------------
export function UniformGridDemo() {
  const [res, setRes] = useState(6)
  const [seed, setSeed] = useState(7)
  const [nObj, setNObj] = useState(18)
  const [theta, setTheta] = useState(20)
  const [phi, setPhi] = useState(8)
  const [showAllCells, setShowAllCells] = useState(true)
  const [showOverlap, setShowOverlap] = useState(true)
  const [showTraversal, setShowTraversal] = useState(true)

  const objects = useMemo(() => genRandomSpheres(nObj, seed, 6), [nObj, seed])
  const sceneBox = useMemo(() => {
    const m = 3.5
    return { min: [-m, -m * 0.6, -m], max: [m, m * 0.6, m] }
  }, [])

  const cellSize = useMemo(
    () => [
      (sceneBox.max[0] - sceneBox.min[0]) / res,
      (sceneBox.max[1] - sceneBox.min[1]) / res,
      (sceneBox.max[2] - sceneBox.min[2]) / res,
    ],
    [sceneBox, res],
  )

  const objectCellMap = useMemo(() => {
    const set = new Set()
    for (const o of objects) {
      const ix0 = Math.max(0, Math.floor((o.min[0] - sceneBox.min[0]) / cellSize[0]))
      const ix1 = Math.min(res - 1, Math.floor((o.max[0] - sceneBox.min[0]) / cellSize[0]))
      const iy0 = Math.max(0, Math.floor((o.min[1] - sceneBox.min[1]) / cellSize[1]))
      const iy1 = Math.min(res - 1, Math.floor((o.max[1] - sceneBox.min[1]) / cellSize[1]))
      const iz0 = Math.max(0, Math.floor((o.min[2] - sceneBox.min[2]) / cellSize[2]))
      const iz1 = Math.min(res - 1, Math.floor((o.max[2] - sceneBox.min[2]) / cellSize[2]))
      for (let i = ix0; i <= ix1; i++) {
        for (let j = iy0; j <= iy1; j++) {
          for (let k = iz0; k <= iz1; k++) set.add(`${i},${j},${k}`)
        }
      }
    }
    return set
  }, [objects, sceneBox, cellSize, res])

  const dir = useMemo(() => {
    const t = (theta * Math.PI) / 180
    const p = (phi * Math.PI) / 180
    return [Math.cos(p) * Math.cos(t), Math.sin(p), Math.cos(p) * Math.sin(t)]
  }, [theta, phi])
  const origin = [-5, 0.4, -3]

  const traversal = useMemo(() => {
    const visited = []
    const hit = intersectRayAABB(origin, dir, sceneBox.min, sceneBox.max)
    if (!hit) return { visited, primTests: 0 }
    const tStart = Math.max(0, hit.tNear)
    const eps = 1e-4
    let primTests = 0
    let t = tStart + eps
    const stepCount = res * 4
    const stepLen = (hit.tFar - tStart) / stepCount
    for (let s = 0; s <= stepCount; s++) {
      const px = origin[0] + dir[0] * t
      const py = origin[1] + dir[1] * t
      const pz = origin[2] + dir[2] * t
      const ix = Math.floor((px - sceneBox.min[0]) / cellSize[0])
      const iy = Math.floor((py - sceneBox.min[1]) / cellSize[1])
      const iz = Math.floor((pz - sceneBox.min[2]) / cellSize[2])
      if (ix < 0 || iy < 0 || iz < 0 || ix >= res || iy >= res || iz >= res) break
      const key = `${ix},${iy},${iz}`
      if (!visited.length || visited[visited.length - 1] !== key) {
        visited.push(key)
        if (objectCellMap.has(key)) {
          for (const o of objects) {
            const cmin0 = sceneBox.min[0] + ix * cellSize[0]
            const cmax0 = sceneBox.min[0] + (ix + 1) * cellSize[0]
            const cmin1 = sceneBox.min[1] + iy * cellSize[1]
            const cmax1 = sceneBox.min[1] + (iy + 1) * cellSize[1]
            const cmin2 = sceneBox.min[2] + iz * cellSize[2]
            const cmax2 = sceneBox.min[2] + (iz + 1) * cellSize[2]
            if (
              o.max[0] >= cmin0 && o.min[0] <= cmax0 &&
              o.max[1] >= cmin1 && o.min[1] <= cmax1 &&
              o.max[2] >= cmin2 && o.min[2] <= cmax2
            ) {
              primTests++
            }
          }
        }
      }
      t += Math.max(0.02, stepLen)
      if (t > hit.tFar) break
    }
    return { visited, primTests }
  }, [origin[0], origin[1], origin[2], dir[0], dir[1], dir[2], sceneBox, cellSize, objectCellMap, objects, res])

  const visitedSet = useMemo(() => new Set(traversal.visited), [traversal])

  const cells = []
  if (showAllCells) {
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        for (let k = 0; k < res; k++) {
          const key = `${i},${j},${k}`
          const isOverlap = objectCellMap.has(key)
          const isVisited = visitedSet.has(key)
          const min = [
            sceneBox.min[0] + i * cellSize[0],
            sceneBox.min[1] + j * cellSize[1],
            sceneBox.min[2] + k * cellSize[2],
          ]
          const max = [min[0] + cellSize[0], min[1] + cellSize[1], min[2] + cellSize[2]]
          let color = '#cfd9d2'
          let opacity = 0.18
          if (showOverlap && isOverlap) {
            color = COLOR.leaf
            opacity = 0.55
          }
          if (showTraversal && isVisited) {
            color = COLOR.visited
            opacity = 0.7
          }
          cells.push(<AABBBox key={key} min={min} max={max} color={color} opacity={opacity} />)
        }
      }
    }
  } else {
    for (const key of objectCellMap) {
      const [i, j, k] = key.split(',').map(Number)
      const min = [
        sceneBox.min[0] + i * cellSize[0],
        sceneBox.min[1] + j * cellSize[1],
        sceneBox.min[2] + k * cellSize[2],
      ]
      const max = [min[0] + cellSize[0], min[1] + cellSize[1], min[2] + cellSize[2]]
      cells.push(<AABBBox key={key} min={min} max={max} color={COLOR.leaf} opacity={0.5} />)
    }
    for (const key of visitedSet) {
      const [i, j, k] = key.split(',').map(Number)
      const min = [
        sceneBox.min[0] + i * cellSize[0],
        sceneBox.min[1] + j * cellSize[1],
        sceneBox.min[2] + k * cellSize[2],
      ]
      const max = [min[0] + cellSize[0], min[1] + cellSize[1], min[2] + cellSize[2]]
      cells.push(<AABBBox key={'v' + key} min={min} max={max} color={COLOR.visited} opacity={0.75} />)
    }
  }

  const totalCells = res * res * res
  const heuristic = Math.round(27 * nObj)

  const panel = (
    <>
      <Slider label="Grid resolution" value={res} min={1} max={14} step={1} onChange={setRes} fmt={(v) => `${v}³`} />
      <Slider label="Object count" value={nObj} min={3} max={60} step={1} onChange={setNObj} fmt={(v) => `${v}`} />
      <Slider label="Random seed" value={seed} min={1} max={50} step={1} onChange={setSeed} />
      <Slider label="Ray yaw" value={theta} min={-60} max={60} step={1} onChange={setTheta} fmt={(v) => `${v}°`} />
      <Slider label="Ray pitch" value={phi} min={-30} max={30} step={1} onChange={setPhi} fmt={(v) => `${v}°`} />
      <div className="rt2-divider" />
      <Toggle label="show all cells" checked={!!showAllCells} onChange={setShowAllCells} />
      <Toggle label="highlight overlap cells" checked={showOverlap} onChange={setShowOverlap} />
      <Toggle label="highlight ray-traversed" checked={showTraversal} onChange={setShowTraversal} />
      <div className="rt2-divider" />
      <StatBadge label="total cells" value={totalCells} tone="cyan" />
      <StatBadge label="objects" value={nObj} tone="purple" />
      <StatBadge label="ray cells visited" value={traversal.visited.length} tone="orange" />
      <StatBadge label="grid prim tests" value={traversal.primTests} tone="green" />
      <StatBadge label="brute-force tests" value={nObj} tone="red" />
      <StatBadge label="heuristic" value={`27·N ≈ ${heuristic}`} tone="cyan" />
      <Legend items={[
        { color: COLOR.leaf, label: 'object overlap' },
        { color: COLOR.visited, label: 'ray traversal' },
      ]} />
    </>
  )

  return (
    <DemoShell
      title="Uniform Grid 加速结构"
      desc="把场景切成均匀格子。构建时记录每个 cell 包含哪些物体；ray 沿穿越顺序逐 cell 测试，可空 cell 直接跳过。"
      panel={panel}
      height={500}
    >
      <SceneRig position={[8, 6, 9]}>
        <AABBBox min={sceneBox.min} max={sceneBox.max} color={COLOR.boxScene} opacity={0.6} />
        {cells}
        {objects.map((o) => (
          <mesh key={o.id} position={o.c}>
            <sphereGeometry args={[o.r, 18, 14]} />
            <meshStandardMaterial color={COLOR.primary} emissive="#1a3450" emissiveIntensity={0.15} roughness={0.55} metalness={0.1} />
          </mesh>
        ))}
        <RayLine origin={origin} dir={dir} length={16} color={COLOR.visited} />
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// Demo: Spatial Partition (Oct / KD / BSP)
// ----------------------------------------------------------------------------
export function SpatialPartitionDemo() {
  const [kind, setKind] = useState('kd')
  const [depth, setDepth] = useState(3)
  const sceneBox = { min: [-3, -1.6, -3], max: [3, 1.6, 3] }

  const planes = useMemo(() => {
    const out = []
    if (kind === 'oct') {
      const recurse = (bmin, bmax, d) => {
        if (d <= 0) return
        const cx = (bmin[0] + bmax[0]) / 2
        const cy = (bmin[1] + bmax[1]) / 2
        const cz = (bmin[2] + bmax[2]) / 2
        const colorIndex = depth - d
        out.push({ axis: 0, pos: cx, bmin: [...bmin], bmax: [...bmax], depth: colorIndex })
        out.push({ axis: 1, pos: cy, bmin: [...bmin], bmax: [...bmax], depth: colorIndex })
        out.push({ axis: 2, pos: cz, bmin: [...bmin], bmax: [...bmax], depth: colorIndex })
        if (d > 1) {
          for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) {
            const nMin = [i ? cx : bmin[0], j ? cy : bmin[1], k ? cz : bmin[2]]
            const nMax = [i ? bmax[0] : cx, j ? bmax[1] : cy, k ? bmax[2] : cz]
            recurse(nMin, nMax, d - 1)
          }
        }
      }
      recurse(sceneBox.min, sceneBox.max, depth)
    } else if (kind === 'kd') {
      const recurse = (bmin, bmax, d, axis) => {
        if (d <= 0) return
        const mid = (bmin[axis] + bmax[axis]) / 2
        out.push({ axis, pos: mid, bmin: [...bmin], bmax: [...bmax], depth: depth - d })
        if (d > 1) {
          const lMax = [...bmax]; lMax[axis] = mid
          const rMin = [...bmin]; rMin[axis] = mid
          recurse(bmin, lMax, d - 1, (axis + 1) % 3)
          recurse(rMin, bmax, d - 1, (axis + 1) % 3)
        }
      }
      recurse(sceneBox.min, sceneBox.max, depth, 0)
    } else {
      const recurse = (bmin, bmax, d, axis) => {
        if (d <= 0) return
        const ratio = 0.42 + 0.16 * (((depth - d) % 3) / 3)
        const mid = bmin[axis] + (bmax[axis] - bmin[axis]) * ratio
        out.push({ axis, pos: mid, bmin: [...bmin], bmax: [...bmax], depth: depth - d, oblique: true })
        if (d > 1) {
          const lMax = [...bmax]; lMax[axis] = mid
          const rMin = [...bmin]; rMin[axis] = mid
          recurse(bmin, lMax, d - 1, (axis + 2) % 3)
          recurse(rMin, bmax, d - 1, (axis + 2) % 3)
        }
      }
      recurse(sceneBox.min, sceneBox.max, depth, 1)
    }
    return out
  }, [kind, depth])

  const palette = ['#7ec49a', '#8ba4e6', '#e8a838', '#d18a8a', '#b89cd6', '#62a3d6', '#4a9e6e']
  const colorByDepth = (d) => palette[Math.min(palette.length - 1, d)]

  const panel = (
    <>
      <label className="rt2-ctrl">
        <span className="rt2-ctrl-label"><span>Partition Type</span></span>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="oct">Oct-Tree (8 children)</option>
          <option value="kd">KD-Tree (rotating axis)</option>
          <option value="bsp">BSP-Tree (any orientation)</option>
        </select>
      </label>
      <Slider label="depth" value={depth} min={1} max={5} step={1} onChange={setDepth} />
      <div className="rt2-divider" />
      <StatBadge label="planes" value={planes.length} tone="cyan" />
      <StatBadge label="leaves≈" value={kind === 'oct' ? Math.pow(8, depth) : Math.pow(2, depth)} tone="purple" />
      <Legend items={[0, 1, 2, 3, 4].slice(0, depth).map((d) => ({ color: colorByDepth(d), label: `depth ${d}` }))} />
      <Callout kind="mental" title="key difference">
        Oct-Tree splits 8-ways per step; KD-Tree splits along one axis; BSP-Tree uses arbitrary hyperplanes — flexible but harder to implement.
      </Callout>
    </>
  )

  return (
    <DemoShell
      title="Spatial Partition: Oct-Tree / KD-Tree / BSP-Tree"
      desc="切换不同空间划分策略，比较递归剖分形成的子区域。共同点：3D 空间被切成不重叠的子区域。"
      panel={panel}
      height={460}
    >
      <SceneRig position={[7, 5, 7]}>
        <AABBBox min={sceneBox.min} max={sceneBox.max} color={COLOR.boxScene} opacity={0.85} />
        {planes.map((pl, i) => {
          const cx = (pl.bmin[0] + pl.bmax[0]) / 2
          const cy = (pl.bmin[1] + pl.bmax[1]) / 2
          const cz = (pl.bmin[2] + pl.bmax[2]) / 2
          const sx = pl.bmax[0] - pl.bmin[0]
          const sy = pl.bmax[1] - pl.bmin[1]
          const sz = pl.bmax[2] - pl.bmin[2]
          const pos = [cx, cy, cz]
          const scale = [sx, sy, sz]
          if (pl.axis === 0) { pos[0] = pl.pos; scale[0] = 0.001 }
          else if (pl.axis === 1) { pos[1] = pl.pos; scale[1] = 0.001 }
          else { pos[2] = pl.pos; scale[2] = 0.001 }
          const rot = pl.oblique ? [0, 0, 0.18] : [0, 0, 0]
          return (
            <mesh key={i} position={pos} scale={scale} rotation={rot}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={colorByDepth(pl.depth)} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          )
        })}
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// KD-Tree
// ----------------------------------------------------------------------------
export function buildKDTree(objects, bmin, bmax, depth, maxDepth, leafSize) {
  const node = {
    bmin, bmax, depth, isLeaf: false, objects: [], left: null, right: null,
    splitAxis: -1, splitPos: 0, id: Math.random().toString(36).slice(2, 7),
  }
  const inside = objects.filter(
    (o) =>
      o.max[0] >= bmin[0] && o.min[0] <= bmax[0] &&
      o.max[1] >= bmin[1] && o.min[1] <= bmax[1] &&
      o.max[2] >= bmin[2] && o.min[2] <= bmax[2],
  )
  if (depth >= maxDepth || inside.length <= leafSize) {
    node.isLeaf = true
    node.objects = inside
    return node
  }
  const axis = longestAxis(bmin, bmax)
  const splitPos = (bmin[axis] + bmax[axis]) / 2
  node.splitAxis = axis
  node.splitPos = splitPos
  const lMax = [...bmax]; lMax[axis] = splitPos
  const rMin = [...bmin]; rMin[axis] = splitPos
  node.left = buildKDTree(inside, bmin, lMax, depth + 1, maxDepth, leafSize)
  node.right = buildKDTree(inside, rMin, bmax, depth + 1, maxDepth, leafSize)
  return node
}

export function traverseKDTree(node, origin, dir) {
  const visited = []
  const tested = []
  let bestT = Infinity
  let bestObj = null
  const recurse = (n) => {
    if (!n) return
    const hit = intersectRayAABB(origin, dir, n.bmin, n.bmax)
    if (!hit || hit.tFar < 0 || hit.tNear > bestT) return
    visited.push(n)
    if (n.isLeaf) {
      for (const o of n.objects) {
        const t = raySphere(origin, dir, o.c, o.r)
        tested.push(o.id)
        if (t !== null && t < bestT) { bestT = t; bestObj = o }
      }
    } else {
      recurse(n.left)
      recurse(n.right)
    }
  }
  recurse(node)
  return { visited, tested, bestT, bestObj }
}

export function flattenKD(node, out = []) {
  if (!node) return out
  out.push(node)
  if (!node.isLeaf) { flattenKD(node.left, out); flattenKD(node.right, out) }
  return out
}

export function KDTreeDemo() {
  const [maxDepth, setMaxDepth] = useState(4)
  const [leafSize, setLeafSize] = useState(2)
  const [nObj, setNObj] = useState(14)
  const [seed, setSeed] = useState(11)
  const [theta, setTheta] = useState(18)
  const [phi, setPhi] = useState(8)
  const [showInternal, setShowInternal] = useState(true)
  const [showLeaves, setShowLeaves] = useState(true)
  const [showVisited, setShowVisited] = useState(false)

  const objects = useMemo(() => genRandomSpheres(nObj, seed, 5), [nObj, seed])
  const sceneBox = useMemo(() => unionBoxes(objects), [objects])
  const tree = useMemo(
    () => buildKDTree(objects, sceneBox.min, sceneBox.max, 0, maxDepth, leafSize),
    [objects, sceneBox, maxDepth, leafSize],
  )
  const dir = useMemo(() => {
    const t = (theta * Math.PI) / 180
    const p = (phi * Math.PI) / 180
    return [Math.cos(p) * Math.cos(t), Math.sin(p), Math.cos(p) * Math.sin(t)]
  }, [theta, phi])
  const origin = [-7, 0.4, -3]
  const trav = useMemo(
    () => traverseKDTree(tree, origin, dir),
    [tree, origin[0], origin[1], origin[2], dir[0], dir[1], dir[2]],
  )
  const allNodes = useMemo(() => flattenKD(tree), [tree])
  const visitedSet = useMemo(() => new Set(trav.visited.map((n) => n.id)), [trav])
  const palette = ['#7ec49a', '#8ba4e6', '#e8a838', '#d18a8a', '#b89cd6', '#62a3d6']
  const colorByDepth = (d) => palette[Math.min(palette.length - 1, d)]
  const hitPoint = trav.bestObj && trav.bestT !== Infinity
    ? [origin[0] + dir[0] * trav.bestT, origin[1] + dir[1] * trav.bestT, origin[2] + dir[2] * trav.bestT]
    : null

  const panel = (
    <>
      <Slider label="max depth" value={maxDepth} min={0} max={6} step={1} onChange={setMaxDepth} />
      <Slider label="leaf size" value={leafSize} min={1} max={6} step={1} onChange={setLeafSize} />
      <Slider label="object count" value={nObj} min={3} max={40} step={1} onChange={setNObj} />
      <Slider label="seed" value={seed} min={1} max={50} step={1} onChange={setSeed} />
      <Slider label="ray yaw" value={theta} min={-60} max={60} step={1} onChange={setTheta} fmt={(v) => `${v}°`} />
      <Slider label="ray pitch" value={phi} min={-30} max={30} step={1} onChange={setPhi} fmt={(v) => `${v}°`} />
      <div className="rt2-divider" />
      <Toggle label="show internal boxes" checked={showInternal} onChange={setShowInternal} />
      <Toggle label="show leaf boxes" checked={showLeaves} onChange={setShowLeaves} />
      <Toggle label="show visited only" checked={showVisited} onChange={setShowVisited} />
      <div className="rt2-divider" />
      <StatBadge label="total nodes" value={allNodes.length} tone="cyan" />
      <StatBadge label="leaves" value={allNodes.filter((n) => n.isLeaf).length} tone="purple" />
      <StatBadge label="bbox tests" value={trav.visited.length} tone="orange" />
      <StatBadge label="prim tests" value={trav.tested.length} tone="green" />
      <StatBadge label="brute force" value={objects.length} tone="red" />
      <StatBadge label="closest hit" value={trav.bestObj ? `#${trav.bestObj.id}` : 'miss'} tone={trav.bestObj ? 'green' : 'red'} />
    </>
  )

  return (
    <DemoShell
      title="KD-Tree: 递归二叉切分"
      desc="沿最长轴在中点切分。Internal node 不存物体，只有 leaf 存 object list。一个物体可能跨越多个 leaf。"
      panel={panel}
      height={520}
    >
      <SceneRig position={[10, 7, 10]}>
        <AABBBox min={sceneBox.min} max={sceneBox.max} color={COLOR.boxScene} opacity={0.5} />
        {allNodes.map((n) => {
          const isVisited = visitedSet.has(n.id)
          if (showVisited && !isVisited) return null
          if (n.isLeaf && !showLeaves) return null
          if (!n.isLeaf && !showInternal) return null
          const color = isVisited ? COLOR.visited : colorByDepth(n.depth)
          const opacity = isVisited ? 0.9 : 0.4
          return <AABBBox key={n.id} min={n.bmin} max={n.bmax} color={color} opacity={opacity} />
        })}
        {objects.map((o) => {
          const isHit = trav.bestObj && trav.bestObj.id === o.id
          return (
            <mesh key={o.id} position={o.c}>
              <sphereGeometry args={[o.r, 18, 14]} />
              <meshStandardMaterial
                color={isHit ? COLOR.primaryHit : COLOR.primary}
                emissive={isHit ? '#1a4a2a' : '#0f2a45'}
                emissiveIntensity={0.2}
                roughness={0.5}
              />
            </mesh>
          )
        })}
        <RayLine origin={origin} dir={dir} length={20} color={trav.bestObj ? COLOR.rayHit : COLOR.rayMiss} />
        {hitPoint && <HitMarker position={hitPoint} color={COLOR.hit} size={0.11} />}
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// BVH
// ----------------------------------------------------------------------------
export function buildBVH(objects, leafSize) {
  const recurse = (objs, depth) => {
    const node = {
      isLeaf: false, depth, objects: [], left: null, right: null,
      bmin: [0, 0, 0], bmax: [0, 0, 0], id: Math.random().toString(36).slice(2, 7),
    }
    const box = unionBoxes(objs)
    node.bmin = box.min
    node.bmax = box.max
    if (objs.length <= leafSize) {
      node.isLeaf = true
      node.objects = objs
      return node
    }
    const axis = longestAxis(box.min, box.max)
    const sorted = [...objs].sort((a, b) => a.c[axis] - b.c[axis])
    const mid = Math.floor(sorted.length / 2)
    const left = sorted.slice(0, mid)
    const right = sorted.slice(mid)
    if (left.length === 0 || right.length === 0) {
      node.isLeaf = true
      node.objects = objs
      return node
    }
    node.left = recurse(left, depth + 1)
    node.right = recurse(right, depth + 1)
    return node
  }
  return recurse(objects, 0)
}

export function traverseBVH(node, origin, dir) {
  const visited = []
  const tested = []
  let bboxTests = 0
  let bestT = Infinity
  let bestObj = null
  const recurse = (n) => {
    if (!n) return
    bboxTests++
    const hit = intersectRayAABB(origin, dir, n.bmin, n.bmax)
    if (!hit || hit.tFar < 0 || hit.tNear > bestT) return
    visited.push(n)
    if (n.isLeaf) {
      for (const o of n.objects) {
        const t = raySphere(origin, dir, o.c, o.r)
        tested.push(o.id)
        if (t !== null && t < bestT) { bestT = t; bestObj = o }
      }
    } else {
      recurse(n.left)
      recurse(n.right)
    }
  }
  recurse(node)
  return { visited, tested, bboxTests, bestT, bestObj }
}

export function flattenBVH(node, out = []) {
  if (!node) return out
  out.push(node)
  if (!node.isLeaf) { flattenBVH(node.left, out); flattenBVH(node.right, out) }
  return out
}

export function BVHDemo() {
  const [leafSize, setLeafSize] = useState(2)
  const [nObj, setNObj] = useState(20)
  const [seed, setSeed] = useState(13)
  const [theta, setTheta] = useState(22)
  const [phi, setPhi] = useState(6)
  const [showAll, setShowAll] = useState(true)
  const [showLeaves, setShowLeaves] = useState(true)
  const [showVisited, setShowVisited] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)

  useEffect(() => {
    if (!autoRotate) return
    const id = setInterval(() => {
      setTheta((t) => {
        const next = t + 0.7
        return next > 60 ? -60 : next
      })
    }, 60)
    return () => clearInterval(id)
  }, [autoRotate])

  const objects = useMemo(() => genRandomSpheres(nObj, seed, 6), [nObj, seed])
  const tree = useMemo(() => buildBVH(objects, leafSize), [objects, leafSize])
  const dir = useMemo(() => {
    const t = (theta * Math.PI) / 180
    const p = (phi * Math.PI) / 180
    return [Math.cos(p) * Math.cos(t), Math.sin(p), Math.cos(p) * Math.sin(t)]
  }, [theta, phi])
  const origin = [-8, 0.6, -3]
  const trav = useMemo(
    () => traverseBVH(tree, origin, dir),
    [tree, origin[0], origin[1], origin[2], dir[0], dir[1], dir[2]],
  )
  const allNodes = useMemo(() => flattenBVH(tree), [tree])
  const visitedSet = useMemo(() => new Set(trav.visited.map((n) => n.id)), [trav])
  const maxDepth = useMemo(() => allNodes.reduce((m, n) => Math.max(m, n.depth), 0), [allNodes])
  const palette = ['#7ec49a', '#8ba4e6', '#e8a838', '#d18a8a', '#b89cd6', '#62a3d6', '#4a9e6e']
  const colorByDepth = (d) => palette[Math.min(palette.length - 1, d)]
  const hitPoint = trav.bestObj && trav.bestT !== Infinity
    ? [origin[0] + dir[0] * trav.bestT, origin[1] + dir[1] * trav.bestT, origin[2] + dir[2] * trav.bestT]
    : null

  const panel = (
    <>
      <Slider label="leaf size" value={leafSize} min={1} max={8} step={1} onChange={setLeafSize} />
      <Slider label="object count" value={nObj} min={4} max={60} step={1} onChange={setNObj} />
      <Slider label="seed" value={seed} min={1} max={80} step={1} onChange={setSeed} />
      <Slider label="ray yaw" value={theta} min={-60} max={60} step={1} onChange={setTheta} fmt={(v) => `${v}°`} />
      <Slider label="ray pitch" value={phi} min={-25} max={25} step={1} onChange={setPhi} fmt={(v) => `${v}°`} />
      <div className="rt2-divider" />
      <Toggle label="show all bboxes" checked={showAll} onChange={setShowAll} />
      <Toggle label="show leaf bboxes" checked={showLeaves} onChange={setShowLeaves} />
      <Toggle label="visited only" checked={showVisited} onChange={setShowVisited} />
      <Toggle label="auto rotate ray" checked={autoRotate} onChange={setAutoRotate} />
      <div className="rt2-divider" />
      <StatBadge label="tree depth" value={maxDepth} tone="cyan" />
      <StatBadge label="nodes" value={allNodes.length} tone="cyan" />
      <StatBadge label="leaves" value={allNodes.filter((n) => n.isLeaf).length} tone="purple" />
      <StatBadge label="bbox tests" value={trav.bboxTests} tone="orange" />
      <StatBadge label="prim tests (BVH)" value={trav.tested.length} tone="green" />
      <StatBadge label="brute force" value={objects.length} tone="red" />
      <StatBadge label="closest hit" value={trav.bestObj ? `#${trav.bestObj.id}` : 'miss'} tone={trav.bestObj ? 'green' : 'red'} />
      <Legend items={[
        { color: '#7ec49a', label: 'depth 0' },
        { color: COLOR.visited, label: 'visited' },
        { color: COLOR.primaryHit, label: 'hit object' },
      ]} />
    </>
  )

  return (
    <DemoShell
      title="BVH: 基于物体的层次包围体"
      desc="按 object centroid 在最长轴上 median split，递归构建。Internal node 存 bbox 和 children，leaf 存 bbox 和 object list。Bounding boxes 在空间上可重叠。"
      panel={panel}
      height={540}
    >
      <SceneRig position={[10, 7, 11]}>
        {allNodes.map((n) => {
          const isVisited = visitedSet.has(n.id)
          if (showVisited && !isVisited) return null
          if (!showAll && !n.isLeaf) return null
          if (n.isLeaf && !showLeaves) return null
          let color = colorByDepth(n.depth)
          let opacity = 0.22 + 0.06 * (maxDepth - n.depth)
          if (isVisited) { color = COLOR.visited; opacity = 0.85 }
          if (n.isLeaf && !isVisited) { color = COLOR.leaf; opacity = 0.55 }
          return <AABBBox key={n.id} min={n.bmin} max={n.bmax} color={color} opacity={opacity} />
        })}
        {objects.map((o) => {
          const isHit = trav.bestObj && trav.bestObj.id === o.id
          return (
            <mesh key={o.id} position={o.c}>
              <sphereGeometry args={[o.r, 18, 14]} />
              <meshStandardMaterial
                color={isHit ? COLOR.primaryHit : COLOR.primary}
                emissive={isHit ? '#1a4a2a' : '#0f2a45'}
                emissiveIntensity={0.2}
                roughness={0.45}
              />
            </mesh>
          )
        })}
        <RayLine origin={origin} dir={dir} length={22} color={trav.bestObj ? COLOR.rayHit : COLOR.rayMiss} />
        {hitPoint && <HitMarker position={hitPoint} color={COLOR.primaryHit} size={0.12} />}
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// Spatial vs Object — side-by-side
// ----------------------------------------------------------------------------
export function SpatialVsObjectDemo() {
  const objects = useMemo(() => genRandomSpheres(10, 23, 4.5), [])
  const sceneBox = useMemo(() => unionBoxes(objects), [objects])
  const kd = useMemo(() => buildKDTree(objects, sceneBox.min, sceneBox.max, 0, 4, 2), [objects, sceneBox])
  const bvh = useMemo(() => buildBVH(objects, 2), [objects])
  const kdNodes = useMemo(() => flattenKD(kd), [kd])
  const bvhNodes = useMemo(() => flattenBVH(bvh), [bvh])
  const palette = ['#7ec49a', '#8ba4e6', '#e8a838', '#d18a8a', '#b89cd6', '#62a3d6']
  const colorByDepth = (d) => palette[Math.min(palette.length - 1, d)]

  return (
    <div className="rt2 rt2-breakout">
      <div className="rt2-demo">
        <div className="rt2-demo-head">
          <div className="rt2-demo-title">Spatial Partition vs Object Partition</div>
          <div className="rt2-demo-desc">
            同一组物体，左 KD-Tree（spatial），右 BVH（object）。左侧空间不重叠，但物体可跨多个区域；右侧物体只属于一个 leaf，但 bbox 可重叠。
          </div>
        </div>
        <div className="rt2-grid2" style={{ gap: 0, margin: 0 }}>
          <div style={{ position: 'relative', minHeight: 460, borderRight: '1px solid rgba(126,196,154,0.18)' }}>
            <div className="rt2-sbs-label mint">KD-TREE · SPATIAL</div>
            <SceneRig position={[8, 6, 8]}>
              <AABBBox min={sceneBox.min} max={sceneBox.max} color={COLOR.boxScene} opacity={0.5} />
              {kdNodes.map((n) => (
                <AABBBox
                  key={n.id}
                  min={n.bmin}
                  max={n.bmax}
                  color={colorByDepth(n.depth)}
                  opacity={n.isLeaf ? 0.55 : 0.22}
                />
              ))}
              {objects.map((o) => (
                <mesh key={o.id} position={o.c}>
                  <sphereGeometry args={[o.r, 16, 12]} />
                  <meshStandardMaterial color={COLOR.primary} emissive="#0f2a45" emissiveIntensity={0.2} roughness={0.5} />
                </mesh>
              ))}
            </SceneRig>
          </div>
          <div style={{ position: 'relative', minHeight: 460 }}>
            <div className="rt2-sbs-label lilac">BVH · OBJECT</div>
            <SceneRig position={[8, 6, 8]}>
              {bvhNodes.map((n) => (
                <AABBBox
                  key={n.id}
                  min={n.bmin}
                  max={n.bmax}
                  color={colorByDepth(n.depth)}
                  opacity={n.isLeaf ? 0.6 : 0.22}
                />
              ))}
              {objects.map((o) => (
                <mesh key={o.id} position={o.c}>
                  <sphereGeometry args={[o.r, 16, 12]} />
                  <meshStandardMaterial color={COLOR.leaf} emissive="#3a2055" emissiveIntensity={0.2} roughness={0.5} />
                </mesh>
              ))}
            </SceneRig>
          </div>
        </div>
      </div>
    </div>
  )
}


// ----------------------------------------------------------------------------
// Photon particles
// ----------------------------------------------------------------------------
function PhotonParticles({ count = 200, speed = 1.0, sourcePos = [0, 0, 0], color = '#e8a838' }) {
  const ref = useRef()
  const meta = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const dirs = []
    const rand = makeSeededRand(99)
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1
      const t = rand() * 2 * Math.PI
      const r = Math.sqrt(1 - u * u)
      dirs.push([r * Math.cos(t), u, r * Math.sin(t)])
      arr[i * 3] = sourcePos[0]
      arr[i * 3 + 1] = sourcePos[1]
      arr[i * 3 + 2] = sourcePos[2]
    }
    const lifeT = new Float32Array(count)
    for (let i = 0; i < count; i++) lifeT[i] = rand() * 2.5
    return { arr, dirs, lifeT }
  }, [count, sourcePos[0], sourcePos[1], sourcePos[2]])

  useFrame((_, dt) => {
    if (!ref.current) return
    const positions = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      meta.lifeT[i] += dt * speed
      if (meta.lifeT[i] > 2.6) {
        meta.lifeT[i] = 0
        positions[i * 3] = sourcePos[0]
        positions[i * 3 + 1] = sourcePos[1]
        positions[i * 3 + 2] = sourcePos[2]
      } else {
        positions[i * 3] = sourcePos[0] + meta.dirs[i][0] * meta.lifeT[i] * 1.4
        positions[i * 3 + 1] = sourcePos[1] + meta.dirs[i][1] * meta.lifeT[i] * 1.4
        positions[i * 3 + 2] = sourcePos[2] + meta.dirs[i][2] * meta.lifeT[i] * 1.4
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={meta.arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// ----------------------------------------------------------------------------
// Demo: Radiant Flux
// ----------------------------------------------------------------------------
export function FluxDemo() {
  const [flux, setFlux] = useState(60)
  const [dt, setDt] = useState(1.0)
  const photonsPerSec = flux * 8
  const energyPerSec = flux
  const totalEnergyOverDt = energyPerSec * dt

  const panel = (
    <>
      <Slider label="Φ (Watt)" value={flux} min={5} max={200} step={1} onChange={setFlux} fmt={(v) => `${v} W`} />
      <Slider label="Δt (s)" value={dt} min={0.1} max={5} step={0.1} onChange={setDt} fmt={(v) => `${v.toFixed(1)} s`} />
      <div className="rt2-divider" />
      <StatBadge label="photon flow" value={`≈ ${photonsPerSec}/s`} tone="cyan" />
      <StatBadge label="energy / sec" value={`${energyPerSec} J/s`} tone="orange" />
      <StatBadge label="ΔQ over Δt" value={`${totalEnergyOverDt.toFixed(1)} J`} tone="green" />
      <Formula>Φ = dQ / dt &nbsp;[ Watt ]</Formula>
      <Legend items={[
        { color: '#e8a838', label: 'photon packets' },
        { color: '#62a3d6', label: 'sensor area' },
      ]} />
    </>
  )

  return (
    <DemoShell
      title="Radiant Flux: 单位时间能量"
      desc="光源向四周发射能量包。Flux 就是单位时间内通过传感器（或离开光源）的能量。"
      panel={panel}
      height={440}
    >
      <SceneRig position={[5, 3, 6]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshBasicMaterial color="#e8a838" />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#e8a838" />
        <PhotonParticles count={Math.min(220, flux * 3)} speed={Math.max(0.5, dt) * 1.2} sourcePos={[0, 0, 0]} />
        <mesh position={[2.6, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <ringGeometry args={[0.55, 0.7, 32]} />
          <meshBasicMaterial color="#62a3d6" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[2.6, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial color="#62a3d6" transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
        <Html position={[2.6, 0.95, 0]} center>
          <div
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #62a3d6',
              color: '#4a8ad6',
              padding: '0.25rem 0.7rem',
              borderRadius: 100,
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(45,80,60,0.1)',
            }}
          >
            sensor
          </div>
        </Html>
      </SceneRig>
    </DemoShell>
  )
}


// ----------------------------------------------------------------------------
// Solid angle patch + demo
// ----------------------------------------------------------------------------
function SolidAnglePatch({ thetaMin, thetaMax, phiMin, phiMax, radius = 1.6, color = '#7ec49a', opacity = 0.7 }) {
  const geom = useMemo(() => {
    const segT = 24
    const segP = 24
    const positions = []
    const indices = []
    for (let i = 0; i <= segT; i++) {
      for (let j = 0; j <= segP; j++) {
        const t = thetaMin + (thetaMax - thetaMin) * (i / segT)
        const p = phiMin + (phiMax - phiMin) * (j / segP)
        const x = radius * Math.sin(t) * Math.cos(p)
        const y = radius * Math.cos(t)
        const z = radius * Math.sin(t) * Math.sin(p)
        positions.push(x, y, z)
      }
    }
    for (let i = 0; i < segT; i++) {
      for (let j = 0; j < segP; j++) {
        const a = i * (segP + 1) + j
        const b = a + 1
        const c = a + (segP + 1)
        const d = c + 1
        indices.push(a, c, b, b, c, d)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [thetaMin, thetaMax, phiMin, phiMax, radius])

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

export function SolidAngleDemo() {
  const [thetaC, setThetaC] = useState(60)
  const [phiC, setPhiC] = useState(0)
  const [thetaW, setThetaW] = useState(40)
  const [phiW, setPhiW] = useState(50)
  const [radius, setRadius] = useState(1.6)

  const tMin = ((thetaC - thetaW / 2) * Math.PI) / 180
  const tMax = ((thetaC + thetaW / 2) * Math.PI) / 180
  const pMin = ((phiC - phiW / 2) * Math.PI) / 180
  const pMax = ((phiC + phiW / 2) * Math.PI) / 180

  const omega = useMemo(
    () => Math.abs((Math.cos(tMin) - Math.cos(tMax)) * (pMax - pMin)),
    [tMin, tMax, pMin, pMax],
  )
  const area = omega * radius * radius

  const dirArrow = useMemo(() => {
    const t = (thetaC * Math.PI) / 180
    const p = (phiC * Math.PI) / 180
    return [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)]
  }, [thetaC, phiC])

  const panel = (
    <>
      <Slider label="θ center" value={thetaC} min={10} max={170} step={1} onChange={setThetaC} fmt={(v) => `${v}°`} />
      <Slider label="φ center" value={phiC} min={-180} max={180} step={1} onChange={setPhiC} fmt={(v) => `${v}°`} />
      <Slider label="θ width" value={thetaW} min={5} max={120} step={1} onChange={setThetaW} fmt={(v) => `${v}°`} />
      <Slider label="φ width" value={phiW} min={5} max={180} step={1} onChange={setPhiW} fmt={(v) => `${v}°`} />
      <Slider label="radius r" value={radius} min={0.6} max={3} step={0.05} onChange={setRadius} fmt={(v) => v.toFixed(2)} />
      <div className="rt2-divider" />
      <StatBadge label="Ω (sr)" value={omega.toFixed(3)} tone="cyan" />
      <StatBadge label="A on sphere" value={area.toFixed(3)} tone="orange" />
      <StatBadge label="Ω / 4π" value={`${((omega / (4 * Math.PI)) * 100).toFixed(2)}%`} tone="purple" />
      <StatBadge label="full sphere" value={`4π ≈ ${(4 * Math.PI).toFixed(3)}`} tone="green" />
      <Formula>Ω = A / r² &nbsp;|&nbsp; dω = sinθ dθ dφ</Formula>
    </>
  )

  return (
    <DemoShell
      title="Solid Angle 立体角"
      desc="patch 在球面上的投影面积除以 r²。整球 4π，半球 2π。dω = sinθ dθ dφ — 关键在于 sinθ 因子。"
      panel={panel}
      height={460}
    >
      <SceneRig position={[5, 3.5, 5]} showGrid={false}>
        <mesh>
          <sphereGeometry args={[radius, 32, 24]} />
          <meshBasicMaterial color="#9bb0a4" wireframe transparent opacity={0.4} />
        </mesh>
        <SolidAnglePatch
          thetaMin={tMin}
          thetaMax={tMax}
          phiMin={pMin}
          phiMax={pMax}
          radius={radius * 1.005}
          color="#e8a838"
          opacity={0.85}
        />
        <DirectionArrow origin={[0, 0, 0]} dir={dirArrow} length={radius * 1.25} color="#4a8ad6" />
        <mesh>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshBasicMaterial color="#1a2b22" />
        </mesh>
      </SceneRig>
    </DemoShell>
  )
}

// ----------------------------------------------------------------------------
// Demo: Isotropic Point Source
// ----------------------------------------------------------------------------
export function IsotropicSourceDemo() {
  const [phi, setPhi] = useState(815)
  const [showRays, setShowRays] = useState(true)
  const I = phi / (4 * Math.PI)

  const rays = useMemo(() => {
    const rand = makeSeededRand(31)
    const out = []
    for (let i = 0; i < 80; i++) {
      const u = rand() * 2 - 1
      const t = rand() * 2 * Math.PI
      const r = Math.sqrt(1 - u * u)
      out.push([0, 0, 0, r * Math.cos(t) * 1.6, u * 1.6, r * Math.sin(t) * 1.6])
    }
    return out
  }, [])

  const panel = (
    <>
      <Slider label="Φ (lumen)" value={phi} min={50} max={3000} step={5} onChange={setPhi} fmt={(v) => `${v} lm`} />
      <Toggle label="show emitted rays" checked={showRays} onChange={setShowRays} />
      <div className="rt2-divider" />
      <StatBadge label="I = Φ / 4π" value={`${I.toFixed(2)} cd`} tone="cyan" />
      <StatBadge label="full sphere Ω" value={`4π ≈ ${(4 * Math.PI).toFixed(3)} sr`} tone="purple" />
      <Formula>I = Φ / 4π &nbsp;[ candela ]</Formula>
      <Callout kind="warning" title="photometric vs radiometric">
        lumen / candela 是 photometric 单位，已加权人眼灵敏度；与 radiometric 的 W / W·sr⁻¹ 数学结构一致，但不可直接换算。
      </Callout>
    </>
  )

  return (
    <DemoShell
      title="Isotropic Point Source: I = Φ / 4π"
      desc="各向同性点光源把 flux 均匀分配到 4π 立体角。常见 LED 例：815 lm 假设各向同性 → ≈ 65 cd。"
      panel={panel}
      height={420}
    >
      <SceneRig position={[4, 3, 4]} showGrid={false}>
        <mesh>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshBasicMaterial color="#e8a838" />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={2} color="#e8a838" />
        {showRays &&
          rays.map((r, i) => (
            <Line
              key={i}
              points={[[r[0], r[1], r[2]], [r[3], r[4], r[5]]]}
              color="#e8a838"
              lineWidth={1}
              transparent
              opacity={0.55}
            />
          ))}
        <mesh>
          <sphereGeometry args={[1.65, 24, 18]} />
          <meshBasicMaterial color="#62a3d6" wireframe transparent opacity={0.22} />
        </mesh>
      </SceneRig>
    </DemoShell>
  )
}
