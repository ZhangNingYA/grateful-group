/**
 * Unit3Review.jsx
 *
 * 商务英语 Unit 3 复习交互组件集合。
 * 设计语言：治愈、温暖、以文字为中心（与 Unit 1/2 保持一致）。
 *   - 奶油米色背景 + 暖棕墨色文字 + 衬线字体
 *   - PageStyles        注入全局样式
 *   - VocabularyCards   词汇卡片（点击翻转显示中文释义）—— 唯一的交互项
 *   - TranslationList   Task 1 中英互译（原文 + 译文，文本排版）
 *   - FillBlankList     选词填空（答案柔和下划线 + 中文译文，支持单空 / 多空）
 *
 * 在 MDX 中这样使用：
 *   import { PageStyles, VocabularyCards, TranslationList, FillBlankList } from '../../components/english/Unit3Review.jsx';
 */

import React, { useState } from 'react';

/* ============================================================
 * 全局样式注入（温暖治愈的奶油色主题）
 * ============================================================ */
export function PageStyles() {
  return (
    <style>{`
      :root {
        --eu3-ink: #4a3f35;          /* 暖棕墨色，主文字 */
        --eu3-ink-soft: #7a6b5d;     /* 次级文字 */
        --eu3-ink-faint: #a89888;    /* 辅助文字 */
        --eu3-cream: #fbf6ee;        /* 奶油底 */
        --eu3-cream-2: #f5ede1;      /* 略深奶油 */
        --eu3-paper: #fffdf9;        /* 卡片纸面 */
        --eu3-line: #ece2d3;         /* 柔和分隔线 */
        --eu3-terra: #c97b5a;        /* 陶土橙，强调 */
        --eu3-terra-soft: #f6e4da;
        --eu3-sage: #8a9a7b;         /* 鼠尾草绿，次强调 */
        --eu3-sage-soft: #e8ede1;
        --eu3-honey: #d9a441;        /* 蜂蜜金，答案高亮 */
      }

      .eu3 {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--eu3-ink);
        line-height: 1.85;
      }
      .eu3-zh {
        font-family: "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
      }

      /* ---------- 词汇卡片 ---------- */
      .eu3-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }
      .eu3-flip { perspective: 1100px; height: 104px; cursor: pointer; }
      .eu3-flip-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.55s cubic-bezier(.25,.8,.25,1);
        transform-style: preserve-3d;
      }
      .eu3-flip.flipped .eu3-flip-inner { transform: rotateY(180deg); }
      .eu3-face {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; gap: 5px;
        align-items: center; justify-content: center;
        text-align: center; padding: 12px;
        border-radius: 18px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
        box-sizing: border-box;
      }
      .eu3-face-front {
        background: var(--eu3-paper);
        border: 1px solid var(--eu3-line);
        color: var(--eu3-ink);
        font-weight: 600; font-size: 16px; letter-spacing: 0.2px;
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eu3-face-front small {
        color: var(--eu3-ink-faint); font-size: 10px; font-weight: 400;
        letter-spacing: 0.5px; font-style: italic;
      }
      .eu3-face-back {
        background: var(--eu3-terra-soft);
        border: 1px solid var(--eu3-terra);
        color: #a8542f; transform: rotateY(180deg);
        font-size: 15px; font-weight: 600; line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eu3-flip:hover .eu3-face-front { box-shadow: 0 6px 16px rgba(201,123,90,0.14); }

      .eu3-toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
      .eu3-btn {
        background: var(--eu3-terra);
        border: none; color: #fff;
        padding: 9px 18px; border-radius: 22px;
        font-size: 14px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        box-shadow: 0 3px 10px rgba(201,123,90,0.25);
        transition: transform 0.14s, box-shadow 0.14s;
      }
      .eu3-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(201,123,90,0.34); }
      .eu3-hint { color: var(--eu3-ink-soft); font-size: 14px; font-style: italic; }

      /* ---------- 列表通用（翻译题、填空题） ---------- */
      .eu3-list { margin: 24px 0; }
      .eu3-item {
        padding: 16px 4px 16px 0;
        border-bottom: 1px solid var(--eu3-line);
      }
      .eu3-item:last-child { border-bottom: none; }
      .eu3-line1 {
        display: flex; align-items: baseline; gap: 12px;
        font-size: 17px;
      }
      .eu3-idx {
        flex: none;
        color: var(--eu3-terra); font-weight: 700;
        font-size: 15px; min-width: 22px;
      }
      .eu3-zh-line {
        margin: 5px 0 0 34px;
        color: var(--eu3-ink-soft);
        font-size: 15px;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }

      /* ---------- 翻译题 ---------- */
      .eu3-src { color: var(--eu3-ink); }
      .eu3-src.eu3-zh { font-weight: 600; }
      .eu3-trans {
        margin: 5px 0 0 34px;
        font-size: 16px;
        color: #a8542f;
        font-weight: 600;
      }
      .eu3-trans .eu3-arrow { color: var(--eu3-ink-faint); font-weight: 400; margin-right: 8px; }

      /* ---------- 填空题（答案柔和高亮 + 中文译文） ---------- */
      .eu3-sent { font-size: 17px; color: var(--eu3-ink); }
      .eu3-answer {
        font-weight: 700;
        color: #a8542f;
        border-bottom: 2px solid var(--eu3-honey);
        padding: 0 1px;
        white-space: nowrap;
      }

      /* ---------- 词库 ---------- */
      .eu3-options-box {
        display: flex; flex-wrap: wrap; gap: 9px;
        padding: 16px 18px; margin: 18px 0;
        border-radius: 16px;
        background: var(--eu3-sage-soft);
        border: 1px solid rgba(138,154,123,0.25);
      }
      .eu3-options-label {
        width: 100%; color: var(--eu3-sage); font-weight: 700;
        font-size: 13px; letter-spacing: 1px; margin-bottom: 2px;
        text-transform: uppercase;
      }
      .eu3-chip {
        background: var(--eu3-paper);
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
    <div className="eu3">
      <div className="eu3-toolbar">
        <button className="eu3-btn" onClick={flipAll}>
          {allFlipped ? '↩ 显示单词' : '显示释义'}
        </button>
        <span className="eu3-hint">轻点卡片，翻看中文释义</span>
      </div>
      <div className="eu3-grid">
        {words.map((w, i) => (
          <div
            key={i}
            className={`eu3-flip${flipped[i] ? ' flipped' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="eu3-flip-inner">
              <div className="eu3-face eu3-face-front">
                {w.word}
                <small>tap</small>
              </div>
              <div className="eu3-face eu3-face-back">{w.meaning}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * 中英互译（原文 + 译文，文本排版）
 *   每个 item：{ number, item（原文）, answer（译文） }
 * ============================================================ */
export function TranslationList({ items = [] }) {
  const isChinese = (text) => /[\u4e00-\u9fa5]/.test(text || '');

  return (
    <div className="eu3">
      <div className="eu3-list">
        {items.map((it) => {
          const srcIsZh = isChinese(it.item);
          return (
            <div className="eu3-item" key={it.number}>
              <div className="eu3-line1">
                <span className="eu3-idx">{it.number}</span>
                <span className={`eu3-src${srcIsZh ? ' eu3-zh' : ''}`}>
                  {it.item}
                </span>
              </div>
              <div className={`eu3-trans${!srcIsZh ? ' eu3-zh' : ''}`}>
                <span className="eu3-arrow">↳</span>
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
 *   单空：{ number, sentence, answer, zh }
 *   多空：{ number, sentence, answers: [...], zh }  —— 句中每个 ____ 依次填入
 * ============================================================ */
export function FillBlankList({ items = [], options = null }) {
  const renderSentence = (it) => {
    const parts = it.sentence.split(/_{2,}/);
    const answers = it.answers || [it.answer];
    return (
      <span className="eu3-sent">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && (
              <span className="eu3-answer">
                {answers[idx] != null ? answers[idx] : '…'}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="eu3">
      {options && (
        <div className="eu3-options-box">
          <span className="eu3-options-label">Word Bank · 词库</span>
          {options.map((o) => (
            <span className="eu3-chip" key={o}>
              {o}
            </span>
          ))}
        </div>
      )}
      <div className="eu3-list">
        {items.map((it) => (
          <div className="eu3-item" key={it.number}>
            <div className="eu3-line1">
              <span className="eu3-idx">{it.number}</span>
              <span>{renderSentence(it)}</span>
            </div>
            {it.zh && <div className="eu3-zh-line eu3-zh">{it.zh}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
