const moments = [
  {
    label: '那一天',
    title: '第一次相遇，时间开始有了名字',
    detail:
      '从这一天起，原本只是普通流动着的日子，忽然有了一个明确的起点。后来回头看，很多温柔都能顺着这条线找到来源。',
  },
  {
    label: '记住的感觉',
    title: '不是盛大的开场，但很真',
    detail:
      '第一次相遇未必要多戏剧化，真正珍贵的反而是那种安静又确定的感觉。像是终于和想见的人，在同一个时空里站稳了。',
  },
  {
    label: '之后',
    title: '很多故事都从这里慢慢长出来',
    detail:
      '后来的一起聊天、一起惦记、一起见面、一起开心，都会把这一天衬得更特别。它不是回忆的配角，而是整个时间线的起点。',
  },
];

const notes = [
  '2025.10.18',
  '第一次相遇',
  '时间线的开始',
  '以后每次回头看都会很重要',
];

export default function FirstMeetingMemory() {
  return (
    <main className="fm-page">
      <style>{styles}</style>

      <section className="fm-hero">
        <div className="fm-shell">
          <p className="fm-kicker">The Beginning</p>
          <div className="fm-date">2025.10.18</div>
          <h1>第一次相遇，是后来所有纪念的起点。</h1>
          <p className="fm-lead">
            这一天被写在 `/games/` 首页最上面的计时器里，也应该被好好单独记下来。
            从第一次相遇开始，后来的很多开心、想念和靠近，才有了真正的出处。
          </p>
        </div>
      </section>

      <section className="fm-notes">
        <div className="fm-shell fm-notes-grid">
          {notes.map((item) => (
            <div className="fm-note" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="fm-story">
        <div className="fm-shell">
          <div className="fm-head">
            <p>时间线的开头</p>
            <h2>有些日子并不喧哗，但会决定后面一切的语气。</h2>
          </div>

          <div className="fm-grid">
            {moments.map((item) => (
              <article className="fm-card" key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fm-closing">
        <div className="fm-shell">
          <p className="fm-closing-mark">first meeting / first page / first light</p>
          <h2>所以这一天不只是一个日期，它是后来整条时间线的第一页。</h2>
        </div>
      </section>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background:
      radial-gradient(circle at top, rgba(245, 214, 224, 0.72), transparent 34%),
      linear-gradient(180deg, #fffaf8 0%, #fffdfd 50%, #f7fbff 100%);
    color: #2f2228;
  }

  .fm-shell {
    width: min(1040px, calc(100vw - 40px));
    margin: 0 auto;
  }

  .fm-hero,
  .fm-notes,
  .fm-story,
  .fm-closing {
    padding: 32px 0;
  }

  .fm-hero {
    padding-top: 72px;
    padding-bottom: 24px;
  }

  .fm-kicker,
  .fm-head p,
  .fm-closing-mark {
    margin: 0 0 14px;
    font-size: 0.84rem;
    text-transform: uppercase;
    color: #9b6173;
  }

  .fm-date {
    display: inline-flex;
    align-items: center;
    min-height: 42px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid rgba(160, 117, 135, 0.25);
    background: rgba(255, 255, 255, 0.72);
    color: #654653;
    font-size: 0.95rem;
  }

  .fm-hero h1,
  .fm-head h2,
  .fm-closing h2 {
    margin: 18px 0 0;
    max-width: 12ch;
    font-size: clamp(2.7rem, 5.4vw, 5rem);
    line-height: 1.02;
    color: #23181d;
  }

  .fm-lead,
  .fm-card p {
    margin: 18px 0 0;
    max-width: 760px;
    font-size: 1.04rem;
    line-height: 1.8;
    color: #5b484f;
  }

  .fm-notes-grid,
  .fm-grid {
    display: grid;
    gap: 16px;
  }

  .fm-notes-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .fm-note,
  .fm-card {
    border-radius: 8px;
    border: 1px solid rgba(122, 97, 106, 0.12);
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 18px 40px rgba(108, 82, 91, 0.08);
    backdrop-filter: blur(12px);
  }

  .fm-note {
    min-height: 104px;
    padding: 18px;
    display: flex;
    align-items: end;
    font-size: 1.05rem;
    line-height: 1.5;
    color: #35262c;
  }

  .fm-story {
    padding-top: 52px;
    padding-bottom: 52px;
  }

  .fm-head h2 {
    max-width: 11ch;
    font-size: clamp(2rem, 4.3vw, 3.4rem);
  }

  .fm-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 28px;
  }

  .fm-card {
    min-height: 260px;
    padding: 22px;
  }

  .fm-card span {
    font-size: 0.86rem;
    color: #8f6f7a;
  }

  .fm-card h3 {
    margin: 14px 0 0;
    font-size: 1.4rem;
    line-height: 1.28;
    color: #2d1f25;
  }

  .fm-card p {
    margin-top: 14px;
    max-width: none;
  }

  .fm-closing {
    padding-top: 26px;
    padding-bottom: 86px;
  }

  .fm-closing h2 {
    max-width: 14ch;
    font-size: clamp(2rem, 4vw, 3.6rem);
  }

  @media (max-width: 900px) {
    .fm-notes-grid,
    .fm-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .fm-shell {
      width: min(100vw - 24px, 1040px);
    }

    .fm-hero {
      padding-top: 42px;
    }

    .fm-notes-grid,
    .fm-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .fm-lead,
    .fm-card p {
      font-size: 0.98rem;
    }
  }
`;
