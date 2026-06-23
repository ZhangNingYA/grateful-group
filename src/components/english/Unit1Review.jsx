/**
 * Unit1Review.jsx
 *
 * 商务英语 Unit 1 复习交互组件集合。
 * 设计语言：治愈、温暖、以文字为中心。
 *   - 奶油米色背景 + 暖棕墨色文字 + 衬线字体
 *   - PageStyles        注入全局样式
 *   - VocabularyCards   词汇卡片（点击翻转显示中文释义）—— 唯一的交互项
 *   - MatchingList      Task 1 词义匹配（英文 + 中文译文，文本排版）
 *   - FillBlankList     选词填空（答案柔和下划线 + 中文译文）
 *
 * 在 MDX 中这样使用：
 *   import { PageStyles, VocabularyCards, MatchingList, FillBlankList } from '../../components/english/Unit1Review.jsx';
 */

import React, { useState } from 'react';

/* ============================================================
 * 全局样式注入（温暖治愈的奶油色主题）
 * ============================================================ */
export function PageStyles() {
  return (
    <style>{`
      :root {
        --eu1-ink: #4a3f35;          /* 暖棕墨色，主文字 */
        --eu1-ink-soft: #7a6b5d;     /* 次级文字 */
        --eu1-ink-faint: #a89888;    /* 辅助文字 */
        --eu1-cream: #fbf6ee;        /* 奶油底 */
        --eu1-cream-2: #f5ede1;      /* 略深奶油 */
        --eu1-paper: #fffdf9;        /* 卡片纸面 */
        --eu1-line: #ece2d3;         /* 柔和分隔线 */
        --eu1-terra: #c97b5a;        /* 陶土橙，强调 */
        --eu1-terra-soft: #f6e4da;
        --eu1-sage: #8a9a7b;         /* 鼠尾草绿，次强调 */
        --eu1-sage-soft: #e8ede1;
        --eu1-honey: #d9a441;        /* 蜂蜜金，答案高亮 */
      }

      .eu1 {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--eu1-ink);
        line-height: 1.85;
      }
      .eu1-zh {
        font-family: "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
      }

      /* ---------- 词汇卡片 ---------- */
      .eu1-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }
      .eu1-flip { perspective: 1100px; height: 100px; cursor: pointer; }
      .eu1-flip-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.55s cubic-bezier(.25,.8,.25,1);
        transform-style: preserve-3d;
      }
      .eu1-flip.flipped .eu1-flip-inner { transform: rotateY(180deg); }
      .eu1-face {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; gap: 5px;
        align-items: center; justify-content: center;
        text-align: center; padding: 12px;
        border-radius: 18px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
        box-sizing: border-box;
      }
      .eu1-face-front {
        background: var(--eu1-paper);
        border: 1px solid var(--eu1-line);
        color: var(--eu1-ink);
        font-weight: 600; font-size: 17px; letter-spacing: 0.2px;
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eu1-face-front small {
        color: var(--eu1-ink-faint); font-size: 10px; font-weight: 400;
        letter-spacing: 0.5px; font-style: italic;
      }
      .eu1-face-back {
        background: var(--eu1-terra-soft);
        border: 1px solid var(--eu1-terra);
        color: #a8542f; transform: rotateY(180deg);
        font-size: 16px; font-weight: 600; line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eu1-flip:hover .eu1-face-front { box-shadow: 0 6px 16px rgba(201,123,90,0.14); }

      .eu1-toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
      .eu1-btn {
        background: var(--eu1-terra);
        border: none; color: #fff;
        padding: 9px 18px; border-radius: 22px;
        font-size: 14px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        box-shadow: 0 3px 10px rgba(201,123,90,0.25);
        transition: transform 0.14s, box-shadow 0.14s;
      }
      .eu1-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(201,123,90,0.34); }
      .eu1-hint { color: var(--eu1-ink-soft); font-size: 14px; font-style: italic; }

      /* ---------- 匹配题（文本排版，英文 + 中文） ---------- */
      .eu1-list { margin: 24px 0; }
      .eu1-item {
        padding: 16px 4px 16px 0;
        border-bottom: 1px solid var(--eu1-line);
      }
      .eu1-item:last-child { border-bottom: none; }
      .eu1-line1 {
        display: flex; align-items: baseline; gap: 12px;
        font-size: 17px;
      }
      .eu1-idx {
        flex: none;
        color: var(--eu1-terra); font-weight: 700;
        font-size: 15px; min-width: 22px;
      }
      .eu1-term { font-weight: 700; color: var(--eu1-ink); }
      .eu1-eq { color: var(--eu1-ink-faint); margin: 0 2px; }
      .eu1-en-def { color: var(--eu1-ink); font-weight: 400; }
      .eu1-zh-line {
        margin: 5px 0 0 34px;
        color: var(--eu1-ink-soft);
        font-size: 15px;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }

      /* ---------- 填空题（答案柔和高亮 + 中文译文） ---------- */
      .eu1-sent { font-size: 17px; color: var(--eu1-ink); }
      .eu1-answer {
        font-weight: 700;
        color: #a8542f;
        border-bottom: 2px solid var(--eu1-honey);
        padding: 0 1px;
        white-space: nowrap;
      }

      /* ---------- 词库 ---------- */
      .eu1-options-box {
        display: flex; flex-wrap: wrap; gap: 9px;
        padding: 16px 18px; margin: 18px 0;
        border-radius: 16px;
        background: var(--eu1-sage-soft);
        border: 1px solid rgba(138,154,123,0.25);
      }
      .eu1-options-label {
        width: 100%; color: var(--eu1-sage); font-weight: 700;
        font-size: 13px; letter-spacing: 1px; margin-bottom: 2px;
        text-transform: uppercase;
      }
      .eu1-chip {
        background: var(--eu1-paper);
        border: 1px solid rgba(138,154,123,0.35);
        color: #5f6e4f;
        padding: 5px 14px; border-radius: 20px;
        font-size: 14px; font-weight: 600;
      }
    `}</style>
  );
}

/* ============================================================
 * 词汇卡片（唯一交互项：点击翻转）
 * ============================================================ */
export function VocabularyCards({ words = [] }) {
  const [flipped, setFlipped] = useState({});
  const [allFlipped, setAllFlipped] = useState(false);

  const toggle = (i) => setFlipped((s) => ({ ...s, [i]: !s[i] }));

  const flipAll = () => {
    const next = !allFlipped;
    setAllFlipped(next);
    const all = {};
    words.forEach((_, i) => (all[i] = next));
    setFlipped(all);
  };

  return (
    <div className="eu1">
      <div className="eu1-toolbar">
        <button className="eu1-btn" onClick={flipAll}>
          {allFlipped ? '↩ 显示单词' : '显示释义'}
        </button>
        <span className="eu1-hint">轻点卡片，翻看中文释义</span>
      </div>
      <div className="eu1-grid">
        {words.map((w, i) => (
          <div
            key={i}
            className={`eu1-flip${flipped[i] ? ' flipped' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="eu1-flip-inner">
              <div className="eu1-face eu1-face-front">
                {w.word}
                <small>tap</small>
              </div>
              <div className="eu1-face eu1-face-back">{w.meaning}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * 词义匹配（文本排版，英文词条 + 英文释义 + 中文译文）
 * ============================================================ */
export function MatchingList({ columnA = [], columnB = [], answers = {} }) {
  const defOf = (letter) => {
    const found = columnB.find((b) => b.letter === letter);
    return found ? found.definition : '';
  };

  return (
    <div className="eu1">
      <div className="eu1-list">
        {columnA.map((a) => {
          const letter = answers[String(a.number)];
          return (
            <div className="eu1-item" key={a.number}>
              <div className="eu1-line1">
                <span className="eu1-idx">{a.number}</span>
                <span>
                  <span className="eu1-term">{a.item}</span>
                  <span className="eu1-eq"> — </span>
                  <span className="eu1-en-def">{defOf(letter)}</span>
                </span>
              </div>
              {a.zh && <div className="eu1-zh-line eu1-zh">{a.zh}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * 选词填空（答案柔和高亮嵌入句子 + 中文译文）
 * ============================================================ */
export function FillBlankList({ items = [], options = null }) {
  const renderSentence = (it) => {
    const parts = it.sentence.split(/_{2,}/);
    return (
      <span className="eu1-sent">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && (
              <span className="eu1-answer">{it.answer}</span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="eu1">
      {options && (
        <div className="eu1-options-box">
          <span className="eu1-options-label">Word Bank · 词库</span>
          {options.map((o) => (
            <span className="eu1-chip" key={o}>
              {o}
            </span>
          ))}
        </div>
      )}
      <div className="eu1-list">
        {items.map((it) => (
          <div className="eu1-item" key={it.number}>
            <div className="eu1-line1">
              <span className="eu1-idx">{it.number}</span>
              <span>{renderSentence(it)}</span>
            </div>
            {it.zh && <div className="eu1-zh-line eu1-zh">{it.zh}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
