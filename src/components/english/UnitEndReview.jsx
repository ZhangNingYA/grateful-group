/**
 * UnitEndReview.jsx
 *
 * 商务英语「单元结语 / 拓展」复习组件集合。
 * 设计语言：治愈、温暖、以文字为中心（与 Unit 1-5 保持一致）。
 *   - 奶油米色背景 + 暖棕墨色文字 + 衬线字体
 *   - PageStyles        注入全局样式
 *   - Passage           段落短文（逐句英中对照）
 *   - VocabularyCards   关键术语卡片（三种模式 + 打乱顺序）
 *       · flip    翻卡模式：默认只显示术语，点击翻转看释义
 *       · both    全部显示：术语 + 释义同时显示
 *       · meaning 仅释义：直接显示中文释义
 *
 * 在 MDX 中这样使用：
 *   import { PageStyles, Passage, VocabularyCards } from '../../components/english/UnitEndReview.jsx';
 */

import React, { useMemo, useState } from 'react';

/* shuffle 工具：Fisher–Yates，返回打乱后的索引数组 */
function shuffleArray(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}


/* ============================================================
 * 全局样式注入（温暖治愈的奶油色主题）
 * ============================================================ */
export function PageStyles() {
  return (
    <style>{`
      :root {
        --eue-ink: #4a3f35;          /* 暖棕墨色，主文字 */
        --eue-ink-soft: #7a6b5d;     /* 次级文字 */
        --eue-ink-faint: #a89888;    /* 辅助文字 */
        --eue-cream: #fbf6ee;        /* 奶油底 */
        --eue-cream-2: #f5ede1;      /* 略深奶油 */
        --eue-paper: #fffdf9;        /* 卡片纸面 */
        --eue-line: #ece2d3;         /* 柔和分隔线 */
        --eue-terra: #c97b5a;        /* 陶土橙，强调 */
        --eue-terra-soft: #f6e4da;
        --eue-sage: #8a9a7b;         /* 鼠尾草绿，次强调 */
        --eue-sage-soft: #e8ede1;
        --eue-honey: #d9a441;        /* 蜂蜜金 */
      }

      .eue {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--eue-ink);
        line-height: 1.85;
      }
      .eue-zh {
        font-family: "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
      }

      /* ---------- 段落短文（逐句对照） ---------- */
      .eue-passage {
        margin: 24px 0;
        padding: 28px 30px;
        border-radius: 18px;
        background: var(--eue-paper);
        border: 1px solid var(--eue-line);
        border-left: 5px solid var(--eue-terra);
        box-shadow: 0 3px 12px rgba(201,123,90,0.07);
      }
      .eue-sentence {
        padding: 16px 0;
        border-bottom: 1px dashed var(--eue-line);
      }
      .eue-sentence:first-child { padding-top: 0; }
      .eue-sentence:last-child { padding-bottom: 0; border-bottom: none; }
      .eue-sentence-row {
        display: flex; align-items: baseline; gap: 12px;
      }
      .eue-sentence-idx {
        flex: none;
        color: var(--eue-terra); font-weight: 700;
        font-size: 17px; min-width: 24px;
      }
      .eue-sentence-en {
        font-size: 20px;
        line-height: 1.7;
        color: var(--eue-ink);
      }
      .eue-sentence-zh {
        margin: 8px 0 0 36px;
        font-size: 18px;
        line-height: 1.7;
        color: var(--eue-ink-soft);
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eue-sentence-zh .eue-arrow { color: var(--eue-ink-faint); margin-right: 8px; }
      .eue-sentence-zh-hidden .eue-reveal-hint {
        color: var(--eue-ink-faint); font-size: 14px; font-style: italic;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }



      /* ---------- 词汇卡片 ---------- */
      .eue-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
        margin: 24px 0;
      }

      /* 翻卡模式：3D 翻转 */
      .eue-flip { perspective: 1100px; height: 104px; cursor: pointer; }
      .eue-flip-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.55s cubic-bezier(.25,.8,.25,1);
        transform-style: preserve-3d;
      }
      .eue-flip.flipped .eue-flip-inner { transform: rotateY(180deg); }
      .eue-face {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; gap: 5px;
        align-items: center; justify-content: center;
        text-align: center; padding: 12px;
        border-radius: 18px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
        box-sizing: border-box;
      }
      .eue-face-front {
        background: var(--eue-paper);
        border: 1px solid var(--eue-line);
        color: var(--eue-ink);
        font-weight: 600; font-size: 15px; letter-spacing: 0.2px;
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eue-face-front small {
        color: var(--eue-ink-faint); font-size: 10px; font-weight: 400;
        letter-spacing: 0.5px; font-style: italic;
      }
      .eue-face-back {
        background: var(--eue-terra-soft);
        border: 1px solid var(--eue-terra);
        color: #a8542f; transform: rotateY(180deg);
        font-size: 15px; font-weight: 600; line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eue-flip:hover .eue-face-front { box-shadow: 0 6px 16px rgba(201,123,90,0.14); }

      /* 静态卡片（全部显示 / 仅释义） */
      .eue-static {
        min-height: 104px;
        display: flex; flex-direction: column; gap: 6px;
        align-items: center; justify-content: center;
        text-align: center; padding: 14px 12px;
        border-radius: 18px;
        box-sizing: border-box;
        background: var(--eue-paper);
        border: 1px solid var(--eue-line);
        box-shadow: 0 3px 10px rgba(201,123,90,0.07);
      }
      .eue-static .eue-word {
        font-weight: 600; font-size: 15px; color: var(--eue-ink);
        letter-spacing: 0.2px;
      }
      .eue-static .eue-meaning {
        font-size: 15px; font-weight: 600; color: #a8542f;
        line-height: 1.5;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }
      .eue-static .eue-divider {
        width: 28px; border: none; border-top: 1px solid var(--eue-line);
        margin: 2px 0;
      }
      .eue-static.eue-static-meaning {
        background: var(--eue-terra-soft);
        border-color: var(--eue-terra);
      }

      /* ---------- 工具栏 ---------- */
      .eue-toolbar {
        display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0;
        align-items: center;
      }
      .eue-modes {
        display: inline-flex; padding: 3px; gap: 3px;
        background: var(--eue-cream-2);
        border: 1px solid var(--eue-line);
        border-radius: 22px;
      }
      .eue-mode-btn {
        background: transparent;
        border: none; color: var(--eue-ink-soft);
        padding: 7px 15px; border-radius: 18px;
        font-size: 13px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        transition: all 0.16s;
      }
      .eue-mode-btn.active {
        background: var(--eue-terra); color: #fff;
        box-shadow: 0 2px 8px rgba(201,123,90,0.28);
      }
      .eue-btn {
        background: var(--eue-sage);
        border: none; color: #fff;
        padding: 8px 16px; border-radius: 20px;
        font-size: 13px; cursor: pointer; font-weight: 600;
        font-family: "Georgia", "PingFang SC", serif;
        box-shadow: 0 3px 10px rgba(138,154,123,0.28);
        transition: transform 0.14s, box-shadow 0.14s;
      }
      .eue-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(138,154,123,0.38); }
      .eue-hint { color: var(--eue-ink-soft); font-size: 13px; font-style: italic; }
    `}</style>
  );
}

/* ============================================================
 * 段落短文（逐句英中对照）
 *   props: { sentences: [{ en, zh }, ...] }
 *   两种模式：
 *     all   全部显示译文（默认）
 *     click 点击显示译文：先只看英文，点句子逐句揭晓中文
 *   外加「打乱顺序 / 恢复顺序」功能。
 * ============================================================ */
export function Passage({ sentences = [] }) {
  const [mode, setMode] = useState('all'); // all | click
  const [revealed, setRevealed] = useState({});
  const [order, setOrder] = useState(() => sentences.map((_, i) => i));
  const [shuffled, setShuffled] = useState(false);

  const orderedSentences = useMemo(
    () => order.map((idx) => ({ ...sentences[idx], _key: idx })),
    [order, sentences]
  );

  const toggleReveal = (key) => {
    if (mode !== 'click') return;
    setRevealed((s) => ({ ...s, [key]: !s[key] }));
  };

  const shuffle = () => {
    setOrder(shuffleArray(order));
    setShuffled(true);
    setRevealed({});
  };

  const reset = () => {
    setOrder(sentences.map((_, i) => i));
    setShuffled(false);
    setRevealed({});
  };

  const modes = [
    { id: 'all', label: '全部显示译文' },
    { id: 'click', label: '点击显示译文' },
  ];

  return (
    <div className="eue">
      <div className="eue-toolbar">
        <div className="eue-modes">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`eue-mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => {
                setMode(m.id);
                setRevealed({});
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button className="eue-btn" onClick={shuffle}>🔀 打乱顺序</button>
        {shuffled && (
          <button className="eue-btn" onClick={reset}>↩ 恢复顺序</button>
        )}
        <span className="eue-hint">
          {mode === 'all' ? '英文与中文译文同时显示' : '先读英文，点句子逐句揭晓中文'}
        </span>
      </div>

      <div className="eue-passage">
        {orderedSentences.map((s, i) => {
          const showZh = mode === 'all' || revealed[s._key];
          return (
            <div
              className="eue-sentence"
              key={s._key}
              onClick={() => toggleReveal(s._key)}
              style={mode === 'click' ? { cursor: 'pointer' } : undefined}
            >
              <div className="eue-sentence-row">
                <span className="eue-sentence-idx">{i + 1}</span>
                <span className="eue-sentence-en">{s.en}</span>
              </div>
              {s.zh && showZh && (
                <div className="eue-sentence-zh">
                  <span className="eue-arrow">↳</span>
                  {s.zh}
                </div>
              )}
              {s.zh && !showZh && (
                <div className="eue-sentence-zh eue-sentence-zh-hidden">
                  <span className="eue-arrow">↳</span>
                  <span className="eue-reveal-hint">点击显示译文</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



/* ============================================================
 * 关键术语卡片
 *   三种模式：
 *     flip    翻卡（默认）：只显示术语，点击翻转看释义
 *     both    全部显示：术语 + 释义同框
 *     meaning 仅释义：直接显示中文释义
 *   外加「打乱顺序 / 恢复顺序」功能。
 * ============================================================ */
export function VocabularyCards({ words = [] }) {
  const [mode, setMode] = useState('flip'); // flip | both | meaning
  const [flipped, setFlipped] = useState({});
  const [order, setOrder] = useState(() => words.map((_, i) => i));
  const [shuffled, setShuffled] = useState(false);

  const orderedWords = useMemo(
    () => order.map((idx) => ({ ...words[idx], _key: idx })),
    [order, words]
  );

  const toggle = (key) => {
    if (mode !== 'flip') return;
    setFlipped((s) => ({ ...s, [key]: !s[key] }));
  };

  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setShuffled(true);
    setFlipped({});
  };

  const reset = () => {
    setOrder(words.map((_, i) => i));
    setShuffled(false);
    setFlipped({});
  };

  const modes = [
    { id: 'flip', label: '翻卡' },
    { id: 'both', label: '全部显示' },
    { id: 'meaning', label: '仅释义' },
  ];

  return (
    <div className="eue">
      <div className="eue-toolbar">
        <div className="eue-modes">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`eue-mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => {
                setMode(m.id);
                setFlipped({});
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button className="eue-btn" onClick={shuffle}>🔀 打乱顺序</button>
        {shuffled && (
          <button className="eue-btn" onClick={reset}>↩ 恢复顺序</button>
        )}
        <span className="eue-hint">
          {mode === 'flip' ? '轻点卡片，翻看中文释义' : mode === 'both' ? '术语与释义同时显示' : '只显示中文释义，自测英文'}
        </span>
      </div>

      <div className="eue-grid">
        {orderedWords.map((w) => {
          if (mode === 'flip') {
            return (
              <div
                key={w._key}
                className={`eue-flip${flipped[w._key] ? ' flipped' : ''}`}
                onClick={() => toggle(w._key)}
              >
                <div className="eue-flip-inner">
                  <div className="eue-face eue-face-front">
                    {w.word}
                    <small>tap</small>
                  </div>
                  <div className="eue-face eue-face-back">{w.meaning}</div>
                </div>
              </div>
            );
          }
          if (mode === 'both') {
            return (
              <div key={w._key} className="eue-static">
                <span className="eue-word">{w.word}</span>
                <hr className="eue-divider" />
                <span className="eue-meaning">{w.meaning}</span>
              </div>
            );
          }
          // meaning
          return (
            <div key={w._key} className="eue-static eue-static-meaning">
              <span className="eue-meaning">{w.meaning}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
