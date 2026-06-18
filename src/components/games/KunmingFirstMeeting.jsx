import { useEffect, useMemo, useState } from 'react';

const MEETING_DATE = new Date('2026-06-13T10:30:00+08:00');

const itinerary = [
  {
    time: '上午',
    title: '带着花和甜点出发',
    detail:
      '这一天从认真准备开始。花和甜点不是装饰，是奔向第一次见面的心意，是一路上都舍不得放下的期待。',
    accent: '#d4688f',
  },
  {
    time: '中午',
    title: '在昆明第一次见面',
    detail:
      '真正站到彼此面前的时候，所有想象突然都有了形状。第一次见面的紧张和开心挤在一起，但很快就变成了踏实。',
    accent: '#5c8f7e',
  },
  {
    time: '下午',
    title: '吃了很多喜欢的东西',
    detail:
      '一路把想吃的、顺手看到的、突然想试试的都放进这一天里。比起美食本身，更难忘的是终于可以并肩分享。',
    accent: '#dd9355',
  },
  {
    time: '傍晚',
    title: '拥抱终于落地',
    detail:
      '原来真正抱到你，会比想象里更安静，也更幸福。那一刻像是一路上的想念终于有了确切答案。',
    accent: '#7972d8',
  },
  {
    time: '晚上',
    title: '一起看电影，一起折腾',
    detail:
      '电影、路上的来回、零碎的小插曲，甚至一点点折腾，都因为是和你一起而变得很好。热闹和琐碎都变成了纪念。',
    accent: '#3e84bf',
  },
  {
    time: '收尾',
    title: '很开心，也很幸福',
    detail:
      '这不是一句结束语，更像是这一天留下来的底色。昆明的风、那束花、那些拥抱和笑声，后来都会一直发亮。',
    accent: '#b55e64',
  },
];

const highlights = [
  { label: '城市', value: '云南 · 昆明' },
  { label: '关键词', value: '花 / 甜点 / 初见' },
  { label: '一起做了什么', value: '吃美食 / 拥抱 / 看电影 / 一起折腾' },
  { label: '留下来的感觉', value: '开心，幸福，终于见到你' },
];

const fragments = [
  '带着花去见你，本身就已经很浪漫。',
  '第一次见面没有想象中陌生，反而很快就觉得熟悉。',
  '吃到的每一口东西，后来都会和你绑定在一起。',
  '拥抱的时候，心里那块悬着的地方终于落了下来。',
  '看电影只是行程的一部分，但和你坐在一起就足够特别。',
  '连一点点折腾都不烦，反而像这一天专属的可爱注脚。',
];

function formatDuration(targetDate) {
  const diff = Date.now() - targetDate.getTime();
  const totalHours = Math.max(0, Math.floor(diff / 36e5));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

export default function KunmingFirstMeeting() {
  const [elapsed, setElapsed] = useState(() => formatDuration(MEETING_DATE));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed(formatDuration(MEETING_DATE));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(
    () => [
      { label: '已经记住', value: `${elapsed.days} 天` },
      { label: '额外小时', value: `${elapsed.hours} 小时` },
      { label: '初见地点', value: '昆明' },
      { label: '这天的结论', value: '好幸福' },
    ],
    [elapsed],
  );

  return (
    <main className="km-page">
      <style>{styles}</style>

      <section className="km-hero">
        <div className="km-shell">
          <p className="km-kicker">Memory Timeline</p>
          <div className="km-date-row">
            <span>2026.06.13</span>
            <span className="km-dot" aria-hidden="true" />
            <span>云南昆明</span>
          </div>
          <h1>第一次见面，被昆明认真记住了。</h1>
          <p className="km-lead">
            那天我带着花和甜点去见我的宝贝猪。我们第一次真正站在彼此前面，一起吃了很多美食，
            一起拥抱，一起看电影，也一起折腾。整整一天都很开心，很幸福。
          </p>

          <div className="km-metrics" role="list" aria-label="纪念信息">
            {metrics.map((item) => (
              <div className="km-metric" key={item.label} role="listitem">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="km-strip">
        <div className="km-shell km-strip-grid">
          {highlights.map((item) => (
            <div className="km-strip-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="km-timeline-section">
        <div className="km-shell">
          <div className="km-section-head">
            <p>那一天的时间线</p>
            <h2>从出发到夜里，每一步都值得留下来。</h2>
          </div>

          <ol className="km-timeline">
            {itinerary.map((item, index) => (
              <li className="km-timeline-item" key={item.title}>
                <div className="km-timeline-rail" aria-hidden="true">
                  <span style={{ background: item.accent }} />
                </div>
                <article className="km-timeline-card">
                  <div className="km-timeline-meta">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.time}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="km-fragments">
        <div className="km-shell">
          <div className="km-section-head">
            <p>想反复记住的瞬间</p>
            <h2>有些细节没有多宏大，但会一直亮着。</h2>
          </div>

          <div className="km-fragment-grid">
            {fragments.map((text, index) => (
              <article className="km-fragment" key={text}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="km-closing">
        <div className="km-shell">
          <p className="km-closing-mark">昆明 / 初见 / 继续喜欢你</p>
          <h2>以后再回头看，6 月 13 日会一直是很特别的一天。</h2>
          <p className="km-closing-copy">
            它不是只属于当时的一次见面，也是后来很多幸福感的起点。
          </p>
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

  body {
    background:
      radial-gradient(circle at top left, rgba(248, 210, 221, 0.7), transparent 34%),
      radial-gradient(circle at top right, rgba(204, 232, 223, 0.72), transparent 30%),
      linear-gradient(180deg, #fffaf7 0%, #fffdfb 48%, #f8fbff 100%);
    color: #302329;
  }

  .km-page {
    min-height: 100vh;
  }

  .km-shell {
    width: min(1100px, calc(100vw - 40px));
    margin: 0 auto;
  }

  .km-hero,
  .km-strip,
  .km-timeline-section,
  .km-fragments,
  .km-closing {
    position: relative;
    padding: 32px 0;
  }

  .km-hero {
    padding-top: 72px;
    padding-bottom: 28px;
  }

  .km-kicker,
  .km-section-head p,
  .km-closing-mark {
    margin: 0 0 14px;
    font-size: 0.82rem;
    letter-spacing: 0;
    text-transform: uppercase;
    color: #9b5f73;
  }

  .km-date-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid rgba(164, 117, 137, 0.24);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.65);
    color: #684552;
    font-size: 0.92rem;
    backdrop-filter: blur(12px);
  }

  .km-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #d4688f;
  }

  .km-hero h1,
  .km-section-head h2,
  .km-closing h2 {
    margin: 18px 0 0;
    max-width: 14ch;
    font-size: clamp(2.7rem, 6vw, 5.5rem);
    line-height: 0.98;
    font-weight: 700;
    color: #22181d;
  }

  .km-lead,
  .km-closing-copy,
  .km-timeline-card p,
  .km-fragment p {
    margin: 18px 0 0;
    max-width: 760px;
    font-size: 1.05rem;
    line-height: 1.8;
    color: #5a474d;
  }

  .km-metrics,
  .km-strip-grid,
  .km-fragment-grid {
    display: grid;
    gap: 14px;
  }

  .km-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 36px;
  }

  .km-metric,
  .km-strip-item,
  .km-fragment,
  .km-timeline-card {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(116, 93, 102, 0.12);
    box-shadow: 0 18px 40px rgba(109, 83, 93, 0.08);
    backdrop-filter: blur(12px);
  }

  .km-metric {
    min-height: 116px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .km-metric span,
  .km-strip-item span,
  .km-timeline-meta,
  .km-fragment span {
    font-size: 0.88rem;
    color: #8d6d78;
  }

  .km-metric strong,
  .km-strip-item strong {
    font-size: 1.35rem;
    line-height: 1.2;
    color: #2e2126;
  }

  .km-strip-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .km-strip-item {
    min-height: 124px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .km-timeline-section {
    padding-top: 52px;
  }

  .km-section-head h2 {
    max-width: 11ch;
    font-size: clamp(2rem, 4.5vw, 3.4rem);
    line-height: 1.05;
  }

  .km-timeline {
    list-style: none;
    margin: 32px 0 0;
    padding: 0;
    display: grid;
    gap: 18px;
  }

  .km-timeline-item {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
  }

  .km-timeline-rail {
    display: flex;
    justify-content: center;
  }

  .km-timeline-rail span {
    width: 3px;
    border-radius: 999px;
    min-height: 100%;
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.36);
  }

  .km-timeline-card {
    padding: 22px 22px 20px;
  }

  .km-timeline-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .km-timeline-card h3 {
    margin: 14px 0 0;
    font-size: 1.45rem;
    line-height: 1.25;
    color: #2e2027;
  }

  .km-fragments {
    padding-top: 56px;
    padding-bottom: 48px;
  }

  .km-fragment-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 30px;
  }

  .km-fragment {
    min-height: 172px;
    padding: 20px;
  }

  .km-fragment span {
    display: inline-block;
    margin-bottom: 16px;
  }

  .km-fragment p {
    margin: 0;
    max-width: none;
  }

  .km-closing {
    padding-top: 38px;
    padding-bottom: 84px;
  }

  .km-closing h2 {
    max-width: 13ch;
    font-size: clamp(2rem, 4.2vw, 3.6rem);
  }

  @media (max-width: 900px) {
    .km-metrics,
    .km-strip-grid,
    .km-fragment-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .km-hero h1 {
      max-width: 10ch;
    }
  }

  @media (max-width: 640px) {
    .km-shell {
      width: min(100vw - 24px, 1100px);
    }

    .km-hero {
      padding-top: 42px;
    }

    .km-metrics,
    .km-strip-grid,
    .km-fragment-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .km-timeline-item {
      grid-template-columns: 18px minmax(0, 1fr);
      gap: 12px;
    }

    .km-lead,
    .km-closing-copy,
    .km-timeline-card p,
    .km-fragment p {
      font-size: 0.98rem;
    }
  }
`;
