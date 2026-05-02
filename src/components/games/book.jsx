import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';


const API_BASE = 'https://api.fulafu.com/api/words';
const START_LIVES = 3;
const MAX_LIVES = 5;
const BASE_HINTS = 1;
const ROUND_REVEAL_MS = 1100;
const CORRECT_PAUSE_MS = 820;
const WRONG_PAUSE_MS = 1100;
const ROUND_THEMES = ['rose', 'lilac', 'sky', 'peach'];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;

const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const normalizeWords = (payload) => {
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'object' && item.en && item.zh) {
          return {
            en: String(item.en).trim(),
            zh: String(item.zh).trim(),
          };
        }
        return null;
      })
      .filter(Boolean)
      .filter((item) => item.en && item.zh);
  }

  return Object.entries(payload)
    .filter(([en, zh]) => typeof en === 'string' && typeof zh === 'string')
    .map(([en, zh]) => ({ en: en.trim(), zh: zh.trim() }))
    .filter((item) => item.en && item.zh);
};

const normalizeMeaning = (value) =>
  String(value || '')
    .replace(/\s+/g, '')
    .replace(/[“”"'‘’]/g, '')
    .trim();

const splitMeaning = (zh) => {
  const clean = String(zh || '').trim().replace(/\s+/g, '');
  if (!clean) return [''];
  if (clean.length <= 2) return clean.split('');

  const pieceCount = clean.length <= 4 ? 2 : clean.length <= 8 ? 3 : 4;
  const base = Math.floor(clean.length / pieceCount);
  const extra = clean.length % pieceCount;

  const pieces = [];
  let cursor = 0;
  for (let i = 0; i < pieceCount; i += 1) {
    const size = base + (i < extra ? 1 : 0);
    pieces.push(clean.slice(cursor, cursor + size));
    cursor += size;
  }

  return pieces.filter(Boolean);
};

const pickRoundEvent = () => {
  const pool = [
    {
      type: 'peek',
      badge: '偷看一下',
      tip: '这一回我先悄悄帮你亮一个正确碎片。',
    },
    {
      type: 'double',
      badge: '亲亲加倍',
      tip: '这回答对，心动值会多一点点。',
    },
    {
      type: 'calm',
      badge: '慢一点嘛',
      tip: '这回时间会更宽裕，别着急。',
    },
    {
      type: 'bloom',
      badge: '送你小贴士',
      tip: '这回会顺手多送你一个偷看机会。',
    },
    {
      type: 'none',
      badge: '认真一下',
      tip: '这一封就靠你啦，我在旁边看着你。',
    },
  ];

  const weights = [0.22, 0.16, 0.18, 0.16, 0.28];
  const random = Math.random();
  let cursor = 0;

  for (let i = 0; i < pool.length; i += 1) {
    cursor += weights[i];
    if (random <= cursor) return pool[i];
  }

  return pool[pool.length - 1];
};

const sampleDecoyFragments = (words, currentIndex, count) => {
  const pool = [];
  words.forEach((word, index) => {
    if (index === currentIndex) return;
    splitMeaning(word.zh).forEach((fragment) => {
      if (fragment) pool.push(fragment);
    });
  });

  return shuffle(
    [...new Set(pool.filter(Boolean))]
  ).slice(0, count);
};

const buildRound = (words, currentIndex) => {
  const word = words[currentIndex];
  const correctParts = splitMeaning(word.zh).map((text, index) => ({
    id: createId(),
    text,
    isCorrect: true,
    correctIndex: index,
  }));

  const event = pickRoundEvent();
  const decoyCount = clamp(correctParts.length + (Math.random() > 0.55 ? 2 : 3), 2, 5);
  const decoys = sampleDecoyFragments(words, currentIndex, decoyCount).map((text) => ({
    id: createId(),
    text,
    isCorrect: false,
    correctIndex: -1,
  }));

  const pool = shuffle([...correctParts, ...decoys]).map((item, index) => ({
    ...item,
    slotOrder: null,
    seed: (index * 17 + 13) % 23,
  }));

  const baseTime = clamp(16 + correctParts.length * 2, 16, 24);
  const timeLimit = event.type === 'calm' ? baseTime + 4 : baseTime;
  const revealedIds = event.type === 'peek' ? [correctParts[0]?.id].filter(Boolean) : [];

  return {
    id: createId(),
    word,
    pool,
    correctLength: correctParts.length,
    assembledIds: [],
    timeLimit,
    event,
    theme: ROUND_THEMES[currentIndex % ROUND_THEMES.length],
    revealedIds,
    multiplier: event.type === 'double' ? 2 : 1,
  };
};

const getGrade = ({ accuracy, completion }) => {
  if (accuracy === 100 && completion === 100) return 'SSS';
  if (accuracy >= 88 && completion >= 88) return 'S';
  if (accuracy >= 68 && completion >= 70) return 'A';
  return 'B';
};

const getEndingCopy = (grade) => {
  if (grade === 'SSS') {
    return {
      title: '你怎么这么会呀',
      desc: '这一轮甜到不行，亲亲真的要一串一串送给你。',
      note: '今晚的亲亲都归你，抱一下还不够。',
      kisses: 18,
    };
  }

  if (grade === 'S') {
    return {
      title: '今天也好乖',
      desc: '这一轮真的很棒，我已经把好多亲亲偷偷装进你口袋里了。',
      note: '再来一轮的话，我会继续偏心你。',
      kisses: 12,
    };
  }

  if (grade === 'A') {
    return {
      title: '已经很甜啦',
      desc: '今天记得不错，再多练一点点，我就把亲亲翻倍给你。',
      note: '亲亲先预支一点点，剩下的等你来拿。',
      kisses: 7,
    };
  }

  return {
    title: '先记到这里吧',
    desc: '今天没关系呀，再陪我玩一会儿，亲亲我会慢慢补给你。',
    note: '加油一点点，下一轮我想看你更厉害。',
    kisses: 3,
  };
};

const MiniPig = () => (
  <div className="sweet-pig" aria-hidden="true">
    <span className="pig-ear left" />
    <span className="pig-ear right" />
    <span className="pig-eye left" />
    <span className="pig-eye right" />
    <span className="pig-blush left" />
    <span className="pig-blush right" />
    <span className="pig-snout">
      <i />
      <i />
    </span>
  </div>
);

export default function SweetLetterVocabGame() {
  const [date, setDate] = useState(getTodayInputValue());
  const [screen, setScreen] = useState('start');
  const [words, setWords] = useState([]);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hintCount, setHintCount] = useState(BASE_HINTS);
  const [feedback, setFeedback] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const abortRef = useRef(null);
  const timeoutRef = useRef(0);

  const totalWords = words.length;
  const completion = totalWords ? Math.round((answered / totalWords) * 100) : 0;
  const accuracy = answered ? Math.round(((answered - wrongCount) / answered) * 100) : 0;
  const grade = useMemo(() => getGrade({ accuracy, completion }), [accuracy, completion]);
  const endingCopy = useMemo(() => getEndingCopy(grade), [grade]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const updateFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    updateFullscreen();
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) return;

    try {
      const target = document.documentElement;
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  const cleanupTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = 0;
    }
  }, []);

  useEffect(() => () => {
    cleanupTimeout();
    abortRef.current?.abort?.();
  }, [cleanupTimeout]);

  const resetGame = useCallback(() => {
    cleanupTimeout();
    setWords([]);
    setRound(null);
    setScore(0);
    setAnswered(0);
    setWrongCount(0);
    setLives(START_LIVES);
    setCombo(0);
    setMaxCombo(0);
    setHintCount(BASE_HINTS);
    setFeedback(null);
    setRoundLocked(false);
    setTimeLeft(0);
    setErrorMessage('');
  }, [cleanupTimeout]);

  const prepareRound = useCallback(
    (list, index, options = {}) => {
      const nextRound = buildRound(list, index);
      setRound(nextRound);
      setRoundLocked(false);
      setFeedback(options.feedback || null);
      setTimeLeft(nextRound.timeLimit);
      if (nextRound.event.type === 'bloom') {
        setHintCount((prev) => Math.min(prev + 1, 3));
      }
    },
    []
  );

  const finishGame = useCallback(() => {
    cleanupTimeout();
    setRoundLocked(true);
    setScreen('result');
    setFeedback(null);
  }, [cleanupTimeout]);

  const moveToNextRound = useCallback(
    (nextIndex, nextWords) => {
      if (nextIndex >= nextWords.length || lives <= 0) {
        finishGame();
        return;
      }
      prepareRound(nextWords, nextIndex);
    },
    [finishGame, lives, prepareRound]
  );

  const fetchWords = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    resetGame();
    setScreen('loading');

    try {
      await enterFullscreen();
      const response = await fetch(`${API_BASE}?date=${date}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('今天的单词还没拿到，再点一下试试。');
      }

      const data = await response.json();
      if (data?.error) {
        throw new Error(String(data.error));
      }

      const list = shuffle(normalizeWords(data));
      if (!list.length) {
        throw new Error('这一天还没有词呢，换个日期抱抱我。');
      }

      setWords(list);
      setScreen('playing');
      prepareRound(list, 0, {
        feedback: {
          type: 'event',
          title: '第一封小情书来啦',
          desc: '把意思拼好寄给我吧。',
        },
      });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setErrorMessage(error?.message || '加载失败啦。');
      setScreen('error');
    }
  }, [date, enterFullscreen, prepareRound, resetGame]);

  useEffect(() => {
    if (screen !== 'playing' || !round || roundLocked) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setRoundLocked(true);
          setWrongCount((count) => count + 1);
          setAnswered((count) => count + 1);
          setCombo(0);
          setLives((prevLives) => {
            const nextLives = prevLives - 1;

            setFeedback({
              type: 'wrong',
              title: '这一封慢了一点点',
              desc: `正确答案是「${round.word.zh}」`,
            });

            cleanupTimeout();
            timeoutRef.current = window.setTimeout(() => {
              if (nextLives <= 0 || answered + 1 >= words.length) {
                finishGame();
                return;
              }
              prepareRound(words, answered + 1);
            }, WRONG_PAUSE_MS);

            return nextLives;
          });

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    answered,
    cleanupTimeout,
    finishGame,
    prepareRound,
    round,
    roundLocked,
    screen,
    words,
  ]);

  const assembledText = useMemo(() => {
    if (!round) return '';
    const map = new Map(round.pool.map((item) => [item.id, item]));
    return round.assembledIds.map((id) => map.get(id)?.text || '').join('');
  }, [round]);

  const submitCurrent = useCallback(() => {
    if (!round || roundLocked) return;
    if (round.assembledIds.length !== round.correctLength) return;

    setRoundLocked(true);
    const target = normalizeMeaning(round.word.zh);
    const current = normalizeMeaning(assembledText);

    if (current === target) {
      const nextAnswered = answered + 1;
      const nextCombo = combo + 1;
      const gained = 1 * round.multiplier + Math.floor(nextCombo / 3);
      const nextScore = score + gained;
      const bonusHint = nextCombo % 4 === 0 ? 1 : 0;
      const lifeBonus = nextCombo > 0 && nextCombo % 6 === 0 ? 1 : 0;

      setAnswered(nextAnswered);
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setScore(nextScore);
      if (bonusHint) {
        setHintCount((prev) => Math.min(prev + 1, 3));
      }
      if (lifeBonus) {
        setLives((prev) => Math.min(prev + 1, MAX_LIVES));
      }

      setFeedback({
        type: 'correct',
        title: nextCombo >= 2 ? `连上啦 x${nextCombo}` : '拼对啦',
        desc:
          round.multiplier > 1
            ? '这一封有亲亲加倍，我多夸你一下。'
            : bonusHint
            ? '你真乖，我顺手再送你一个偷看机会。'
            : lifeBonus
            ? '太稳啦，我偷偷多塞给你一颗小心心。'
            : '我就知道你可以。',
      });

      cleanupTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (nextAnswered >= words.length) {
          finishGame();
          return;
        }
        prepareRound(words, nextAnswered);
      }, CORRECT_PAUSE_MS);

      return;
    }

    const nextAnswered = answered + 1;
    setAnswered(nextAnswered);
    setWrongCount((prev) => prev + 1);
    setCombo(0);
    setLives((prev) => {
      const nextLives = prev - 1;
      setFeedback({
        type: 'wrong',
        title: '这一封寄歪啦',
        desc: `正确答案是「${round.word.zh}」`,
      });

      cleanupTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (nextLives <= 0 || nextAnswered >= words.length) {
          finishGame();
          return;
        }
        prepareRound(words, nextAnswered);
      }, WRONG_PAUSE_MS);

      return nextLives;
    });
  }, [
    answered,
    assembledText,
    cleanupTimeout,
    combo,
    finishGame,
    round,
    roundLocked,
    score,
    words,
    prepareRound,
  ]);

  const pickFragment = useCallback(
    (fragmentId) => {
      if (!round || roundLocked) return;
      const fragment = round.pool.find((item) => item.id === fragmentId);
      if (!fragment) return;
      if (round.assembledIds.includes(fragmentId)) return;
      if (round.assembledIds.length >= round.correctLength) return;

      setRound((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assembledIds: [...prev.assembledIds, fragmentId],
        };
      });
    },
    [round, roundLocked]
  );

  const removeFromSlot = useCallback(
    (index) => {
      if (!round || roundLocked) return;
      setRound((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assembledIds: prev.assembledIds.filter((_, slotIndex) => slotIndex !== index),
        };
      });
    },
    [round, roundLocked]
  );

  const clearAssembled = useCallback(() => {
    if (!round || roundLocked) return;
    setRound((prev) => (prev ? { ...prev, assembledIds: [] } : prev));
  }, [round, roundLocked]);

  const useHint = useCallback(() => {
    if (!round || roundLocked || hintCount <= 0) return;

    const alreadyRevealed = new Set(round.revealedIds);
    const remainingCorrect = round.pool.find(
      (item) => item.isCorrect && !alreadyRevealed.has(item.id)
    );

    if (!remainingCorrect) return;

    setHintCount((prev) => Math.max(prev - 1, 0));
    setRound((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        revealedIds: [...prev.revealedIds, remainingCorrect.id],
      };
    });
  }, [hintCount, round, roundLocked]);

  const exitToStart = useCallback(() => {
    resetGame();
    setScreen('start');
  }, [resetGame]);

  const displayedProgress = totalWords ? answered + (screen === 'playing' ? 1 : 0) : 0;

  if (screen === 'start') {
    return (
      <div className="sweet-game-shell start-scene">
        <div className="scene-glow glow-a" />
        <div className="scene-glow glow-b" />
        <div className="floating-kiss fk-1">💋</div>
        <div className="floating-kiss fk-2">💋</div>
        <div className="floating-kiss fk-3">💋</div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-a" />
          <div className="hero-orbit orbit-b" />
          <div className="hero-heart heart-a">♥</div>
          <div className="hero-heart heart-b">♥</div>
          <MiniPig />
        </div>

        <div className="hero-copy">
          <div className="hero-chip">今晚想和你玩甜甜的一局</div>
          <h1>心动情书局</h1>
          <p>
            不是点对错，是把意思一点点拼进小情书里。
            每一轮都会变，像我每次看见你时的心动一样。
          </p>
        </div>

        <div className="bottom-sheet start-sheet">
          <label className="sheet-label" htmlFor="sweet-date">
            想练哪一天
          </label>
          <input
            id="sweet-date"
            className="sweet-date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button type="button" className="primary-cta" onClick={fetchWords}>
            开始甜甜的一局
          </button>

          <p className="sheet-tip">
            开始后会尽量自动铺满屏幕，词片点一下就能放进信里。
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'loading') {
    return (
      <div className="sweet-game-shell loading-scene">
        <div className="scene-glow glow-a" />
        <div className="scene-glow glow-b" />
        <div className="loading-flower">
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="loading-text">我在把今天的小情书准备好…</p>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="sweet-game-shell error-scene">
        <div className="bottom-sheet error-sheet">
          <div className="error-icon">?</div>
          <h2>这一封没拿到</h2>
          <p>{errorMessage}</p>
          <div className="sheet-actions">
            <button type="button" className="secondary-cta" onClick={exitToStart}>
              换一下
            </button>
            <button type="button" className="primary-cta" onClick={fetchWords}>
              再试试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    return (
      <div className={`sweet-game-shell result-scene grade-${grade.toLowerCase()}`}>
        <div className="scene-glow glow-a" />
        <div className="scene-glow glow-b" />
        <div className="result-kiss-field" aria-hidden="true">
          {Array.from({ length: endingCopy.kisses }).map((_, index) => (
            <span
              key={index}
              className="result-kiss"
              style={{
                '--rx': `${(index % 6) * 14 - 35}px`,
                '--ry': `${Math.floor(index / 6) * 16 - 24}px`,
                '--rd': `${(index % 5) * 0.12}s`,
              }}
            >
              💋
            </span>
          ))}
        </div>

        <div className="result-stage">
          <div className="result-badge-wrap">
            <div className="result-badge-ring" />
            <div className="result-badge">{grade}</div>
          </div>

          <div className="result-copy">
            <h2>{endingCopy.title}</h2>
            <p>{endingCopy.desc}</p>
            <span>{endingCopy.note}</span>
          </div>

          <div className="result-ribbons">
            <div className="result-ribbon wide">
              <em>正确率</em>
              <strong>{accuracy}%</strong>
            </div>
            <div className="result-ribbon">
              <em>完成率</em>
              <strong>{completion}%</strong>
            </div>
            <div className="result-ribbon">
              <em>答对</em>
              <strong>
                {answered - wrongCount}/{totalWords || 0}
              </strong>
            </div>
            <div className="result-ribbon">
              <em>最高连上</em>
              <strong>{maxCombo}</strong>
            </div>
            <div className="result-ribbon wide">
              <em>心动值</em>
              <strong>{score}</strong>
            </div>
          </div>

          <div className="result-actions">
            <button type="button" className="secondary-cta" onClick={exitToStart}>
              换一天
            </button>
            <button type="button" className="primary-cta" onClick={fetchWords}>
              再陪我玩一轮
            </button>
          </div>
        </div>
      </div>
    );
  }

  const assembledMap = new Map(round?.pool.map((item) => [item.id, item]) || []);

  return (
    <div className={`sweet-game-shell play-scene theme-${round?.theme || 'rose'}`}>
      <div className="scene-glow glow-a" />
      <div className="scene-glow glow-b" />
      <div className="play-topline">
        <div className="topline-left">
          <div className="topline-label">第 {displayedProgress}/{totalWords} 封小情书</div>
          <div className="topline-progress">
            <span style={{ width: `${totalWords ? (answered / totalWords) * 100 : 0}%` }} />
          </div>
        </div>
        <button type="button" className="tiny-ghost" onClick={exitToStart}>
          退出
        </button>
      </div>

      <div className="play-ribbon">
        <div className="ribbon-metric">
          <small>心动值</small>
          <strong>{score}</strong>
        </div>
        <div className="ribbon-metric emphasis">
          <small>连上</small>
          <strong>{combo}</strong>
        </div>
        <div className="life-row" aria-label="生命">
          {Array.from({ length: MAX_LIVES }).map((_, index) => (
            <span key={index} className={`life-heart ${index < lives ? 'alive' : ''}`}>
              ♥
            </span>
          ))}
        </div>
        <div className="ribbon-metric timer">
          <small>剩余</small>
          <strong>{timeLeft}s</strong>
        </div>
      </div>

      <div className="letter-stage-shell">
        <div className="letter-card">
          <div className="letter-stamp">💌</div>
          <div className="event-badge">{round?.event.badge}</div>
          <div className="letter-caption">把这个词拼进给我的小情书里</div>
          <div className="letter-word">{round?.word.en}</div>
          <div className="letter-tip">{round?.event.tip}</div>

          <div className="assemble-slots">
            {Array.from({ length: round?.correctLength || 0 }).map((_, index) => {
              const filledId = round?.assembledIds[index];
              const item = filledId ? assembledMap.get(filledId) : null;
              return (
                <button
                  key={index}
                  type="button"
                  className={`assemble-slot ${item ? 'filled' : ''}`}
                  onClick={() => removeFromSlot(index)}
                >
                  <span>{item?.text || '·'}</span>
                </button>
              );
            })}
          </div>

          <div className="letter-actions">
            <button
              type="button"
              className="soft-ghost"
              onClick={useHint}
              disabled={hintCount <= 0 || roundLocked}
            >
              偷看一下 ({hintCount})
            </button>
            <button
              type="button"
              className="soft-ghost"
              onClick={clearAssembled}
              disabled={!round?.assembledIds.length || roundLocked}
            >
              清空
            </button>
            <button
              type="button"
              className="send-cta"
              onClick={submitCurrent}
              disabled={round?.assembledIds.length !== round?.correctLength || roundLocked}
            >
              寄出去
            </button>
          </div>
        </div>
      </div>

      <div className="fragment-garden">
        {(round?.pool || []).map((fragment) => {
          const selected = round?.assembledIds.includes(fragment.id);
          const revealed = round?.revealedIds.includes(fragment.id);
          return (
            <button
              key={fragment.id}
              type="button"
              className={`fragment-chip ${selected ? 'selected' : ''} ${
                revealed ? 'revealed' : ''
              } ${fragment.isCorrect ? 'frag-correct' : 'frag-decoy'}`}
              style={{ '--seed': fragment.seed }}
              onClick={() => pickFragment(fragment.id)}
              disabled={selected || roundLocked}
            >
              <span>{fragment.text}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-pop feedback-${feedback.type}`} key={feedback.title + feedback.desc}>
          <div className="feedback-badge">
            {feedback.type === 'correct' ? '💋' : feedback.type === 'wrong' ? '☁' : '✨'}
          </div>
          <div className="feedback-copy">
            <strong>{feedback.title}</strong>
            <span>{feedback.desc}</span>
          </div>
        </div>
      )}

      {!isFullscreen && <div className="immersive-tip">已经尽量铺满啦，横屏会更开阔一点。</div>}
    </div>
  );
}
