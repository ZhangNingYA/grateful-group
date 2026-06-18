import { useEffect, useMemo } from 'react';

export default function MemoryStoryPage({
  headerLabel = 'Memory Timeline',
  meta = [],
  title,
  lead,
  quote,
  stats = [],
  badge,
  highlights = [],
  timeline,
  fragments,
  closing,
}) {
  const decor = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        x: `${6 + ((index * 11) % 88)}%`,
        y: `${8 + ((index * 17) % 80)}%`,
        delay: `${index * 0.6}s`,
        duration: `${8 + (index % 5) * 1.15}s`,
        symbol: ['✦', '✧', '·', '♡'][index % 4],
      })),
    [],
  );

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-memory-reveal]'));
    if (!targets.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -48px 0px' },
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="msp-page">
      <style>{styles}</style>

      <div className="msp-decor" aria-hidden="true">
        {decor.map((item) => (
          <span
            key={item.id}
            className="msp-decor-item"
            style={{
              '--x': item.x,
              '--y': item.y,
              '--delay': item.delay,
              '--duration': item.duration,
            }}
          >
            {item.symbol}
          </span>
        ))}
      </div>

      <div className="msp-shell">
        <nav className="msp-topchip">
          <span className="msp-pulse" />
          <span>{headerLabel}</span>
          {meta.map((item) => (
            <span className="msp-topchip-item" key={item}>
              {item}
            </span>
          ))}
        </nav>

        <section className="msp-hero">
          <div className="msp-hero-copy" data-memory-reveal>
            <p className="msp-kicker">{badge?.eyebrow || 'Memory Page'}</p>
            <div className="msp-meta-row">
              {meta.map((item) => (
                <span className="msp-meta-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <h1>{title}</h1>
            <p className="msp-lead">{lead}</p>
            {quote ? <p className="msp-quote">{quote}</p> : null}

            {stats.length ? (
              <div className="msp-stats" role="list" aria-label="纪念信息">
                {stats.map((item) => (
                  <div className="msp-stat" role="listitem" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="msp-badge-card" data-memory-reveal>
            <div className="msp-badge">
              <div className="msp-badge-ring msp-badge-ring-a" />
              <div className="msp-badge-ring msp-badge-ring-b" />
              <div className="msp-badge-center">
                <span>{badge?.eyebrow}</span>
                <strong>{badge?.value}</strong>
                <em>{badge?.label}</em>
              </div>
            </div>

            {highlights.length ? (
              <div className="msp-highlights">
                {highlights.map((item) => (
                  <div className="msp-highlight" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </section>
      </div>

      <div className="msp-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
          <path
            d="M0 34 Q 150 8 300 34 T 600 34 T 900 34 T 1200 34 L1200 70 L0 70 Z"
            fill="rgba(255,255,255,0.45)"
          />
          <path
            d="M0 34 Q 150 58 300 34 T 600 34 T 900 34 T 1200 34"
            fill="none"
            stroke="rgba(212, 70, 123, 0.42)"
            strokeWidth="1.4"
            strokeDasharray="2 7"
          />
        </svg>
        <span>❀</span>
      </div>

      <section className="msp-section">
        <div className="msp-shell">
          <header className="msp-section-head" data-memory-reveal>
            <p>{timeline.eyebrow}</p>
            <h2>{timeline.title}</h2>
            {timeline.lead ? <div className="msp-section-lead">{timeline.lead}</div> : null}
          </header>

          <ol className="msp-timeline">
            {timeline.items.map((item, index) => (
              <li className="msp-timeline-item" key={`${item.title}-${index}`} data-memory-reveal>
                <div className="msp-timeline-mark">
                  <span className="msp-timeline-no">{String(index + 1).padStart(2, '0')}</span>
                  <span className="msp-timeline-moment">{item.moment}</span>
                </div>
                <article className="msp-timeline-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="msp-section msp-section-soft">
        <div className="msp-shell">
          <header className="msp-section-head" data-memory-reveal>
            <p>{fragments.eyebrow}</p>
            <h2>{fragments.title}</h2>
            {fragments.lead ? <div className="msp-section-lead">{fragments.lead}</div> : null}
          </header>

          <div className="msp-fragment-grid">
            {fragments.items.map((item, index) => (
              <article className="msp-fragment" key={`${item.title}-${index}`} data-memory-reveal>
                <span className="msp-fragment-no">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="msp-closing">
        <div className="msp-shell">
          <div className="msp-closing-inner" data-memory-reveal>
            <p>{closing.mark}</p>
            <h2>{closing.title}</h2>
            {closing.text ? <div className="msp-closing-copy">{closing.text}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = `
  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background:
      linear-gradient(180deg, #fdf6f0 0%, #fffaf7 48%, #f7fbff 100%),
      repeating-linear-gradient(120deg, rgba(212, 70, 123, 0.025) 0 1px, transparent 1px 26px),
      repeating-linear-gradient(60deg, rgba(121, 189, 214, 0.025) 0 1px, transparent 1px 32px);
    color: #3a2a34;
    font-family: ui-rounded, 'SF Pro Rounded', 'HarmonyOS Sans SC', 'Microsoft YaHei', system-ui, sans-serif;
    overflow-x: hidden;
  }

  .msp-page {
    position: relative;
    min-height: 100vh;
    padding: max(0.9rem, env(safe-area-inset-top)) 0 5.5rem;
  }

  .msp-shell {
    width: min(1160px, calc(100vw - 40px));
    margin: 0 auto;
  }

  .msp-decor {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .msp-decor-item {
    position: absolute;
    left: var(--x);
    top: var(--y);
    color: rgba(212, 70, 123, 0.22);
    font-size: 0.88rem;
    line-height: 1;
    animation: msp-float var(--duration) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .msp-decor-item:nth-child(3n) {
    color: rgba(121, 189, 214, 0.2);
  }

  .msp-decor-item:nth-child(4n) {
    color: rgba(168, 123, 214, 0.2);
  }

  .msp-topchip {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 0 14px;
    margin-top: 8px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: 0 14px 36px rgba(134, 109, 120, 0.09), inset 0 1px rgba(255,255,255,0.92);
    backdrop-filter: blur(18px);
    color: #72535f;
    font-size: 0.88rem;
  }

  .msp-pulse {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(135deg, #d4467b, #e89855);
    box-shadow: 0 0 0 6px rgba(212, 70, 123, 0.1);
  }

  .msp-topchip-item {
    padding-left: 10px;
    border-left: 1px solid rgba(123, 94, 106, 0.16);
    color: #8d6c79;
  }

  .msp-hero {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
    gap: 34px;
    align-items: center;
    padding: 38px 0 30px;
  }

  .msp-kicker,
  .msp-section-head p,
  .msp-closing-inner p {
    margin: 0 0 14px;
    font-size: 0.82rem;
    text-transform: uppercase;
    color: #a16a7b;
    letter-spacing: 0;
  }

  .msp-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .msp-meta-pill {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 13px;
    border-radius: 999px;
    border: 1px solid rgba(162, 118, 136, 0.22);
    background: rgba(255, 255, 255, 0.65);
    color: #6f505c;
    font-size: 0.9rem;
    backdrop-filter: blur(12px);
  }

  .msp-hero h1,
  .msp-section-head h2,
  .msp-closing-inner h2 {
    margin: 16px 0 0;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    letter-spacing: 0;
    color: #2d1f27;
  }

  .msp-hero h1 {
    max-width: 11ch;
    font-size: clamp(3rem, 6vw, 5.8rem);
    line-height: 0.96;
  }

  .msp-lead,
  .msp-quote,
  .msp-section-lead,
  .msp-timeline-card p,
  .msp-fragment p,
  .msp-closing-copy {
    margin: 18px 0 0;
    font-size: 1.02rem;
    line-height: 1.82;
    color: #5d4b53;
  }

  .msp-quote {
    max-width: 42rem;
    padding-left: 16px;
    border-left: 2px solid rgba(212, 70, 123, 0.25);
    color: #6f5560;
  }

  .msp-stats,
  .msp-highlights,
  .msp-fragment-grid {
    display: grid;
    gap: 14px;
  }

  .msp-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 30px;
  }

  .msp-stat,
  .msp-highlight,
  .msp-timeline-card,
  .msp-fragment {
    border: 1px solid rgba(255, 255, 255, 0.88);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 18px 46px rgba(127, 104, 113, 0.1), inset 0 1px rgba(255,255,255,0.9);
    backdrop-filter: blur(16px);
  }

  .msp-stat {
    min-height: 112px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .msp-stat span,
  .msp-highlight span,
  .msp-timeline-mark,
  .msp-fragment-no {
    font-size: 0.86rem;
    color: #8d6f7b;
  }

  .msp-stat strong,
  .msp-highlight strong {
    font-size: 1.28rem;
    line-height: 1.25;
    color: #2f2027;
  }

  .msp-badge-card {
    display: grid;
    gap: 18px;
    align-items: start;
  }

  .msp-badge {
    position: relative;
    aspect-ratio: 1;
    width: min(100%, 420px);
    margin-left: auto;
    display: grid;
    place-items: center;
  }

  .msp-badge-ring {
    position: absolute;
    inset: 0;
    border-radius: 999px;
  }

  .msp-badge-ring-a {
    border: 1px solid rgba(212, 70, 123, 0.16);
    background:
      radial-gradient(circle at center, rgba(255,255,255,0) 52%, rgba(212, 70, 123, 0.06) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.58);
  }

  .msp-badge-ring-b {
    inset: 34px;
    border: 1px dashed rgba(123, 95, 107, 0.18);
  }

  .msp-badge-center {
    position: relative;
    z-index: 1;
    width: min(68%, 260px);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 20px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 20px 44px rgba(131, 105, 115, 0.12), inset 0 1px rgba(255,255,255,0.9);
    text-align: center;
  }

  .msp-badge-center span,
  .msp-badge-center em {
    font-size: 0.84rem;
    color: #8b6a78;
    font-style: normal;
  }

  .msp-badge-center strong {
    display: block;
    margin: 10px 0 8px;
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    line-height: 1;
    color: #2c1f27;
  }

  .msp-highlights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .msp-highlight {
    min-height: 120px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .msp-wave {
    position: relative;
    z-index: 1;
    width: min(1160px, calc(100vw - 40px));
    margin: 6px auto 0;
    text-align: center;
    color: rgba(212, 70, 123, 0.46);
  }

  .msp-wave svg {
    display: block;
    width: 100%;
    height: 70px;
  }

  .msp-wave span {
    display: inline-block;
    margin-top: -18px;
    font-size: 0.95rem;
  }

  .msp-section {
    position: relative;
    z-index: 1;
    padding: 34px 0 10px;
  }

  .msp-section-soft {
    padding-top: 48px;
  }

  .msp-section-head h2 {
    max-width: 12ch;
    font-size: clamp(2rem, 4.5vw, 3.6rem);
    line-height: 1.02;
  }

  .msp-section-lead {
    max-width: 700px;
  }

  .msp-timeline {
    list-style: none;
    margin: 30px 0 0;
    padding: 0;
    display: grid;
    gap: 18px;
  }

  .msp-timeline-item {
    display: grid;
    grid-template-columns: 126px minmax(0, 1fr);
    gap: 18px;
    align-items: stretch;
  }

  .msp-timeline-mark {
    position: relative;
    padding-top: 2px;
    padding-left: 22px;
  }

  .msp-timeline-mark::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 10px;
    bottom: -18px;
    width: 1px;
    background: linear-gradient(180deg, rgba(212, 70, 123, 0.34), rgba(121, 189, 214, 0.18));
  }

  .msp-timeline-mark::after {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, #d4467b, #e89855);
    box-shadow: 0 0 0 6px rgba(212, 70, 123, 0.08);
  }

  .msp-timeline-no,
  .msp-timeline-moment {
    display: block;
  }

  .msp-timeline-no {
    margin-bottom: 8px;
    font-weight: 600;
  }

  .msp-timeline-card {
    padding: 22px 24px;
  }

  .msp-timeline-card h3,
  .msp-fragment h3 {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.28;
    color: #2e2027;
  }

  .msp-fragment-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 28px;
  }

  .msp-fragment {
    min-height: 212px;
    padding: 22px;
  }

  .msp-fragment-no {
    display: inline-block;
    margin-bottom: 16px;
  }

  .msp-fragment p {
    margin-bottom: 0;
  }

  .msp-closing {
    position: relative;
    z-index: 1;
    padding: 52px 0 34px;
  }

  .msp-closing-inner {
    padding: 36px 0 0;
    border-top: 1px solid rgba(123, 95, 107, 0.12);
  }

  .msp-closing-inner h2 {
    max-width: 13ch;
    font-size: clamp(2.1rem, 4.2vw, 3.8rem);
    line-height: 1.05;
  }

  .msp-closing-copy {
    max-width: 700px;
  }

  [data-memory-reveal] {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  [data-memory-reveal].is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes msp-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (max-width: 960px) {
    .msp-hero {
      grid-template-columns: minmax(0, 1fr);
    }

    .msp-badge {
      margin: 0 auto;
    }

    .msp-highlights,
    .msp-fragment-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .msp-shell,
    .msp-wave {
      width: min(100vw - 24px, 1160px);
    }

    .msp-topchip {
      width: 100%;
      justify-content: flex-start;
    }

    .msp-stats,
    .msp-highlights,
    .msp-fragment-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .msp-timeline-item {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    .msp-timeline-mark {
      padding-left: 26px;
    }

    .msp-timeline-mark::before {
      bottom: 0;
    }

    .msp-hero h1 {
      max-width: 9ch;
      font-size: clamp(2.6rem, 12vw, 4.4rem);
    }

    .msp-section-head h2,
    .msp-closing-inner h2 {
      max-width: 10ch;
    }
  }
`;
