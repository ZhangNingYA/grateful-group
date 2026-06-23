/**
 * Unit4Review.jsx
 *
 * 商务英语 Unit 4 复习交互组件集合。
 * 设计语言：治愈、温暖、以文字为中心（与 Unit 1/2/3 保持一致）。
 *   - 奶油米色背景 + 暖棕墨色文字 + 衬线字体
 *   - PageStyles        注入全局样式
 *   - VocabularyCards   词汇卡片（点击翻转显示中文释义）—— 唯一的交互项
 *   - MatchingList      Task 1 词义匹配（英文词条 → 中文，文本排版）
 *   - FillBlankList     选词填空（答案柔和下划线 + 中文译文，支持单空 / 多空）
 *
 * 在 MDX 中这样使用：
 *   import { PageStyles, VocabularyCards, MatchingList, FillBlankList } from '../../components/english/Unit4Review.jsx';
 */

import React, { useState } from 'react';

/* ============================================================
 * 全局样式注入（温暖治愈的奶油色主题）
 * ============================================================ */
export function PageStyles() {
  return (
    <style>{`
      :root {
        --eu4-ink: #4a3f35;          /* 暖棕墨色，主文字 */
        --eu4-ink-soft: #7a6b5d;     /* 次级文字 */
        --eu4-ink-faint: #a89888;    /* 辅助文字 */
        --eu4-cream: #fbf6ee;        /* 奶油底 */
        --eu4-cream-2: #f5ede1;      /* 略深奶油 */
        --eu4-paper: #fffdf9;        /* 卡片纸面 */
        --eu4-line: #ece2d3;         /* 柔和分隔线 */
        --eu4-terra: #c97b5a;        /* 陶土橙，强调 */
        --eu4-terra-soft: #f6e4da;
        --eu4-sage: #8a9a7b;         /* 鼠尾草绿，次强调 */
        --eu4-sage-soft: #e8ede1;
        --eu4-honey: #d9a441;        /* 蜂蜜金，答案高亮 */
      }

      .eu4 {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--eu4-ink);
        line-height: 1.85;
      }
      .eu4-zh {
        font-family: "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
      }

      /* ---------- 词汇卡片 ---------- */
      .eu4-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }
      .eu4-flip { perspective: 1100px; height: 104px; cursor: pointer; }
      .eu4-flip-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.55s cubic-bezier(.25,.8,.25,1);
        transform-style: preserve-3d;
      }
      .eu4-flip.flipped .eu4-flip-inner { transform: rotateY(180deg); }
      .eu4-face {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; gap: 5px;
        align-items: center; justify-content: center;
        text-align: center; padding: 12px;
        border-radius: 18px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
        box-sizing: border-box;
      }
      .eu4-face-front {
        background: var(--eu4-paper);
        border: 1px solid var(--eu4-line);
        color: var(--eu4-ink);
        font-weight: 600; font-size: 16px; letter-spacing: 0.2px;
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eu4-face-front small {
        color: var(--eu4-ink-faint); font-size: 10px; font-weight: 400;
        letter-spacing: 0.5px; font-style: italic;
      }
      .eu4-face-back {
        background: var(--eu4-terra-soft);
        border: 1px solid var(--eu4-terra);
        color: #a8542f; transform: rotateY(180deg);
        font-size: 15px; font-weight: 600; line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eu4-flip:hover .eu4-face-front { box-shadow: 0 6px 16px rgba(201,123,90,0.14); }

      .eu4-toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
      .eu4-btn {
        background: var(--eu4-terra);
        border: none; color: #fff;
        padding: 9px 18px; border-radius: 22px;
        font-size: 14px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        box-shadow: 0 3px 10px rgba(201,123,90,0.25);
        transition: transform 0.14s, box-shadow 0.14s;
      }
      .eu4-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(201,123,90,0.34); }
      .eu4-hint { color: var(--eu4-ink-soft); font-size: 14px; font-style: italic; }

      /* ---------- 列表通用（匹配题、填空题） ---------- */
      .eu4-list { margin: 24px 0; }
      .eu4-item {
        padding: 16px 4px 16px 0;
        border-bottom: 1px solid var(--eu4-line);
      }
      .eu4-item:last-child { border-bottom: none; }
      .eu4-line1 {
        display: flex; align-items: baseline; gap: 12px;
        font-size: 17px;
      }
      .eu4-idx {
        flex: none;
        color: var(--eu4-terra); font-weight: 700;
        font-size: 15px; min-width: 22px;
      }
      .eu4-zh-line {
        margin: 5px 0 0 34px;
        color: var(--eu4-ink-soft);
        font-size: 15px;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }

      /* ---------- 匹配题（英文词条 → 中文） ---------- */
      .eu4-term { font-weight: 700; color: var(--eu4-ink); }
      .eu4-match-zh {
        margin: 5px 0 0 34px;
        font-size: 16px;
        color: #a8542f;
        font-weight: 600;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eu4-match-zh .eu4-arrow { color: var(--eu4-ink-faint); font-weight: 400; margin-right: 8px; }

      /* ---------- 填空题（答案柔和高亮 + 中文译文） ---------- */
      .eu4-sent { font-size: 17px; color: var(--eu4-ink); }
      .eu4-answer {
        font-weight: 700;
        color: #a8542f;
        border-bottom: 2px solid var(--eu4-honey);
        padding: 0 1px;
        white-space: nowrap;
      }

      /* ---------- 词库 ---------- */
      .eu4-options-box {
        display: flex; flex-wrap: wrap; gap: 9px;
        padding: 16px 18px; margin: 18px 0;
        border-radius: 16px;
        background: var(--eu4-sage-soft);
        border: 1px solid rgba(138,154,123,0.25);
      }
      .eu4-options-label {
        width: 100%; color: var(--eu4-sage); font-weight: 700;
        font-size: 13px; letter-spacing: 1px; margin-bottom: 2px;
        text-transform: uppercase;
      }
      .eu4-chip {
        background: var(--eu4-paper);
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
    <div className="eu4">
      <div className="eu4-toolbar">
        <button className="eu4-btn" onClick={flipAll}>
          {allFlipped ? '↩ 显示单词' : '显示释义'}
        </button>
        <span className="eu4-hint">轻点卡片，翻看中文释义</span>
      </div>
      <div className="eu4-grid">
        {words.map((w, i) => (
          <div
            key={i}
            className={`eu4-flip${flipped[i] ? ' flipped' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="eu4-flip-inner">
              <div className="eu4-face eu4-face-front">
                {w.word}
                <small>tap</small>
              </div>
              <div className="eu4-face eu4-face-back">{w.meaning}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * 词义匹配（英文词条 → 中文，文本排版）
 *   columnA：[{ number, item }]
 *   columnB：[{ letter, definition }]
 *   answers：{ "1": "d", ... }
 * ============================================================ */
export function MatchingList({ columnA = [], columnB = [], answers = {} }) {
  const defOf = (letter) => {
    const found = columnB.find((b) => b.letter === letter);
    return found ? found.definition : '';
  };

  return (
    <div className="eu4">
      <div className="eu4-list">
        {columnA.map((a) => {
          const letter = answers[String(a.number)];
          return (
            <div className="eu4-item" key={a.number}>
              <div className="eu4-line1">
                <span className="eu4-idx">{a.number}</span>
                <span className="eu4-term">{a.item}</span>
              </div>
              <div className="eu4-match-zh">
                <span className="eu4-arrow">↳</span>
                {defOf(letter)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * 选词填空（答案柔和高亮嵌入句子 + 中文译文）
 *   单空：{ number, sentence, answer, zh }
 *   多空：{ number, sentence, answers: [...], zh }
 * ============================================================ */
export function FillBlankList({ items = [], options = null }) {
  const renderSentence = (it) => {
    const parts = it.sentence.split(/_{2,}/);
    const answers = it.answers || [it.answer];
    return (
      <span className="eu4-sent">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && (
              <span className="eu4-answer">
                {answers[idx] != null ? answers[idx] : '…'}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="eu4">
      {options && (
        <div className="eu4-options-box">
          <span className="eu4-options-label">Word Bank · 词库</span>
          {options.map((o) => (
            <span className="eu4-chip" key={o}>
              {o}
            </span>
          ))}
        </div>
      )}
      <div className="eu4-list">
        {items.map((it) => (
          <div className="eu4-item" key={it.number}>
            <div className="eu4-line1">
              <span className="eu4-idx">{it.number}</span>
              <span>{renderSentence(it)}</span>
            </div>
            {it.zh && <div className="eu4-zh-line eu4-zh">{it.zh}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
