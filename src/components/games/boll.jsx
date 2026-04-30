import React, { useCallback, useEffect, useRef, useState } from 'react';


const MAX_LIVES = 3;
const FALL_SPEED = 260; // px/s
const HIT_PAUSE_MS = 720;

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
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const isOverlap = (ax, ay, aw, ah, bx, by, bw, bh) => {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
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
    .map(([en, zh]) => ({
      en: en.trim(),
      zh: zh.trim(),
    }))
    .filter((item) => item.en && item.zh);
};

export default function PiggyVocabGame() {
  const [date, setDate] = useState(getTodayInputValue());
  const [gameState, setGameState] = useState('start'); // start loading playing result error
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [, forceRender] = useState(0);

  const containerRef = useRef(null);

  const wordsRef = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const currentIndexRef = useRef(0);
  const gameStateRef = useRef(gameState);

  const engineRef = useRef({
    pigX: null,
    items: [],
    status: 'idle', // idle running paused done
    feedback: null,
    rafId: 0,
    timeoutId: 0,
    lastTs: 0,
    layout: {
      width: 360,
      height: 560,
      pigSize: 62,
      itemSize: 74,
      pigY: 0,
    },
  });

  const rerender = useCallback(() => {
    forceRender((n) => (n + 1) % 1000000);
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const cleanupEngine = useCallback(() => {
    const engine = engineRef.current;
    if (engine.rafId) {
      cancelAnimationFrame(engine.rafId);
      engine.rafId = 0;
    }
    if (engine.timeoutId) {
      clearTimeout(engine.timeoutId);
      engine.timeoutId = 0;
    }
    engine.lastTs = 0;
  }, []);

  const syncLayout = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 360;
    const height = rect.height || 560;

    const pigSize = clamp(width * 0.16, 54, 76);
    const itemSize = clamp(width * 0.22, 58, 88);
    const pigY = height - pigSize - 18;

    engine.layout = {
      width,
      height,
      pigSize,
      itemSize,
      pigY,
    };

    if (typeof engine.pigX !== 'number') {
      engine.pigX = (width - pigSize) / 2;
    } else {
      engine.pigX = clamp(engine.pigX, 8, width - pigSize - 8);
    }

    rerender();
  }, [rerender]);

  const spawnItems = useCallback(
    (wordIndex, wordList = wordsRef.current) => {
      const engine = engineRef.current;
      const currentWord = wordList[wordIndex];

      if (!currentWord || !containerRef.current) return;

      const { width, height, itemSize } = engine.layout;

      const pool = [];
      const seenZh = new Set([currentWord.zh]);

      for (const word of shuffle(wordList.filter((_, idx) => idx !== wordIndex))) {
        if (!seenZh.has(word.zh)) {
          seenZh.add(word.zh);
          pool.push(word);
        }
        if (pool.length >= 2) break;
      }

      const options = shuffle([
        { text: currentWord.zh, isCorrect: true },
        ...pool.map((item) => ({ text: item.zh, isCorrect: false })),
      ]);

      const count = Math.max(options.length, 1);
      const padding = 12;
      const slotWidth = (width - padding * 2) / count;
      const size = Math.min(itemSize, slotWidth - 8);

      engine.items = options.map((option, index) => ({
        id: createId(),
        text: option.text,
        isCorrect: option.isCorrect,
        size,
        x: padding + slotWidth * index + (slotWidth - size) / 2,
        y: -(size + Math.random() * (height * 0.14 + 20)),
      }));

      engine.feedback = null;
      rerender();
    },
    [rerender]
  );

  const finishGame = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'done';
    engine.items = [];
    engine.feedback = null;
    cleanupEngine();
    setGameState('result');
    rerender();
  }, [cleanupEngine, rerender]);

  const resolveHit = useCallback(
    (hitItem) => {
      const engine = engineRef.current;
      if (engine.status !== 'running') return;

      engine.status = 'paused';
      engine.items = [hitItem];

      if (hitItem.isCorrect) {
        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        setScore(nextScore);

        engine.feedback = {
          type: 'correct',
          text: '答对了 +1',
        };
      } else {
        const nextLives = livesRef.current - 1;
        livesRef.current = nextLives;
        setLives(nextLives);

        engine.feedback = {
          type: 'wrong',
          text: '答错了 -1 生命',
        };
      }

      rerender();

      if (engine.timeoutId) clearTimeout(engine.timeoutId);

      engine.timeoutId = window.setTimeout(() => {
        if (hitItem.isCorrect) {
          const nextIndex = currentIndexRef.current + 1;

          if (nextIndex >= wordsRef.current.length) {
            finishGame();
            return;
          }

          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);

          engine.status = 'running';
          engine.feedback = null;
          spawnItems(nextIndex, wordsRef.current);
          return;
        }

        if (livesRef.current <= 0) {
          finishGame();
          return;
        }

        engine.status = 'running';
        engine.feedback = null;
        spawnItems(currentIndexRef.current, wordsRef.current);
      }, HIT_PAUSE_MS);
    },
    [finishGame, spawnItems, rerender]
  );

  const gameLoop = useCallback(
    (timestamp) => {
      const engine = engineRef.current;

      if (gameStateRef.current !== 'playing') return;

      if (!containerRef.current) {
        engine.rafId = requestAnimationFrame(gameLoop);
        return;
      }

      if (!engine.lastTs) engine.lastTs = timestamp;
      const delta = Math.min(32, timestamp - engine.lastTs || 16);
      engine.lastTs = timestamp;

      if (engine.status === 'running') {
        const moveY = (FALL_SPEED * delta) / 1000;
        const { height, pigSize, pigY } = engine.layout;

        let allPassed = engine.items.length > 0;
        let hitItem = null;

        for (const item of engine.items) {
          item.y += moveY;

          if (item.y < height + item.size) {
            allPassed = false;
          }

          const hit = isOverlap(
            item.x,
            item.y,
            item.size,
            item.size,
            engine.pigX,
            pigY,
            pigSize,
            pigSize
          );

          if (hit) {
            hitItem = item;
            break;
          }
        }

        if (hitItem) {
          resolveHit(hitItem);
        } else if (allPassed || engine.items.length === 0) {
          spawnItems(currentIndexRef.current, wordsRef.current);
        }
      }

      rerender();
      engine.rafId = requestAnimationFrame(gameLoop);
    },
    [resolveHit, rerender, spawnItems]
  );

  const handlePointer = useCallback(
    (clientX) => {
      const engine = engineRef.current;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { pigSize } = engine.layout;

      const x = clamp(clientX - rect.left - pigSize / 2, 8, rect.width - pigSize - 8);
      engine.pigX = x;
      rerender();
    },
    [rerender]
  );

  const resetRoundState = useCallback(() => {
    const engine = engineRef.current;
    engine.items = [];
    engine.feedback = null;
    engine.status = 'idle';
    engine.pigX = null;
    engine.lastTs = 0;

    scoreRef.current = 0;
    livesRef.current = MAX_LIVES;
    currentIndexRef.current = 0;

    setScore(0);
    setLives(MAX_LIVES);
    setCurrentIndex(0);
  }, []);

  const fetchWords = useCallback(
    async (selectedDate) => {
      cleanupEngine();
      resetRoundState();
      setErrorMessage('');
      setGameState('loading');

      try {
        const response = await fetch(
          `https://api.fulafu.com/api/words?date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error('网络请求失败，请检查接口或网络状态。');
        }

        const data = await response.json();

        if (data?.error) {
          throw new Error(String(data.error));
        }

        const list = shuffle(normalizeWords(data));

        if (list.length === 0) {
          throw new Error('这一天没有可用单词数据，请换个日期试试。');
        }

        wordsRef.current = list;
        setWords(list);

        setGameState('playing');
      } catch (error) {
        setErrorMessage(error?.message || '获取单词失败，请稍后重试。');
        setGameState('error');
      }
    },
    [cleanupEngine, resetRoundState]
  );

  useEffect(() => {
    if (gameState !== 'playing') return;

    syncLayout();

    const engine = engineRef.current;
    engine.status = 'running';
    engine.feedback = null;

    if (engine.items.length === 0) {
      spawnItems(currentIndexRef.current, wordsRef.current);
    }

    let removeResizeListener = null;

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => {
        syncLayout();
      });
      observer.observe(containerRef.current);
      removeResizeListener = () => observer.disconnect();
    } else {
      const onResize = () => syncLayout();
      window.addEventListener('resize', onResize);
      removeResizeListener = () => window.removeEventListener('resize', onResize);
    }

    engine.rafId = requestAnimationFrame(gameLoop);

    return () => {
      cleanupEngine();
      if (removeResizeListener) removeResizeListener();
    };
  }, [gameLoop, gameState, cleanupEngine, spawnItems, syncLayout]);

  useEffect(() => {
    return () => cleanupEngine();
  }, [cleanupEngine]);

  const accuracy = words.length ? Math.round((score / words.length) * 100) : 0;
  const engine = engineRef.current;
  const currentWord = words[currentIndex];
  const isPerfect = words.length > 0 && score === words.length;
  const isExcellent = accuracy >= 80 && !isPerfect;
  const isPass = accuracy >= 60 && accuracy < 80;
  const isFailed = accuracy < 60;

  if (gameState === 'start') {
    return (
      <div className="piggy-shell">
        <div className="piggy-card intro-card">
          <div className="piggy-badge">Piggy Vocab</div>
          <div className="intro-emoji">🐷</div>
          <h1 className="piggy-title">小猪接单词</h1>
          <p className="piggy-subtitle">
            左右拖动小猪，接住英文单词对应的中文释义。答错会扣生命，生命用完则结束。
          </p>

          <div className="form-block">
            <label className="form-label" htmlFor="piggy-date">
              选择单词日期
            </label>
            <input
              id="piggy-date"
              className="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => fetchWords(date)}
          >
            开始游戏
          </button>

          <div className="intro-tip">
            手机上直接按住屏幕左右滑动即可控制小猪。
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="piggy-shell">
        <div className="piggy-card state-card">
          <div className="state-emoji spin">🐷</div>
          <h2 className="state-title">正在加载单词</h2>
          <p className="state-text">小猪正在把今天的题目搬过来，请稍等一下。</p>
        </div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div className="piggy-shell">
        <div className="piggy-card state-card error-card">
          <div className="state-emoji">⚠️</div>
          <h2 className="state-title">加载失败</h2>
          <p className="state-text">{errorMessage}</p>
          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setGameState('start')}
            >
              返回
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => fetchWords(date)}
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="piggy-shell">
        <div className={`piggy-card result-card ${isPerfect ? 'perfect' : ''}`}>
          <div className="result-emoji">
            {isPerfect ? '🏆🐷' : isExcellent ? '✨🐷' : isPass ? '🙂🐷' : '😵🐷'}
          </div>

          <h1 className="piggy-title">
            {isPerfect
              ? '满分通关'
              : isExcellent
              ? '发挥很稳'
              : isPass
              ? '挑战完成'
              : '再来一局'}
          </h1>

          <p className="piggy-subtitle">
            {isPerfect
              ? '全部答对，今天这组单词已经稳了。'
              : isExcellent
              ? '正确率很高，再练一遍基本就能拿满分。'
              : isPass
              ? '已经完成挑战，再多练几轮会更稳。'
              : '这次失误有点多，建议再打一轮巩固一下。'}
          </p>

          <div className="result-grid">
            <div className="metric-card">
              <span className="metric-label">正确率</span>
              <strong className="metric-value">{accuracy}%</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">答对数量</span>
              <strong className="metric-value">
                {score} / {words.length}
              </strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">剩余生命</span>
              <strong className="metric-value">{lives}</strong>
            </div>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setGameState('start')}
            >
              换日期
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => fetchWords(date)}
            >
              再玩一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="piggy-shell game-page">
      <div
        className="game-board"
        ref={containerRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          handlePointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' || e.pressure > 0) {
            handlePointer(e.clientX);
          }
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture?.(e.pointerId);
        }}
        style={{ touchAction: 'none' }}
      >
        <div className="board-bg board-bg-1" />
        <div className="board-bg board-bg-2" />

        <div className="hud">
          <div className="hud-row">
            <div className="status-pill">进度 {currentIndex + 1} / {words.length}</div>
            <div className="status-pill status-pill-score">得分 {score}</div>
          </div>

          <div className="question-card">
            <div className="question-label">接住这个单词的中文意思</div>
            <div className="question-word">{currentWord?.en || '--'}</div>
          </div>

          <div className="life-row">
            {Array.from({ length: MAX_LIVES }).map((_, index) => (
              <span
                key={index}
                className={`life-heart ${index < lives ? 'active' : 'lost'}`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        <div className="play-tip">按住屏幕左右拖动</div>

        {engine.items.map((item) => (
          <div
            key={item.id}
            className={`falling-item ${item.isCorrect ? 'correct-option' : 'wrong-option'}`}
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
            }}
          >
            <span>{item.text}</span>
          </div>
        ))}

        <div className="ground-line" />

        <div
          className={`pig-player ${
            engine.feedback?.type === 'correct'
              ? 'pig-correct'
              : engine.feedback?.type === 'wrong'
              ? 'pig-wrong'
              : ''
          }`}
          style={{
            width: `${engine.layout.pigSize}px`,
            height: `${engine.layout.pigSize}px`,
            transform: `translate3d(${engine.pigX || 0}px, ${engine.layout.pigY}px, 0)`,
          }}
        >
          <div className="pig-face">
            {engine.feedback?.type === 'correct'
              ? '🥳'
              : engine.feedback?.type === 'wrong'
              ? '😵'
              : '🐷'}
          </div>
        </div>

        {engine.feedback && (
          <div
            className={`feedback-toast ${
              engine.feedback.type === 'correct' ? 'ok' : 'bad'
            }`}
          >
            {engine.feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}