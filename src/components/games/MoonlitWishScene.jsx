import { useMemo, useRef, useState } from 'react';

const MUSIC_SRC = '/music/lucky.mp3';

const CARDS = [
  {
    id: 'happy',
    label: '第一张',
    title: '给快乐的猪',
    secret: '我的猪猪天天都要开心快乐',
    accent: '#f29aae',
    bg: 'linear-gradient(135deg, rgba(255,239,243,.96), rgba(255,255,255,.86))',
  },
  {
    id: 'sorry',
    label: '第二张',
    title: '给认真的猪',
    secret: '可怜猪猪给你诚挚道歉',
    accent: '#a99aea',
    bg: 'linear-gradient(135deg, rgba(242,238,255,.96), rgba(255,255,255,.86))',
  },
  {
    id: 'wish',
    label: '第三张',
    title: '给以后的猪',
    secret: '臭猪猪永远年轻可爱',
    accent: '#79bdd6',
    bg: 'linear-gradient(135deg, rgba(232,248,252,.96), rgba(255,255,255,.86))',
  },
];

function GentleDecor() {
  const fireworks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: index,
        x: `${10 + ((index * 17) % 80)}%`,
        y: `${9 + ((index * 11) % 26)}%`,
        delay: `${index * 0.9}s`,
        scale: `${0.6 + (index % 3) * 0.14}`,
      })),
    [],
  );

  const floaters = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        x: `${(index * 29 + 7) % 100}%`,
        delay: `${-(index * 0.7).toFixed(2)}s`,
        duration: `${8 + (index % 5) * 1.2}s`,
        size: `${0.34 + (index % 4) * 0.08}rem`,
      })),
    [],
  );

  return (
    <div className="cw-decor" aria-hidden="true">
      {fireworks.map((item) => (
        <span
          className="cw-firework"
          key={item.id}
          style={{ '--x': item.x, '--y': item.y, '--delay': item.delay, '--scale': item.scale }}
        />
      ))}

      {floaters.map((item) => (
        <span
          className="cw-floater"
          key={item.id}
          style={{ '--x': item.x, '--delay': item.delay, '--duration': item.duration, '--size': item.size }}
        />
      ))}
    </div>
  );
}

function CelebrationSparkles() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const drift = 0.55 + (index % 4) * 0.28;

        return {
          id: index,
          symbol: ['✦', '♡', '✧', '♥', '·'][index % 5],
          x: `${8 + ((index * 13) % 84)}%`,
          y: `${18 + ((index * 19) % 54)}%`,
          delay: `${0.18 + index * 0.055}s`,
          drift: `${direction * drift}rem`,
          driftFar: `${direction * drift * 1.8}rem`,
          size: `${0.72 + (index % 4) * 0.16}rem`,
        };
      }),
    [],
  );

  return (
    <div className="cw-celebrate" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          style={{
            '--x': sparkle.x,
            '--y': sparkle.y,
            '--delay': sparkle.delay,
            '--drift': sparkle.drift,
            '--drift-far': sparkle.driftFar,
            '--size': sparkle.size,
          }}
        >
          {sparkle.symbol}
        </span>
      ))}
    </div>
  );
}

function SecretCard({ card, open, onToggle }) {
  return (
    <article className={`cw-card ${open ? 'is-open' : ''}`} style={{ '--accent': card.accent, '--card-bg': card.bg }}>
      <button className="cw-card-button" type="button" onClick={onToggle} aria-expanded={open}>
        <span className="cw-card-meta">{card.label}</span>
        <span className="cw-card-title">{card.title}</span>
        <span className="cw-card-action">{open ? '收起来' : '点开看口令'}</span>
        <span className="cw-card-plus" aria-hidden="true" />
      </button>

      <div className="cw-card-secret" aria-hidden={!open}>
        <span>口令</span>
        <strong>{card.secret}</strong>
      </div>
    </article>
  );
}

export default function MoonlitWishScene() {
  const audioRef = useRef(null);
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicLabel, setMusicLabel] = useState('播放音乐');
  const [openCard, setOpenCard] = useState(null);

  const playMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setMusicPlaying(true);
      setMusicLabel('lucky 播放中');
    } catch {
      setMusicPlaying(false);
      setMusicLabel('点一下播放');
    }
  };

  const pauseMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setMusicPlaying(false);
    setMusicLabel('播放音乐');
  };

  const unwrapGift = () => {
    setIsUnwrapped(true);
    playMusic();
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await playMusic();
    } else {
      pauseMusic();
    }
  };

  return (
    <main className={`cw-page ${isUnwrapped ? 'is-unwrapped' : ''}`}>
      <style>{styles}</style>
      <audio ref={audioRef} src={MUSIC_SRC} preload="none" loop />
      <GentleDecor />

      <section className="cw-intro" aria-hidden={isUnwrapped}>
        <button className="cw-gift" type="button" onClick={unwrapGift} aria-label="拆开儿童节小礼物">
          <span className="cw-gift-lid" aria-hidden="true">
            <i />
          </span>
          <span className="cw-gift-body" aria-hidden="true">
            <i />
          </span>
          <span className="cw-gift-ribbon" aria-hidden="true" />
          <span className="cw-gift-text">
            <small>给你的一点点儿童节快乐</small>
            <strong>点一下拆开</strong>
          </span>
        </button>
      </section>

      <button className={`cw-music ${musicPlaying ? 'is-playing' : ''}`} type="button" onClick={toggleMusic}>
        <span className="cw-music-note" aria-hidden="true">♪</span>
        <span>{musicLabel}</span>
      </button>

      <div className="cw-content" aria-hidden={!isUnwrapped}>
        <CelebrationSparkles />

        <section className="cw-hero" aria-label="儿童节祝福">
          <div className="cw-paper">
            <p className="cw-kicker">Children's Day · 06.01</p>
            <h1>儿童节快乐呀</h1>
            <p className="cw-blessing">希望我的宝贝一直年轻，永远有糖，被生活温柔地偏爱。</p>

            <div className="cw-scene" aria-hidden="true">
              <span className="cw-sun" />
              <span className="cw-cloud cw-cloud-a" />
              <span className="cw-cloud cw-cloud-b" />
              <span className="cw-kite" />
              <span className="cw-rainbow" />
              <span className="cw-hill" />
            </div>
          </div>
        </section>

        <section className="cw-cards" aria-labelledby="cw-cards-title">
          <div className="cw-section-title">
            <p>三枚小口令</p>
            <h2 id="cw-cards-title">点开卡片再领取</h2>
          </div>

          <div className="cw-card-grid">
            {CARDS.map((card) => (
              <SecretCard
                key={card.id}
                card={card}
                open={openCard === card.id}
                onToggle={() => setOpenCard((current) => (current === card.id ? null : card.id))}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const styles = `
  :root {
    --cw-ink: #574a58;
    --cw-muted: #897b86;
    --cw-pink: #f29aae;
    --cw-lilac: #b9aaf4;
    --cw-blue: #8fd4e6;
    --cw-yellow: #ffd98b;
  }

  * { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body { background: #fff8f1; }

  .cw-page {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    padding: max(0.9rem, env(safe-area-inset-top)) 0.9rem max(5.4rem, env(safe-area-inset-bottom));
    color: var(--cw-ink);
    font-family: ui-rounded, 'SF Pro Rounded', 'HarmonyOS Sans SC', 'Microsoft YaHei', system-ui, sans-serif;
    background:
      radial-gradient(circle at 16% 8%, rgba(255, 221, 231, 0.9), transparent 17rem),
      radial-gradient(circle at 88% 16%, rgba(218, 242, 250, 0.9), transparent 18rem),
      radial-gradient(circle at 50% 92%, rgba(234, 228, 255, 0.65), transparent 20rem),
      linear-gradient(180deg, #fff8f1 0%, #fffdf8 48%, #f6fbff 100%);
  }

  .cw-page::before,
  .cw-page::after {
    content: '';
    position: fixed;
    z-index: 0;
    pointer-events: none;
    border-radius: 999px;
    filter: blur(1px);
  }

  .cw-page::before {
    left: -4.8rem;
    top: 16rem;
    width: 11rem;
    height: 11rem;
    background: rgba(255, 229, 236, 0.58);
  }

  .cw-page::after {
    right: -5rem;
    bottom: 13rem;
    width: 12rem;
    height: 12rem;
    background: rgba(221, 244, 250, 0.72);
  }

  .cw-decor {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .cw-firework {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 0.24rem;
    height: 0.24rem;
    border-radius: 50%;
    color: rgba(242, 154, 174, 0.68);
    background: currentColor;
    opacity: 0;
    transform: scale(var(--scale));
    animation: cw-firework 5.8s ease-out infinite;
    animation-delay: var(--delay);
    box-shadow:
      0 -1.08rem 0 rgba(242,154,174,.6),
      .78rem -.78rem 0 rgba(185,170,244,.5),
      1.08rem 0 0 rgba(143,212,230,.54),
      .78rem .78rem 0 rgba(255,217,139,.48),
      0 1.08rem 0 rgba(242,154,174,.44),
      -.78rem .78rem 0 rgba(185,170,244,.46),
      -1.08rem 0 0 rgba(143,212,230,.46),
      -.78rem -.78rem 0 rgba(255,217,139,.48);
  }

  .cw-floater {
    position: absolute;
    left: var(--x);
    top: -2rem;
    width: var(--size);
    height: calc(var(--size) * 1.35);
    border-radius: 999px 999px 999px 0;
    background: rgba(255, 193, 207, 0.52);
    transform: rotate(30deg);
    animation: cw-fall var(--duration) linear infinite;
    animation-delay: var(--delay);
  }

  .cw-intro {
    position: fixed;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: 1.2rem;
    background:
      radial-gradient(circle at 50% 38%, rgba(255,255,255,.82), rgba(255,255,255,.22) 28%, transparent 58%);
    transition: opacity .55s ease, visibility .55s ease;
  }

  .cw-page.is-unwrapped .cw-intro {
    pointer-events: none;
    animation: cw-intro-away .82s ease forwards;
  }

  .cw-gift {
    position: relative;
    width: min(18.5rem, 78vw);
    min-height: 19.5rem;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    filter: drop-shadow(0 1.4rem 2.6rem rgba(170,131,143,.18));
    animation: cw-gift-breathe 2.6s ease-in-out infinite;
  }

  .cw-gift::before,
  .cw-gift::after {
    content: '';
    position: absolute;
    left: 50%;
    border-radius: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .cw-gift::before {
    top: 1.8rem;
    width: 8.2rem;
    height: 3.6rem;
    border: .75rem solid rgba(242,154,174,.78);
    border-bottom-color: transparent;
    transform: translateX(-50%) rotate(-8deg);
  }

  .cw-gift::after {
    top: 1.8rem;
    width: 8.2rem;
    height: 3.6rem;
    border: .75rem solid rgba(185,170,244,.7);
    border-bottom-color: transparent;
    transform: translateX(-50%) rotate(8deg);
  }

  .cw-gift-lid,
  .cw-gift-body {
    position: absolute;
    left: 50%;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    background:
      linear-gradient(90deg, transparent 45%, rgba(255,255,255,.72) 45% 55%, transparent 55%),
      linear-gradient(135deg, rgba(255,230,236,.98), rgba(241,235,255,.94));
    box-shadow: inset 0 1px rgba(255,255,255,.96);
    transform: translateX(-50%);
  }

  .cw-gift-lid {
    top: 5.1rem;
    width: 13.7rem;
    height: 3.35rem;
    border-radius: 1.1rem 1.1rem .55rem .55rem;
    transform-origin: 18% 100%;
  }

  .cw-gift-body {
    top: 8.1rem;
    width: 12.2rem;
    height: 8.2rem;
    border-radius: .85rem .85rem 1.45rem 1.45rem;
  }

  .cw-gift-lid i,
  .cw-gift-body i {
    position: absolute;
    inset: 0 auto 0 50%;
    width: 2.2rem;
    background: linear-gradient(180deg, rgba(242,154,174,.88), rgba(185,170,244,.76));
    transform: translateX(-50%);
  }

  .cw-gift-ribbon {
    position: absolute;
    left: 50%;
    top: 7.3rem;
    width: 14.4rem;
    height: 1.1rem;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(242,154,174,.86), rgba(185,170,244,.78));
    transform: translateX(-50%);
    box-shadow: 0 .55rem 1.1rem rgba(170,131,143,.1);
  }

  .cw-gift-text {
    position: absolute;
    left: 50%;
    bottom: 0;
    display: grid;
    gap: .42rem;
    width: min(18rem, 100%);
    padding: .85rem 1rem;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 1.25rem;
    background: rgba(255,255,255,.7);
    box-shadow: 0 .9rem 2rem rgba(170,131,143,.12), inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(16px);
    text-align: center;
    transform: translateX(-50%);
  }

  .cw-gift-text small {
    color: #9a7f8a;
    font-size: .82rem;
    font-weight: 800;
  }

  .cw-gift-text strong {
    color: #58475b;
    font-size: 1.22rem;
    letter-spacing: .04em;
  }

  .cw-gift:hover .cw-gift-lid,
  .cw-gift:focus-visible .cw-gift-lid {
    transform: translateX(-50%) translateY(-.28rem) rotate(-2deg);
  }

  .cw-gift:focus-visible {
    outline: 3px solid rgba(242,154,174,.36);
    outline-offset: .4rem;
    border-radius: 1.8rem;
  }

  .cw-page.is-unwrapped .cw-gift {
    animation: none;
  }

  .cw-page.is-unwrapped .cw-gift-lid {
    animation: cw-lid-open .72s cubic-bezier(.2,.8,.2,1) forwards;
  }

  .cw-page.is-unwrapped .cw-gift-body,
  .cw-page.is-unwrapped .cw-gift-ribbon {
    animation: cw-gift-open .72s cubic-bezier(.2,.8,.2,1) forwards;
  }

  .cw-page.is-unwrapped .cw-gift-text {
    animation: cw-gift-text-away .45s ease forwards;
  }

  .cw-content {
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(1.1rem) scale(.985);
    pointer-events: none;
    transition: opacity .72s ease .28s, transform .72s cubic-bezier(.2,.8,.2,1) .28s;
  }

  .cw-page.is-unwrapped .cw-content {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .cw-celebrate {
    position: fixed;
    inset: 0;
    z-index: 3;
    overflow: hidden;
    pointer-events: none;
  }

  .cw-celebrate span {
    position: absolute;
    left: var(--x);
    top: var(--y);
    color: rgba(242,154,174,.78);
    font-size: var(--size);
    font-weight: 900;
    line-height: 1;
    opacity: 0;
    text-shadow: 0 .4rem 1rem rgba(170,131,143,.12);
  }

  .cw-celebrate span:nth-child(3n + 2) { color: rgba(185,170,244,.72); }
  .cw-celebrate span:nth-child(3n) { color: rgba(121,189,214,.72); }

  .cw-page.is-unwrapped .cw-celebrate span {
    animation: cw-sparkle-pop 2.15s cubic-bezier(.18,.84,.28,1) var(--delay) forwards;
  }

  .cw-music {
    position: fixed;
    right: max(0.85rem, env(safe-area-inset-right));
    bottom: max(0.85rem, env(safe-area-inset-bottom));
    z-index: 5;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    padding: 0.58rem 0.9rem;
    border: 1px solid rgba(255,255,255,0.88);
    border-radius: 999px;
    background: rgba(255,255,255,0.78);
    box-shadow: 0 1rem 2.5rem rgba(170, 131, 143, 0.16), inset 0 1px rgba(255,255,255,0.9);
    backdrop-filter: blur(18px);
    color: #675866;
    font: inherit;
    font-size: 0.84rem;
    font-weight: 800;
    cursor: pointer;
    opacity: 0;
    transform: translateY(.5rem);
    pointer-events: none;
    transition: opacity .35s ease, transform .35s ease;
  }

  .cw-page.is-unwrapped .cw-music {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .cw-music-note {
    display: grid;
    place-items: center;
    width: 1.56rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cw-pink), var(--cw-lilac));
    color: white;
    box-shadow: 0 0.55rem 1.15rem rgba(185,170,244,.25);
  }

  .cw-music.is-playing .cw-music-note { animation: cw-pulse 1.8s ease-in-out infinite; }

  .cw-hero,
  .cw-cards {
    position: relative;
    z-index: 1;
    width: min(100%, 44rem);
    margin-inline: auto;
  }

  .cw-hero {
    min-height: min(42rem, calc(100svh - 1.8rem));
    display: grid;
    align-items: center;
  }

  .cw-paper {
    position: relative;
    overflow: hidden;
    min-height: 33rem;
    padding: clamp(1.2rem, 5vw, 2.2rem);
    border: 1px solid rgba(255,255,255,0.95);
    border-radius: 2rem;
    background: rgba(255,255,255,0.66);
    box-shadow: 0 1.4rem 4rem rgba(177, 138, 145, 0.16), inset 0 1px rgba(255,255,255,0.94);
    backdrop-filter: blur(18px);
    opacity: 0;
    translate: 0 .95rem;
  }

  .cw-page.is-unwrapped .cw-paper {
    animation: cw-paper-in .82s cubic-bezier(.18,.84,.28,1) .28s forwards;
  }

  .cw-paper::before {
    content: '';
    position: absolute;
    inset: -45% auto -45% -70%;
    width: 54%;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
    rotate: 18deg;
    opacity: 0;
    pointer-events: none;
  }

  .cw-page.is-unwrapped .cw-paper::before {
    animation: cw-soft-shine 1.7s ease .78s forwards;
  }

  .cw-kicker {
    width: fit-content;
    margin: 0 0 1rem;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(255,245,247,0.82);
    color: #9a7f8a;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0;
    translate: 0 .45rem;
  }

  .cw-page.is-unwrapped .cw-kicker {
    animation: cw-line-in .52s ease .55s forwards;
  }

  .cw-paper h1 {
    max-width: 8em;
    margin: 0;
    color: #58475b;
    font-size: clamp(2.15rem, 10vw, 4.1rem);
    line-height: 1.05;
    letter-spacing: -0.07em;
    opacity: 0;
    translate: 0 .55rem;
  }

  .cw-page.is-unwrapped .cw-paper h1 {
    animation: cw-line-in .62s cubic-bezier(.18,.84,.28,1) .66s forwards;
  }

  .cw-blessing {
    max-width: 27rem;
    margin: 1rem 0 0;
    color: var(--cw-muted);
    font-size: clamp(0.98rem, 3.7vw, 1.12rem);
    line-height: 1.9;
    opacity: 0;
    translate: 0 .55rem;
  }

  .cw-page.is-unwrapped .cw-blessing {
    animation: cw-line-in .62s ease .8s forwards;
  }

  .cw-scene {
    position: absolute;
    inset: auto 0 0;
    height: 43%;
    overflow: hidden;
  }

  .cw-sun {
    position: absolute;
    right: 12%;
    top: 0.6rem;
    width: clamp(4.2rem, 18vw, 6.6rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fff8d8 0 25%, #ffd98b 62%, rgba(255,217,139,.18) 100%);
    box-shadow: 0 0 3rem rgba(255,217,139,.32);
    animation: cw-float 5.5s ease-in-out infinite;
  }

  .cw-cloud {
    position: absolute;
    border-radius: 999px;
    background: rgba(255,255,255,0.84);
    box-shadow: 0 1rem 2rem rgba(150,175,190,.12);
  }

  .cw-cloud::before,
  .cw-cloud::after {
    content: '';
    position: absolute;
    border-radius: inherit;
    background: inherit;
  }

  .cw-cloud-a {
    left: 8%;
    top: 3.2rem;
    width: 8.2rem;
    height: 2.6rem;
    animation: cw-drift 8s ease-in-out infinite;
  }

  .cw-cloud-a::before { width: 3.1rem; height: 3.1rem; left: 1rem; top: -1.2rem; }
  .cw-cloud-a::after { width: 3.8rem; height: 3.8rem; right: 1.15rem; top: -1.62rem; }

  .cw-cloud-b {
    right: 3%;
    top: 6.7rem;
    width: 6.8rem;
    height: 2.1rem;
    opacity: 0.78;
    animation: cw-drift 9s ease-in-out infinite reverse;
  }

  .cw-cloud-b::before { width: 2.5rem; height: 2.5rem; left: .8rem; top: -1rem; }
  .cw-cloud-b::after { width: 3rem; height: 3rem; right: .9rem; top: -1.2rem; }

  .cw-kite {
    position: absolute;
    left: 18%;
    top: 7.1rem;
    width: 2.5rem;
    aspect-ratio: 1;
    border-radius: .35rem .35rem .35rem 0;
    background: linear-gradient(135deg, rgba(242,154,174,.8), rgba(185,170,244,.7));
    transform: rotate(45deg);
    box-shadow: 0 0.8rem 1.4rem rgba(170,131,143,.12);
    animation: cw-kite 4.8s ease-in-out infinite;
  }

  .cw-kite::after {
    content: '';
    position: absolute;
    left: 1.55rem;
    top: 2.1rem;
    width: 4.2rem;
    height: 3.6rem;
    border-left: 1px dashed rgba(137,123,134,.42);
    border-bottom: 1px dashed rgba(137,123,134,.3);
    border-radius: 0 0 0 100%;
    transform: rotate(-45deg);
  }

  .cw-rainbow {
    position: absolute;
    left: 50%;
    bottom: -5.8rem;
    width: min(29rem, 118vw);
    aspect-ratio: 2 / 1;
    border-radius: 999px 999px 0 0;
    transform: translateX(-50%);
    background:
      radial-gradient(ellipse at 50% 100%, transparent 0 43%, rgba(255,255,255,.68) 44% 47%, transparent 48%),
      conic-gradient(from 270deg at 50% 100%, rgba(242,154,174,.5), rgba(255,217,139,.48), rgba(166,220,207,.46), rgba(143,212,230,.46), rgba(185,170,244,.46), rgba(242,154,174,.5));
    opacity: .72;
  }

  .cw-hill {
    position: absolute;
    left: -8%;
    right: -8%;
    bottom: -3.9rem;
    height: 9rem;
    border-radius: 50% 50% 0 0;
    background: linear-gradient(180deg, rgba(216,239,220,.82), rgba(247,253,248,.96));
  }

  .cw-cards { padding: 1rem 0 2rem; }

  .cw-section-title { margin: 0 0 1rem; padding-inline: .25rem; }

  .cw-section-title {
    opacity: 0;
    translate: 0 .7rem;
  }

  .cw-page.is-unwrapped .cw-section-title {
    animation: cw-line-in .58s ease 1s forwards;
  }

  .cw-section-title p {
    margin: 0 0 .35rem;
    color: #aa8794;
    font-size: .82rem;
    font-weight: 900;
    letter-spacing: .14em;
  }

  .cw-section-title h2 {
    margin: 0;
    color: #5a4a5f;
    font-size: clamp(1.2rem, 5vw, 1.85rem);
    line-height: 1.35;
  }

  .cw-card-grid { display: grid; gap: .9rem; }

  .cw-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 1.45rem;
    background: var(--card-bg);
    box-shadow: 0 1rem 2.4rem rgba(148,116,128,.13), inset 0 1px rgba(255,255,255,.92);
    transition: transform .28s ease, box-shadow .28s ease;
    opacity: 0;
    translate: 0 1rem;
  }

  .cw-page.is-unwrapped .cw-card {
    animation: cw-card-in .68s cubic-bezier(.18,.84,.28,1) forwards;
  }

  .cw-page.is-unwrapped .cw-card:nth-child(1) { animation-delay: 1.12s; }
  .cw-page.is-unwrapped .cw-card:nth-child(2) { animation-delay: 1.24s; }
  .cw-page.is-unwrapped .cw-card:nth-child(3) { animation-delay: 1.36s; }

  .cw-card::before {
    content: '';
    position: absolute;
    right: -2rem;
    top: -2.2rem;
    width: 7rem;
    height: 7rem;
    border-radius: 50%;
    background: var(--accent);
    opacity: .12;
  }

  .cw-card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background: radial-gradient(circle at 22% 18%, rgba(255,255,255,.86), transparent 26%);
    opacity: 0;
    pointer-events: none;
  }

  .cw-page.is-unwrapped .cw-card::after {
    animation: cw-card-glow 2.8s ease-in-out 1.35s infinite;
  }

  .cw-card.is-open {
    transform: translateY(-2px);
    box-shadow: 0 1.25rem 3rem rgba(148,116,128,.18), inset 0 1px rgba(255,255,255,.94);
  }

  .cw-card-button {
    position: relative;
    z-index: 1;
    width: 100%;
    min-height: 8rem;
    padding: 1.08rem;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
  }

  .cw-card-meta {
    display: block;
    color: var(--accent);
    font-size: .78rem;
    font-weight: 900;
    letter-spacing: .13em;
  }

  .cw-card-title {
    display: block;
    margin-top: 1.12rem;
    color: #59485d;
    font-size: 1.18rem;
    font-weight: 900;
  }

  .cw-card-action {
    display: inline-flex;
    margin-top: .58rem;
    color: var(--cw-muted);
    font-size: .88rem;
    font-weight: 700;
  }

  .cw-card-plus {
    position: absolute;
    right: 1.05rem;
    top: 1.05rem;
    width: 2rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      linear-gradient(90deg, transparent 45%, white 45% 55%, transparent 55%),
      linear-gradient(transparent 45%, white 45% 55%, transparent 55%),
      var(--accent);
    box-shadow: 0 .6rem 1.3rem rgba(148,116,128,.16);
    transition: transform .28s ease;
  }

  .cw-card.is-open .cw-card-plus { transform: rotate(45deg); }

  .cw-card-secret {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    padding: 0 1.08rem;
    transform: translateY(-.4rem);
    transition: grid-template-rows .32s ease, opacity .24s ease, transform .32s ease, padding .32s ease;
  }

  .cw-card.is-open .cw-card-secret {
    grid-template-rows: 1fr;
    opacity: 1;
    padding: 0 1.08rem 1.12rem;
    transform: translateY(0);
  }

  .cw-card-secret > * { overflow: hidden; }

  .cw-card-secret span {
    display: inline-flex;
    width: fit-content;
    margin-bottom: .55rem;
    padding: .28rem .58rem;
    border-radius: 999px;
    background: rgba(255,255,255,.78);
    color: var(--accent);
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .12em;
  }

  .cw-card-secret strong {
    display: block;
    width: 100%;
    padding: .92rem 1rem;
    border: 1px dashed rgba(148,116,128,.26);
    border-radius: 1rem;
    background: rgba(255,255,255,.7);
    color: #493b51;
    font-size: clamp(1.25rem, 6vw, 1.7rem);
    line-height: 1.25;
    text-align: center;
    letter-spacing: .08em;
  }

  @keyframes cw-firework {
    0%, 48%, 100% { opacity: 0; transform: scale(.18); }
    56% { opacity: .82; transform: scale(calc(var(--scale) * .9)); }
    74% { opacity: 0; transform: scale(calc(var(--scale) * 1.2)); }
  }

  @keyframes cw-fall {
    0% { opacity: 0; transform: translate3d(0, -2rem, 0) rotate(30deg); }
    12% { opacity: .72; }
    100% { opacity: 0; transform: translate3d(1.8rem, 110svh, 0) rotate(220deg); }
  }

  @keyframes cw-intro-away {
    0% { opacity: 1; visibility: visible; }
    70% { opacity: 1; visibility: visible; }
    100% { opacity: 0; visibility: hidden; }
  }

  @keyframes cw-gift-breathe {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-.38rem); }
  }

  @keyframes cw-lid-open {
    0% { transform: translateX(-50%) translateY(0) rotate(0); opacity: 1; }
    100% { transform: translateX(-68%) translateY(-5rem) rotate(-17deg); opacity: 0; }
  }

  @keyframes cw-gift-open {
    0% { transform: translateX(-50%) scale(1); opacity: 1; }
    100% { transform: translateX(-50%) translateY(1.4rem) scale(.92); opacity: 0; }
  }

  @keyframes cw-gift-text-away {
    to { opacity: 0; transform: translateX(-50%) translateY(.6rem); }
  }

  @keyframes cw-sparkle-pop {
    0% { opacity: 0; transform: translate3d(0, .5rem, 0) scale(.55) rotate(-12deg); }
    24% { opacity: .96; transform: translate3d(var(--drift), -.55rem, 0) scale(1) rotate(8deg); }
    100% { opacity: 0; transform: translate3d(var(--drift-far), -4.2rem, 0) scale(.72) rotate(26deg); }
  }

  @keyframes cw-paper-in {
    0% { opacity: 0; translate: 0 1rem; scale: .985; }
    68% { opacity: 1; translate: 0 -.16rem; scale: 1.006; }
    100% { opacity: 1; translate: 0 0; scale: 1; }
  }

  @keyframes cw-line-in {
    0% { opacity: 0; translate: 0 .65rem; }
    100% { opacity: 1; translate: 0 0; }
  }

  @keyframes cw-soft-shine {
    0% { opacity: 0; transform: translateX(0); }
    18% { opacity: .74; }
    100% { opacity: 0; transform: translateX(360%); }
  }

  @keyframes cw-card-in {
    0% { opacity: 0; translate: 0 1rem; scale: .98; }
    72% { opacity: 1; translate: 0 -.12rem; scale: 1.01; }
    100% { opacity: 1; translate: 0 0; scale: 1; }
  }

  @keyframes cw-card-glow {
    0%, 100% { opacity: 0; }
    45% { opacity: .34; }
  }

  @keyframes cw-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes cw-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-.5rem); } }
  @keyframes cw-drift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(.75rem); } }
  @keyframes cw-kite { 0%, 100% { transform: rotate(45deg) translate(0,0); } 50% { transform: rotate(45deg) translate(.25rem,-.5rem); } }

  @media (min-width: 760px) {
    .cw-page { padding-inline: 1.6rem; }
    .cw-hero, .cw-cards { width: min(100%, 62rem); }
    .cw-paper { min-height: 38rem; padding: 2.4rem; }
    .cw-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
    .cw-card-button { min-height: 10rem; }
  }

  @media (max-width: 390px) {
    .cw-page { padding-inline: .76rem; }
    .cw-paper { min-height: 31.5rem; border-radius: 1.55rem; }
    .cw-card-button { min-height: 7.35rem; }
    .cw-music { font-size: .8rem; padding-inline: .72rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;