/**
 * Unit2Review.jsx
 *
 * 商务英语 Unit 2 复习交互组件集合。
 * 设计语言：治愈、温暖、以文字为中心（与 Unit 1 保持一致）。
 *   - 奶油米色背景 + 暖棕墨色文字 + 衬线字体
 *   - PageStyles        注入全局样式
 *   - VocabularyCards   词汇卡片（点击翻转显示中文释义）—— 唯一的交互项
 *   - TranslationList   Task 1 中英互译（原文 + 译文，文本排版）
 *   - FillBlankList     选词填空（答案柔和下划线 + 中文译文）
 *
 * 在 MDX 中这样使用：
 *   import { PageStyles, VocabularyCards, TranslationList, FillBlankList } from '../../components/english/Unit2Review.jsx';
 */

import React, { useState } from 'react';

/* ============================================================
 * 全局样式注入（温暖治愈的奶油色主题）
 * ============================================================ */
export function PageStyles() {
  return (
    <style>{`
      :root {
        --eu2-ink: #4a3f35;          /* 暖棕墨色，主文字 */
        --eu2-ink-soft: #7a6b5d;     /* 次级文字 */
        --eu2-ink-faint: #a89888;    /* 辅助文字 */
        --eu2-cream: #fbf6ee;        /* 奶油底 */
        --eu2-cream-2: #f5ede1;      /* 略深奶油 */
        --eu2-paper: #fffdf9;        /* 卡片纸面 */
        --eu2-line: #ece2d3;         /* 柔和分隔线 */
        --eu2-terra: #c97b5a;        /* 陶土橙，强调 */
        --eu2-terra-soft: #f6e4da;
        --eu2-sage: #8a9a7b;         /* 鼠尾草绿，次强调 */
        --eu2-sage-soft: #e8ede1;
        --eu2-honey: #d9a441;        /* 蜂蜜金，答案高亮 */
      }

      .eu2 {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--eu2-ink);
        line-height: 1.85;
      }
      .eu2-zh {
        font-family: "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
      }

      /* ---------- 词汇卡片 ---------- */
      .eu2-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }
      .eu2-flip { perspective: 1100px; height: 100px; cursor: pointer; }
      .eu2-flip-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.55s cubic-bezier(.25,.8,.25,1);
        transform-style: preserve-3d;
      }
      .eu2-flip.flipped .eu2-flip-inner { transform: rotateY(180deg); }
      .eu2-face {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; gap: 5px;
        align-items: center; justify-content: center;
        text-align: center; padding: 12px;
        border-radius: 18px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
        box-sizing: border-box;
      }
      .eu2-face-front {
        background: var(--eu2-paper);
        border: 1px solid var(--eu2-line);
        color: var(--eu2-ink);
        font-weight: 600; font-size: 17px; letter-spacing: 0.2px;
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eu2-face-front small {
        color: var(--eu2-ink-faint); font-size: 10px; font-weight: 400;
        letter-spacing: 0.5px; font-style: italic;
      }
      .eu2-face-back {
        background: var(--eu2-terra-soft);
        border: 1px solid var(--eu2-terra);
        color: #a8542f; transform: rotateY(180deg);
        font-size: 16px; font-weight: 600; line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eu2-flip:hover .eu2-face-front { box-shadow: 0 6px 16px rgba(201,123,90,0.14); }

      .eu2-toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
      .eu2-btn {
        background: var(--eu2-terra);
        border: none; color: #fff;
        padding: 9px 18px; border-radius: 22px;
        font-size: 14px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        box-shadow: 0 3px 10px rgba(201,123,90,0.25);
        transition: transform 0.14s, box-shadow 0.14s;
      }
      .eu2-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(201,123,90,0.34); }
      .eu2-hint { color: var(--eu2-ink-soft); font-size: 14px; font-style: italic; }

      /* ---------- 列表通用（翻译题、填空题） ---------- */
      .eu2-list { margin: 24px 0; }
      .eu2-item {
        padding: 16px 4px 16px 0;
        border-bottom: 1px solid var(--eu2-line);
      }
      .eu2-item:last-child { border-bottom: none; }
      .eu2-line1 {
        display: flex; align-items: baseline; gap: 12px;
        font-size: 17px;
      }
      .eu2-idx {
        flex: none;
        color: var(--eu2-terra); font-weight: 700;
        font-size: 15px; min-width: 22px;
      }
      .eu2-zh-line {
        margin: 5px 0 0 34px;
        color: var(--eu2-ink-soft);
        font-size: 15px;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }

      /* ---------- 翻译题 ---------- */
      .eu2-src { color: var(--eu2-ink); }
      .eu2-src.eu2-zh { font-weight: 600; }
      .eu2-trans {
        margin: 5px 0 0 34px;
        font-size: 16px;
        color: #a8542f;
        font-weight: 600;
      }
      .eu2-trans .eu2-arrow { color: var(--eu2-ink-faint); font-weight: 400; margin-right: 8px; }

      /* ---------- 填空题（答案柔和高亮 + 中文译文） ---------- */
      .eu2-sent { font-size: 17px; color: var(--eu2-ink); }
      .eu2-answer {
        font-weight: 700;
        color: #a8542f;
        border-bottom: 2px solid var(--eu2-honey);
        padding: 0 1px;
        white-space: nowrap;
      }

      /* ---------- 词库 ---------- */
      .eu2-options-box {
        display: flex; flex-wrap: wrap; gap: 9px;
        padding: 16px 18px; margin: 18px 0;
        border-radius: 16px;
        background: var(--eu2-sage-soft);
        border: 1px solid rgba(138,154,123,0.25);
      }
      .eu2-options-label {
        width: 100%; color: var(--eu2-sage); font-weight: 700;
        font-size: 13px; letter-spacing: 1px; margin-bottom: 2px;
        text-transform: uppercase;
      }
      .eu2-chip {
        background: var(--eu2-paper);
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
    <div className="eu2">
      <div className="eu2-toolbar">
        <button className="eu2-btn" onClick={flipAll}>
          {allFlipped ? '↩ 显示单词' : '显示释义'}
        </button>
        <span className="eu2-hint">轻点卡片，翻看中文释义</span>
      </div>
      <div className="eu2-grid">
        {words.map((w, i) => (
          <div
            key={i}
            className={`eu2-flip${flipped[i] ? ' flipped' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="eu2-flip-inner">
              <div className="eu2-face eu2-face-front">
                {w.word}
                <small>tap</small>
              </div>
              <div className="eu2-face eu2-face-back">{w.meaning}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * 中英互译（原文 + 译文，文本排版）
 *   每个 item：{ number, item（原文）, answer（译文）, zh（可选：英→中时的中文说明） }
 * ============================================================ */
export function TranslationList({ items = [] }) {
  const isChinese = (text) => /[\u4e00-\u9fa5]/.test(text || '');

  return (
    <div className="eu2">
      <div className="eu2-list">
        {items.map((it) => {
          const srcIsZh = isChinese(it.item);
          return (
            <div className="eu2-item" key={it.number}>
              <div className="eu2-line1">
                <span className="eu2-idx">{it.number}</span>
                <span className={`eu2-src${srcIsZh ? ' eu2-zh' : ''}`}>
                  {it.item}
                </span>
              </div>
              <div className={`eu2-trans${!srcIsZh ? ' eu2-zh' : ''}`}>
                <span className="eu2-arrow">↳</span>
                {it.answer}
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
 * ============================================================ */
export function FillBlankList({ items = [], options = null }) {
  const renderSentence = (it) => {
    const parts = it.sentence.split(/_{2,}/);
    return (
      <span className="eu2-sent">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && (
              <span className="eu2-answer">{it.answer}</span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="eu2">
      {options && (
        <div className="eu2-options-box">
          <span className="eu2-options-label">Word Bank · 词库</span>
          {options.map((o) => (
            <span className="eu2-chip" key={o}>
              {o}
            </span>
          ))}
        </div>
      )}
      <div className="eu2-list">
        {items.map((it) => (
          <div className="eu2-item" key={it.number}>
            <div className="eu2-line1">
              <span className="eu2-idx">{it.number}</span>
              <span>{renderSentence(it)}</span>
            </div>
            {it.zh && <div className="eu2-zh-line eu2-zh">{it.zh}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
