import { useMemo, useRef, useState, useEffect } from 'react';

const MUSIC_SRC = '/music/onlyone.mp3';

const TIMELINE = [
  { 
    time: '06.12 晚上', 
    title: '出发去昆明', 
    desc: '带着精心准备的鲜花和甜点，奔赴一场跨越几千公里期待已久的见面' 
  },
  { 
    time: '06.13 中午', 
    title: '第一次见面', 
    desc: '终于见到了你，又高又瘦的猪，超漂亮的宝贝。所有想象都有了真实的模样，心里既激动又很紧张，明明期待了超级超级久！！！' 
  },
  { 
    time: '06.13 下午', 
    title: '第一次拥抱', 
    desc: '一开始还有点犹豫，可抱住你的时候，闻到你的专属独特味道，沁入我的脑海，看着你害羞的傻傻样子，幸福与满足极大充斥我的内心' 
  },
  { 
    time: '06.13 晚上', 
    title: '逛夜市', 
    desc: '一起走在人很多、灯很亮的夜市里，闲聊与牵手，越来越熟悉的感觉，自然的熟悉，喧闹的夜晚因为你变得很特别，就是猪推车都不等我！' 
  },
  { 
    time: '06.13 深夜', 
    title: '第一次么么', 
    desc: '靠近你的时候其实心跳很快，那个吻一直不敢下决心，但又很想尝试，当我脑海里全是你的时候，控制不住的想要你的全部' 
  },
  { 
    time: '06.14 早上', 
    title: '敲门拥抱早睡', 
    desc: '早上敲开你的房间，看见你的那一瞬间就想抱紧你，困意和喜欢混在一起，抱着一起就很满足，在你身旁深吸你的味道' 
  },
  { 
    time: '06.14 中午', 
    title: '享用美食', 
    desc: '吃饭的时候，记得的不只是味道，还有猪的每一个小动作，都变成了值得回味的小幸福' 
  },
  { 
    time: '06.14 下午', 
    title: '看电影', 
    desc: '电影放着放着，时不时的搂你，偷偷么么，还要十指紧扣，想把时光停留在这份温馨的陪伴' 
  },
  { 
    time: '06.15 中午', 
    title: '疯狂缠绵', 
    desc: '明知道快要分别了，就更舍不得松开你，想把这几天没说完的喜欢和想要，都藏进一次次更多的亲密里' 
  },
  { 
    time: '06.15 下午', 
    title: '分别', 
    desc: '到了火车上 感觉一切好像是一场梦境 甚至比梦里还更美好，竟然那么真实，超级幸运命运中与猪的相遇' 
  },
];


// 分开的时间：2026年6月15日下午4点
const GOODBYE_TIME = new Date(2026, 5, 15, 16, 0, 0);

function TimeSinceGoodbye() {
  const [timeData, setTimeData] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = now - GOODBYE_TIME;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeData({ days, hours, minutes, seconds });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="km-timer">
      <div className="km-timer-title">
        <span className="km-timer-emoji">⏰</span>
        <span>和猪分开...</span>
      </div>
      <div className="km-timer-grid">
        <div className="km-timer-item">
          <div className="km-timer-value">{timeData.days}</div>
          <div className="km-timer-label">天</div>
        </div>
        <div className="km-timer-item">
          <div className="km-timer-value">{timeData.hours}</div>
          <div className="km-timer-label">小时</div>
        </div>
        <div className="km-timer-item">
          <div className="km-timer-value">{timeData.minutes}</div>
          <div className="km-timer-label">分钟</div>
        </div>
        <div className="km-timer-item">
          <div className="km-timer-value">{timeData.seconds}</div>
          <div className="km-timer-label">秒</div>
        </div>
      </div>
      <p className="km-timer-message">每分每秒 miss you 💕</p>
    </div>
  );
}

function GentleDecor() {
  const fireworks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        id: index,
        x: `${12 + ((index * 15) % 76)}%`,
        y: `${10 + ((index * 13) % 30)}%`,
        delay: `${index * 1.1}s`,
        scale: `${0.65 + (index % 3) * 0.15}`,
      })),
    [],
  );

  const floaters = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        x: `${(index * 27 + 5) % 100}%`,
        delay: `${-(index * 0.8).toFixed(2)}s`,
        duration: `${9 + (index % 5) * 1.5}s`,
        size: `${0.36 + (index % 4) * 0.09}rem`,
      })),
    [],
  );

  return (
    <div className="km-decor" aria-hidden="true">
      {fireworks.map((item) => (
        <span
          className="km-firework"
          key={item.id}
          style={{ '--x': item.x, '--y': item.y, '--delay': item.delay, '--scale': item.scale }}
        />
      ))}

      {floaters.map((item) => (
        <span
          className="km-floater"
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
      Array.from({ length: 22 }, (_, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const drift = 0.6 + (index % 4) * 0.3;

        return {
          id: index,
          symbol: ['✦', '♡', '✧', '♥', '·', '❀'][index % 6],
          x: `${10 + ((index * 11) % 80)}%`,
          y: `${20 + ((index * 17) % 50)}%`,
          delay: `${0.2 + index * 0.06}s`,
          drift: `${direction * drift}rem`,
          driftFar: `${direction * drift * 2}rem`,
          size: `${0.75 + (index % 4) * 0.18}rem`,
        };
      }),
    [],
  );

  return (
    <div className="km-celebrate" aria-hidden="true">
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

function MemoryCard({ memory, open, onToggle }) {
  return (
    <article className={`km-card ${open ? 'is-open' : ''}`} style={{ '--accent': memory.accent, '--card-bg': memory.bg }}>
      <button className="km-card-button" type="button" onClick={onToggle} aria-expanded={open}>
        <span className="km-card-meta">{memory.label}</span>
        <span className="km-card-title">{memory.title}</span>
        <span className="km-card-action">{open ? '收起来' : '点开看看'}</span>
        <span className="km-card-plus" aria-hidden="true" />
      </button>

      <div className="km-card-secret" aria-hidden={!open}>
        <span>回忆</span>
        <strong>{memory.secret}</strong>
      </div>
    </article>
  );
}

export default function KunmingFirstMeeting() {
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
      setMusicLabel('音乐播放中');
    } catch {
      setMusicPlaying(false);
      setMusicLabel('点击播放');
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
    <main className={`km-page ${isUnwrapped ? 'is-unwrapped' : ''}`}>
      <style>{styles}</style>
      <audio ref={audioRef} src={MUSIC_SRC} preload="none" loop />
      <GentleDecor />

      <section className="km-intro" aria-hidden={isUnwrapped}>
        <div className="km-intro-hearts" aria-hidden="true">
          <span className="km-intro-heart" style={{'--i': 0}}>💕</span>
          <span className="km-intro-heart" style={{'--i': 1}}>💖</span>
          <span className="km-intro-heart" style={{'--i': 2}}>💗</span>
          <span className="km-intro-heart" style={{'--i': 3}}>💝</span>
        </div>
        <button className="km-diary" type="button" onClick={unwrapGift} aria-label="打开昆明初见的回忆">
          <div className="km-diary-cover">
            <div className="km-diary-decor" aria-hidden="true">
              <span className="km-diary-deco-flower">🌺</span>
              <span className="km-diary-deco-pig">🐷</span>
              <span className="km-diary-deco-sparkle">✨</span>
              <span className="km-diary-deco-cherry">🌸</span>
            </div>
            <div className="km-diary-title">
              <span className="km-diary-date">2026.06.13</span>
              <span className="km-diary-main">昆明初见</span>
              <span className="km-diary-subtitle">给我的最可爱又美丽的猪</span>
            </div>
          </div>
          <div className="km-diary-pages" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="km-diary-hint">点击翻开日记</p>
        </button>
      </section>

      <button className={`km-music ${musicPlaying ? 'is-playing' : ''}`} type="button" onClick={toggleMusic}>
        <span className="km-music-note" aria-hidden="true">♪</span>
        <span>{musicLabel}</span>
      </button>

      <div className="km-content" aria-hidden={!isUnwrapped}>
        <CelebrationSparkles />

        <div className="km-container">
          <header className="km-header">
            <div className="km-date-badge">2026.06.13 - 06.15</div>
            <h1 className="km-title">昆明相遇</h1>
            <p className="km-subtitle">三天的时光，刻苦铭心的回忆</p>
          </header>

          <section className="km-timeline-section">
            <h2 className="km-section-heading">时间线</h2>
            <div className="km-timeline">
              {TIMELINE.map((item, index) => (
                <div className="km-timeline-item" key={index}>
                  <div className="km-timeline-dot" />
                  <div className="km-timeline-content">
                    <time className="km-time">{item.time}</time>
                    <h3 className="km-event-title">{item.title}</h3>
                    <p className="km-event-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="km-timer-section">
            <TimeSinceGoodbye />
          </section>
        </div>
      </div>
    </main>
  );
}

const styles = `
  :root {
    --km-ink: #574a58;
    --km-muted: #897b86;
    --km-pink: #f29aae;
    --km-lilac: #b9aaf4;
    --km-blue: #8fd4e6;
    --km-yellow: #ffd98b;
  }

  * { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body { background: #fff8f1; }

  .km-page {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    padding: max(0.9rem, env(safe-area-inset-top)) 0.9rem max(5.4rem, env(safe-area-inset-bottom));
    color: var(--km-ink);
    font-family: ui-rounded, 'SF Pro Rounded', 'HarmonyOS Sans SC', 'Microsoft YaHei', system-ui, sans-serif;
    background:
      radial-gradient(circle at 18% 10%, rgba(255, 221, 231, 0.88), transparent 18rem),
      radial-gradient(circle at 86% 18%, rgba(218, 242, 250, 0.88), transparent 19rem),
      radial-gradient(circle at 50% 88%, rgba(234, 228, 255, 0.62), transparent 21rem),
      linear-gradient(180deg, #fff8f1 0%, #fffdf8 48%, #f6fbff 100%);
  }

  .km-page::before,
  .km-page::after {
    content: '';
    position: fixed;
    z-index: 0;
    pointer-events: none;
    border-radius: 999px;
    filter: blur(1.2px);
  }

  .km-page::before {
    left: -5rem;
    top: 18rem;
    width: 12rem;
    height: 12rem;
    background: rgba(255, 229, 236, 0.56);
  }

  .km-page::after {
    right: -5.5rem;
    bottom: 15rem;
    width: 13rem;
    height: 13rem;
    background: rgba(221, 244, 250, 0.68);
  }

  .km-decor {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .km-firework {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 0.26rem;
    height: 0.26rem;
    border-radius: 50%;
    color: rgba(242, 154, 174, 0.65);
    background: currentColor;
    opacity: 0;
    transform: scale(var(--scale));
    animation: km-firework 6s ease-out infinite;
    animation-delay: var(--delay);
    box-shadow:
      0 -1.15rem 0 rgba(242,154,174,.58),
      .85rem -.85rem 0 rgba(185,170,244,.48),
      1.15rem 0 0 rgba(143,212,230,.52),
      .85rem .85rem 0 rgba(255,217,139,.46),
      0 1.15rem 0 rgba(242,154,174,.42),
      -.85rem .85rem 0 rgba(185,170,244,.44),
      -1.15rem 0 0 rgba(143,212,230,.44),
      -.85rem -.85rem 0 rgba(255,217,139,.46);
  }

  .km-floater {
    position: absolute;
    left: var(--x);
    top: -2rem;
    width: var(--size);
    height: calc(var(--size) * 1.4);
    border-radius: 999px 999px 999px 0;
    background: rgba(255, 193, 207, 0.5);
    transform: rotate(28deg);
    animation: km-fall var(--duration) linear infinite;
    animation-delay: var(--delay);
  }

  .km-intro {
    position: fixed;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: 1.2rem;
    background: radial-gradient(circle at 50% 40%, rgba(255,255,255,.8), rgba(255,255,255,.2) 30%, transparent 60%);
    transition: opacity .6s ease, visibility .6s ease;
  }

  .km-intro-hearts {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .km-intro-heart {
    position: absolute;
    font-size: 2rem;
    opacity: 0.6;
    animation: km-heart-orbit 8s ease-in-out infinite;
    animation-delay: calc(var(--i) * -2s);
  }

  .km-intro-heart:nth-child(1) { left: 15%; top: 20%; }
  .km-intro-heart:nth-child(2) { right: 20%; top: 30%; }
  .km-intro-heart:nth-child(3) { left: 25%; bottom: 25%; }
  .km-intro-heart:nth-child(4) { right: 15%; bottom: 20%; }

  .km-page.is-unwrapped .km-intro {
    pointer-events: none;
    animation: km-intro-away .85s ease forwards;
  }

  .km-diary {
    position: relative;
    width: min(22rem, 85vw);
    aspect-ratio: 0.7;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    perspective: 2000px;
    animation: km-diary-float 3s ease-in-out infinite;
  }

  .km-diary-cover {
    position: absolute;
    inset: 0;
    border-radius: 1rem 2rem 2rem 1rem;
    background: linear-gradient(135deg, rgba(255,230,236,.98), rgba(241,235,255,.96));
    box-shadow: 
      0 2rem 3.5rem rgba(170,131,143,.25),
      inset -2px 0 8px rgba(242,154,174,.3),
      inset 0 2px rgba(255,255,255,.9);
    transform-origin: left center;
    transition: transform .6s cubic-bezier(.2,.8,.2,1);
  }

  .km-diary-title {
    position: absolute;
    inset: 2rem 1.5rem auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    z-index: 2;
  }

  .km-diary-date {
    padding: .4rem .8rem;
    border-radius: 999px;
    background: rgba(255,255,255,.8);
    color: var(--km-pink);
    font-size: .85rem;
    font-weight: 800;
    letter-spacing: .05em;
  }

  .km-diary-main {
    font-size: 2rem;
    font-weight: 900;
    color: var(--km-ink);
    letter-spacing: .05em;
  }

  .km-diary-subtitle {
    font-size: .95rem;
    color: var(--km-pink);
    font-weight: 700;
    opacity: 0.9;
  }

  .km-diary-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: opacity .6s ease;
  }

  .km-page.is-unwrapped .km-diary-decor {
    opacity: 0;
  }

  .km-diary-deco-flower {
    position: absolute;
    left: 1rem;
    top: 1rem;
    font-size: 2rem;
    animation: km-diary-float 3s ease-in-out infinite;
    animation-delay: -1s;
  }

  .km-diary-deco-pig {
    position: absolute;
    right: 1rem;
    top: 1.2rem;
    font-size: 1.8rem;
    animation: km-diary-float 2.5s ease-in-out infinite;
    animation-delay: -0.5s;
  }

  .km-diary-deco-sparkle {
    position: absolute;
    left: 1.2rem;
    bottom: 2.5rem;
    font-size: 1.5rem;
    animation: km-diary-float 2.8s ease-in-out infinite;
  }

  .km-diary-deco-cherry {
    position: absolute;
    right: 1.5rem;
    bottom: 3rem;
    font-size: 1.6rem;
    animation: km-diary-float 3.2s ease-in-out infinite;
    animation-delay: -1.5s;
  }

  .km-diary-pages {
    position: absolute;
    inset: .3rem .3rem .3rem auto;
    width: calc(100% - 2rem);
    border-radius: 0 2rem 2rem 0;
    background: linear-gradient(90deg, #fefcfa 0%, #fffef8 50%, #fffffe 100%);
    box-shadow: 
      inset 4px 0 8px rgba(242,154,174,.08),
      2px 0 12px rgba(170,131,143,.1);
  }

  .km-diary-pages span {
    position: absolute;
    left: 0;
    right: 1.5rem;
    height: 1px;
    background: rgba(242,154,174,.15);
  }

  .km-diary-pages span:nth-child(1) { top: 25%; }
  .km-diary-pages span:nth-child(2) { top: 50%; }
  .km-diary-pages span:nth-child(3) { top: 75%; }

  .km-diary-hint {
    position: absolute;
    left: 50%;
    bottom: -3rem;
    transform: translateX(-50%);
    padding: .6rem 1.2rem;
    border-radius: 999px;
    background: rgba(255,255,255,.85);
    box-shadow: 0 .5rem 1.5rem rgba(170,131,143,.15);
    color: var(--km-ink);
    font-size: .95rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .km-diary:hover .km-diary-cover {
    transform: rotateY(-15deg);
  }

  .km-diary:focus-visible {
    outline: 3px solid rgba(242,154,174,.34);
    outline-offset: .8rem;
    border-radius: 2rem;
  }

  .km-page.is-unwrapped .km-diary {
    animation: none;
  }

  .km-page.is-unwrapped .km-diary-cover {
    animation: km-diary-open .85s cubic-bezier(.2,.8,.2,1) forwards;
  }

  .km-page.is-unwrapped .km-diary-pages {
    animation: km-pages-flip .85s cubic-bezier(.2,.8,.2,1) forwards;
  }

  .km-page.is-unwrapped .km-diary-hint {
    animation: km-fade-out .4s ease forwards;
  }

  .km-content {
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(1.2rem) scale(.98);
    pointer-events: none;
    transition: opacity .75s ease .3s, transform .75s cubic-bezier(.2,.8,.2,1) .3s;
  }

  .km-page.is-unwrapped .km-content {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .km-celebrate {
    position: fixed;
    inset: 0;
    z-index: 3;
    overflow: hidden;
    pointer-events: none;
  }

  .km-celebrate span {
    position: absolute;
    left: var(--x);
    top: var(--y);
    color: rgba(242,154,174,.76);
    font-size: var(--size);
    font-weight: 900;
    line-height: 1;
    opacity: 0;
    text-shadow: 0 .42rem 1.1rem rgba(170,131,143,.12);
  }

  .km-celebrate span:nth-child(3n + 2) { color: rgba(185,170,244,.7); }
  .km-celebrate span:nth-child(3n) { color: rgba(121,189,214,.7); }

  .km-page.is-unwrapped .km-celebrate span {
    animation: km-sparkle-pop 2.2s cubic-bezier(.18,.84,.28,1) var(--delay) forwards;
  }

  .km-music {
    position: fixed;
    right: max(0.9rem, env(safe-area-inset-right));
    bottom: max(0.9rem, env(safe-area-inset-bottom));
    z-index: 5;
    display: inline-flex;
    align-items: center;
    gap: 0.52rem;
    min-height: 2.85rem;
    padding: 0.6rem 0.95rem;
    border: 1px solid rgba(255,255,255,0.86);
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    box-shadow: 0 1.05rem 2.6rem rgba(170, 131, 143, 0.16), inset 0 1px rgba(255,255,255,0.88);
    backdrop-filter: blur(18px);
    color: #675866;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 800;
    cursor: pointer;
    opacity: 0;
    transform: translateY(.52rem);
    pointer-events: none;
    transition: opacity .38s ease, transform .38s ease;
  }

  .km-page.is-unwrapped .km-music {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .km-music-note {
    display: grid;
    place-items: center;
    width: 1.62rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--km-pink), var(--km-lilac));
    color: white;
    box-shadow: 0 .58rem 1.2rem rgba(185,170,244,.24);
  }

  .km-music.is-playing .km-music-note { animation: km-pulse 1.85s ease-in-out infinite; }

  .km-container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  .km-header { text-align: center; margin-bottom: 3rem; opacity: 0; transform: translateY(1rem); }
  .km-page.is-unwrapped .km-header { animation: km-fade-up .6s ease .4s forwards; }
  .km-date-badge { display: inline-block; padding: .5rem 1rem; border-radius: 999px; background: rgba(255,255,255,.8); color: var(--km-pink); font-size: .85rem; font-weight: 800; margin-bottom: 1rem; box-shadow: 0 .5rem 1rem rgba(242,154,174,.15); }
  .km-title { font-size: clamp(2.5rem, 8vw, 3.5rem); font-weight: 900; color: var(--km-ink); margin: 0 0 .5rem; letter-spacing: -.02em; }
  .km-subtitle { font-size: 1.1rem; color: var(--km-muted); margin: 0; }
  .km-section-heading { font-size: 1.8rem; font-weight: 800; color: var(--km-ink); margin: 0 0 1.5rem; text-align: center; }
  .km-timeline-section, .km-timer-section { margin-bottom: 4rem; opacity: 0; transform: translateY(1rem); }
  .km-page.is-unwrapped .km-timeline-section { animation: km-fade-up .6s ease .7s forwards; }
  .km-page.is-unwrapped .km-timer-section { animation: km-fade-up .6s ease 1s forwards; }
  .km-timeline { position: relative; max-width: 100%; }
  .km-timeline::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--km-pink), var(--km-lilac)); transform: translateX(-50%); }
  .km-timeline-item { position: relative; padding-bottom: 3rem; display: flex; justify-content: center; }
  .km-timeline-item:last-child { padding-bottom: 0; }
  .km-timeline-item:nth-child(odd) { justify-content: flex-start; }
  .km-timeline-item:nth-child(even) { justify-content: flex-end; }
  .km-timeline-dot { position: absolute; left: 50%; top: 1rem; width: 1.2rem; height: 1.2rem; border-radius: 50%; background: white; border: 3px solid var(--km-pink); box-shadow: 0 0 0 4px rgba(242,154,174,.2); transform: translateX(-50%); z-index: 2; }
  .km-timeline-content { position: relative; background: rgba(255,255,255,.75); border-radius: 1.2rem; padding: 1.3rem 1.5rem; backdrop-filter: blur(10px); box-shadow: 0 .6rem 1.8rem rgba(170,131,143,.12); max-width: calc(50% - 2.5rem); }
  .km-timeline-item:nth-child(odd) .km-timeline-content::after { content: ''; position: absolute; right: -10px; top: 1.2rem; width: 0; height: 0; border-style: solid; border-width: 8px 0 8px 10px; border-color: transparent transparent transparent rgba(255,255,255,.75); }
  .km-timeline-item:nth-child(even) .km-timeline-content::before { content: ''; position: absolute; left: -10px; top: 1.2rem; width: 0; height: 0; border-style: solid; border-width: 8px 10px 8px 0; border-color: transparent rgba(255,255,255,.75) transparent transparent; }
  .km-time { display: inline-block; padding: .3rem .7rem; border-radius: 999px; background: rgba(242,154,174,.15); font-size: .78rem; font-weight: 800; color: var(--km-pink); margin-bottom: .6rem; }
  .km-event-title { font-size: 1.18rem; font-weight: 800; color: var(--km-ink); margin: 0 0 .6rem; }
  .km-event-desc { font-size: .98rem; color: var(--km-muted); margin: 0; line-height: 1.75; }
  @media (max-width: 640px) {
    .km-timeline::before { left: 1rem; transform: none; }
    .km-timeline-item { justify-content: flex-start !important; padding-left: 3rem; }
    .km-timeline-dot { left: 1rem; transform: none; }
    .km-timeline-content { max-width: 100%; }
    .km-timeline-item:nth-child(odd) .km-timeline-content::after,
    .km-timeline-item:nth-child(even) .km-timeline-content::before { display: none; }
    .km-timeline-content::after { content: ''; position: absolute; left: -10px; top: 1.2rem; width: 0; height: 0; border-style: solid; border-width: 8px 10px 8px 0; border-color: transparent rgba(255,255,255,.75) transparent transparent; }
  }
  .km-timer { background: linear-gradient(135deg, rgba(255,240,245,.9), rgba(245,240,255,.9)); border-radius: 1.5rem; padding: 2rem 1.5rem; text-align: center; backdrop-filter: blur(10px); box-shadow: 0 1rem 2.5rem rgba(170,131,143,.15); }
  .km-timer-title { display: flex; align-items: center; justify-content: center; gap: .6rem; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 800; color: var(--km-ink); }
  .km-timer-emoji { font-size: 1.8rem; }
  .km-timer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.2rem; }
  .km-timer-item { background: rgba(255,255,255,.8); border-radius: 1rem; padding: 1rem .5rem; box-shadow: 0 .5rem 1rem rgba(242,154,174,.1); }
  .km-timer-value { font-size: clamp(1.8rem, 6vw, 2.5rem); font-weight: 900; color: var(--km-pink); line-height: 1; margin-bottom: .3rem; font-variant-numeric: tabular-nums; }
  .km-timer-label { font-size: .85rem; font-weight: 700; color: var(--km-muted); }
  .km-timer-message { font-size: 1.05rem; color: var(--km-ink); margin: 0; font-weight: 600; }
  @keyframes km-fade-up { to { opacity: 1; transform: translateY(0); } }
  @keyframes km-fade-out { to { opacity: 0; } }
  @keyframes km-firework { 0%, 48%, 100% { opacity: 0; transform: scale(.18); } 56% { opacity: .8; transform: scale(calc(var(--scale) * .88)); } 74% { opacity: 0; transform: scale(calc(var(--scale) * 1.22)); } }
  @keyframes km-fall { 0% { opacity: 0; transform: translate3d(0, -2rem, 0) rotate(28deg); } 12% { opacity: .7; } 100% { opacity: 0; transform: translate3d(1.9rem, 110svh, 0) rotate(218deg); } }
  @keyframes km-diary-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-.5rem); } }
  @keyframes km-diary-open { to { transform: rotateY(-160deg); opacity: 0; } }
  @keyframes km-pages-flip { to { transform: translateX(100%); opacity: 0; } }
  @keyframes km-intro-away { to { opacity: 0; visibility: hidden; } }
  @keyframes km-sparkle-pop { 0%, 100% { opacity: 0; } 8% { opacity: 0; transform: translate(0, 0) scale(.5); } 18% { opacity: 1; transform: translate(var(--drift), -.85rem) scale(1.15); } 85% { opacity: .95; transform: translate(var(--drift-far), -1.8rem) scale(.92); } }
  @keyframes km-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes km-heart-orbit { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-1rem) scale(1.1); } }
`;
