import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';


const START_LIVES = 3;
const MAX_LIVES = 5;
const BONUS_EVERY = 10;
const BASE_FALL_SPEED = 228;
const MAX_FALL_SPEED = 308;
const HIT_PAUSE_MS = 760;

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

const isOverlap = (ax, ay, aw, ah, bx, by, bw, bh) =>
  ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

const normalizeWords = (payload) => {
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'object' && item.en && item.zh) {
          return { en: String(item.en).trim(), zh: String(item.zh).trim() };
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

const getGrade = (accuracy) => {
  if (accuracy === 100) return 'SSS';
  if (accuracy >= 80) return 'S';
  if (accuracy >= 60) return 'A';
  return 'B';
};

const getGradeClass = (grade) => {
  if (grade === 'SSS') return 'grade-sss';
  if (grade === 'S') return 'grade-s';
  if (grade === 'A') return 'grade-a';
  return 'grade-b';
};

const getDropSpeed = (currentIndex, totalWords, mode = 'normal') => {
  const progress = totalWords > 1 ? currentIndex / (totalWords - 1) : 0;
  const speed = BASE_FALL_SPEED + (MAX_FALL_SPEED - BASE_FALL_SPEED) * progress;
  return mode === 'bonus' ? speed * 0.92 : speed;
};

const PERFECT_FIREWORKS = Array.from({ length: 36 }).map((_, index) => {
  const angle = (Math.PI * 2 * index) / 36;
  const distance = 90 + (index % 6) * 18;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return {
    id: `fire-${index}`,
    x,
    y,
    delay: (index % 12) * 0.06,
    size: 14 + (index % 3) * 3,
  };
});

export default function PiggyVocabGame() {
  const [date, setDate] = useState(getTodayInputValue());
  const [gameState, setGameState] = useState('start');
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [, forceRender] = useState(0);

  const containerRef = useRef(null);

  const wordsRef = useRef([]);
  const scoreRef = useRef(0);
  const wrongCountRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const currentIndexRef = useRef(0);
  const gameStateRef = useRef(gameState);

  const engineRef = useRef({
    pigX: null,
    items: [],
    status: 'idle',
    mode: 'normal',
    feedback: null,
    rafId: 0,
    timeoutId: 0,
    lastTs: 0,
    layout: {
      width: 390,
      height: 844,
      pigSize: 78,
      itemSize: 88,
      pigY: 0,
    },
  });

  const answeredCount = score + wrongCount;
  const accuracy = useMemo(() => {
    if (answeredCount <= 0) return 0;
    return Math.round((score / answeredCount) * 100);
  }, [score, wrongCount, answeredCount]);

  const grade = getGrade(accuracy);
  const gradeClass = getGradeClass(grade);

  const rerender = useCallback(() => {
    forceRender((n) => (n + 1) % 1000000);
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('fullscreen failed:', error);
    }
  }, []);

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

  const resetRoundState = useCallback(() => {
    const engine = engineRef.current;
    engine.items = [];
    engine.feedback = null;
    engine.status = 'idle';
    engine.mode = 'normal';
    engine.pigX = null;
    engine.lastTs = 0;

    scoreRef.current = 0;
    wrongCountRef.current = 0;
    livesRef.current = START_LIVES;
    comboRef.current = 0;
    maxComboRef.current = 0;
    currentIndexRef.current = 0;

    setScore(0);
    setWrongCount(0);
    setLives(START_LIVES);
    setCombo(0);
    setMaxCombo(0);
    setCurrentIndex(0);
  }, []);

  const syncLayout = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 390;
    const height = rect.height || window.innerHeight || 844;

    const pigSize = clamp(width * 0.18, 68, 94);
    const itemSize = clamp(width * 0.22, 70, 102);
    const pigY = height - pigSize - 26;

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

  const spawnNormalItems = useCallback(
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
        { text: currentWord.zh, isCorrect: true, type: 'word' },
        ...pool.map((item) => ({
          text: item.zh,
          isCorrect: false,
          type: 'word',
        })),
      ]);

      const count = Math.max(options.length, 1);
      const padding = 12;
      const slotWidth = (width - padding * 2) / count;
      const size = Math.min(itemSize, slotWidth - 10);

      engine.mode = 'normal';
      engine.items = options.map((option, index) => ({
        id: createId(),
        text: option.text,
        isCorrect: option.isCorrect,
        type: option.type,
        size,
        x: padding + slotWidth * index + (slotWidth - size) / 2,
        y: -(size + Math.random() * (height * 0.12 + 24)),
      }));

      engine.feedback = null;
      rerender();
    },
    [rerender]
  );

  const spawnBonusItem = useCallback(() => {
    const engine = engineRef.current;
    if (!containerRef.current) return;

    const { width, height, itemSize } = engine.layout;
    const size = clamp(itemSize * 0.92, 68, 96);

    engine.mode = 'bonus';
    engine.items = [
      {
        id: createId(),
        text: '',
        isCorrect: true,
        type: 'bonus',
        size,
        x: (width - size) / 2,
        y: -(size + height * 0.08),
      },
    ];

    engine.feedback = null;
    rerender();
  }, [rerender]);

  const finishGame = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'done';
    engine.items = [];
    engine.feedback = null;
    cleanupEngine();
    setGameState('result');
    rerender();
  }, [cleanupEngine, rerender]);

  const resumeNormalRound = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'running';
    engine.feedback = null;
    spawnNormalItems(currentIndexRef.current, wordsRef.current);
  }, [spawnNormalItems]);

  const resolveBonusCatch = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'paused';
    engine.feedback = {
      type: 'bonus-life',
      id: createId(),
    };

    const nextLives = Math.min(MAX_LIVES, livesRef.current + 1);
    livesRef.current = nextLives;
    setLives(nextLives);

    rerender();

    if (engine.timeoutId) clearTimeout(engine.timeoutId);
    engine.timeoutId = window.setTimeout(() => {
      resumeNormalRound();
    }, HIT_PAUSE_MS);
  }, [resumeNormalRound, rerender]);

  const resolveWordCatch = useCallback(
    (hitItem) => {
      const engine = engineRef.current;
      engine.status = 'paused';

      if (hitItem.isCorrect) {
        const nextScore = scoreRef.current + 1;
        const nextCombo = comboRef.current + 1;
        const nextMaxCombo = Math.max(maxComboRef.current, nextCombo);
        const nextIndex = currentIndexRef.current + 1;

        scoreRef.current = nextScore;
        comboRef.current = nextCombo;
        maxComboRef.current = nextMaxCombo;

        setScore(nextScore);
        setCombo(nextCombo);
        setMaxCombo(nextMaxCombo);

        engine.feedback = {
          type: 'correct',
          id: createId(),
        };

        rerender();

        if (engine.timeoutId) clearTimeout(engine.timeoutId);
        engine.timeoutId = window.setTimeout(() => {
          if (nextIndex >= wordsRef.current.length) {
            finishGame();
            return;
          }

          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);

          engine.status = 'running';

          if (nextCombo > 0 && nextCombo % BONUS_EVERY === 0) {
            spawnBonusItem();
          } else {
            spawnNormalItems(nextIndex, wordsRef.current);
          }
        }, HIT_PAUSE_MS);

        return;
      }

      const nextLives = livesRef.current - 1;
      const nextWrongCount = wrongCountRef.current + 1;

      livesRef.current = nextLives;
      wrongCountRef.current = nextWrongCount;
      comboRef.current = 0;

      setLives(nextLives);
      setWrongCount(nextWrongCount);
      setCombo(0);

      engine.feedback = {
        type: 'wrong',
        id: createId(),
      };

      rerender();

      if (engine.timeoutId) clearTimeout(engine.timeoutId);
      engine.timeoutId = window.setTimeout(() => {
        if (nextLives <= 0) {
          finishGame();
          return;
        }
        resumeNormalRound();
      }, HIT_PAUSE_MS);
    },
    [finishGame, resumeNormalRound, rerender, spawnBonusItem, spawnNormalItems]
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
        const speed = getDropSpeed(
          currentIndexRef.current,
          wordsRef.current.length,
          engine.mode
        );
        const moveY = (speed * delta) / 1000;

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
          if (engine.mode === 'bonus') {
            resolveBonusCatch();
          } else {
            resolveWordCatch(hitItem);
          }
        } else if (allPassed || engine.items.length === 0) {
          if (engine.mode === 'bonus') {
            resumeNormalRound();
          } else {
            spawnNormalItems(currentIndexRef.current, wordsRef.current);
          }
        }
      }

      rerender();
      engine.rafId = requestAnimationFrame(gameLoop);
    },
    [rerender, resolveBonusCatch, resolveWordCatch, resumeNormalRound, spawnNormalItems]
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
          throw new Error('网络有点不稳定，单词还没拿回来。');
        }

        const data = await response.json();

        if (data?.error) {
          throw new Error(String(data.error));
        }

        const sourceList = normalizeWords(data).map((item) => ({ ...item }));
        const list = shuffle(sourceList);

        if (list.length === 0) {
          throw new Error('这一天还没有单词记录。');
        }

        wordsRef.current = list;
        setWords(list);
        setGameState('playing');
      } catch (error) {
        setErrorMessage(error?.message || '加载失败。');
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
      spawnNormalItems(currentIndexRef.current, wordsRef.current);
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
  }, [cleanupEngine, gameLoop, gameState, spawnNormalItems, syncLayout]);

  useEffect(() => {
    return () => cleanupEngine();
  }, [cleanupEngine]);

  const engine = engineRef.current;

  if (gameState === 'start') {
    return (
      <div className="piggy-screen piggy-start-screen">
        <button
          type="button"
          className="fullscreen-fab"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? '退出' : '全屏'}
        </button>

        <div className="sky-sun start-sun" />
        <div className="sky-cloud cloud-one" />
        <div className="sky-cloud cloud-two" />
        <div className="sky-cloud cloud-three" />

        <div className="start-wrap">
          <div className="start-hero-block">
            <div className="hero-pig-card">
              <div className="hero-pig-art pig-face-art">
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
            </div>

            <div className="hero-copy">
              <div className="hero-chip">VOCAB GAME</div>
              <h1 className="hero-title">小猪接单词</h1>
              <p className="hero-subtitle">
                接住正确释义，越往后越快。10 连击解锁爱心奖励关。
              </p>
            </div>
          </div>

          <div className="start-panel">
            <label className="field-label" htmlFor="piggy-date">
              选择练习日期
            </label>
            <input
              id="piggy-date"
              className="full-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              type="button"
              className="start-main-button"
              onClick={() => fetchWords(date)}
            >
              开始今天的任务
            </button>

            <div className="start-grid">
              <div className="start-card-mini">
                <span className="mini-title">奖励关触发</span>
                <strong>{BONUS_EVERY} 连击</strong>
              </div>
              <div className="start-card-mini">
                <span className="mini-title">速度变化</span>
                <strong>渐进加速</strong>
              </div>
              <div className="start-card-mini">
                <span className="mini-title">生命上限</span>
                <strong>{MAX_LIVES}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="piggy-screen piggy-loading-screen">
        <button
          type="button"
          className="fullscreen-fab"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? '退出' : '全屏'}
        </button>

        <div className="sky-sun mini-sun" />
        <div className="sky-cloud cloud-one" />
        <div className="sky-cloud cloud-two" />
        <div className="loading-shell">
          <div className="loading-ring" />
          <div className="loading-core" />
        </div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div className="piggy-screen piggy-error-screen">
        <button
          type="button"
          className="fullscreen-fab"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? '退出' : '全屏'}
        </button>

        <div className="sky-sun mini-sun" />
        <div className="sky-cloud cloud-one" />
        <div className="sky-cloud cloud-two" />

        <div className="result-panel result-panel-small">
          <div className="rating-medal grade-b">
            <div className="rating-inner">!</div>
          </div>
          <h2 className="result-title">加载失败</h2>
          <p className="result-desc">{errorMessage}</p>
          <div className="result-actions">
            <button type="button" className="ghost-button" onClick={() => setGameState('start')}>
              返回
            </button>
            <button type="button" className="solid-button" onClick={() => fetchWords(date)}>
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className={`piggy-screen piggy-result-screen ${gradeClass}`}>
        <button
          type="button"
          className="fullscreen-fab"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? '退出' : '全屏'}
        </button>

        <div className="result-scene">
          <div className="sky-sun result-sun" />
          <div className="sky-cloud cloud-one" />
          <div className="sky-cloud cloud-two" />
          <div className="sky-cloud cloud-four" />
        </div>

        {grade === 'SSS' && (
          <div className="perfect-kiss-fireworks">
            <div className="reward-pig-wrapper">
              <div className="reward-pig">
                <div className="reward-pig-face pig-face-art">
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
              </div>

              {PERFECT_FIREWORKS.map((item) => (
                <span
                  key={item.id}
                  className="kiss-firework"
                  style={{
                    '--tx': `${item.x}px`,
                    '--ty': `${item.y}px`,
                    '--d': `${item.delay}s`,
                    '--s': `${item.size}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="result-panel result-panel-fancy">
          <div className={`rating-medal ${gradeClass}`}>
            <div className="rating-inner">{grade}</div>
            <span className="medal-orbit orbit-1" />
            <span className="medal-orbit orbit-2" />
          </div>

          <div className="result-heading">
            <h2 className="result-title">今日评级</h2>
            <p className="result-desc">本轮任务已经完成，看看今天的表现。</p>
          </div>

          <div className="result-stats">
            <div className="stat-box stat-main">
              <span className="stat-label">正确率</span>
              <strong className="stat-value">{accuracy}%</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">答对</span>
              <strong className="stat-value">
                {score}/{answeredCount || 0}
              </strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">最高连击</span>
              <strong className="stat-value">{maxCombo}</strong>
            </div>
          </div>

          <div className="result-actions">
            <button type="button" className="ghost-button" onClick={() => setGameState('start')}>
              换个日期
            </button>
            <button type="button" className="solid-button" onClick={() => fetchWords(date)}>
              再来一轮
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="piggy-game-screen">
      <div
        className={`piggy-game-board mode-${engine.mode}`}
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
        <div className="bg-glow board-glow-left" />
        <div className="bg-glow board-glow-right" />
        <div className="ambient-particle ap-1" />
        <div className="ambient-particle ap-2" />
        <div className="ambient-particle ap-3" />
        <div className="ambient-particle ap-4" />

        <div className="top-progress-bar">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${words.length ? ((currentIndex + 1) / words.length) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="progress-count">
            {currentIndex + 1}/{words.length}
          </div>

          <button
            type="button"
            className="fullscreen-mini-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
          >
            {isFullscreen ? '退' : '全'}
          </button>
        </div>

        <div className={`question-box ${engine.mode === 'bonus' ? 'bonus-box' : ''}`}>
          {engine.mode === 'bonus' ? (
            <div className="bonus-stage-head">
              <div className="bonus-stage-title">BONUS</div>
              <div className="bonus-heart-preview">
                <span className="bonus-heart-shape" />
              </div>
            </div>
          ) : (
            <>
              <div className="question-caption">Catch the right meaning</div>
              <div className="question-text">{words[currentIndex]?.en || '--'}</div>
            </>
          )}
        </div>

        <div className="side-rail">
          <div className="metric-card accuracy-card">
            <div
              className="accuracy-ring"
              style={{
                background: `conic-gradient(#ff7a86 0deg ${accuracy * 3.6}deg, rgba(255,255,255,0.18) ${accuracy * 3.6}deg 360deg)`,
              }}
            >
              <div className="accuracy-core">
                <span className="metric-label">ACC</span>
                <strong className="metric-value">{accuracy}%</strong>
              </div>
            </div>
          </div>

          <div className={`metric-card combo-card ${combo >= BONUS_EVERY ? 'charged' : ''}`}>
            <span className="metric-label">COMBO</span>
            <strong className="metric-value combo-value">{combo}</strong>
            <div className="combo-track">
              <div
                className="combo-fill"
                style={{
                  width: `${((combo % BONUS_EVERY) / BONUS_EVERY) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="metric-card life-card">
            <span className="metric-label">LIFE</span>
            <div className="life-row">
              {Array.from({ length: MAX_LIVES }).map((_, index) => (
                <span
                  key={index}
                  className={`life-heart ${index < lives ? 'alive' : 'empty'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {engine.items.map((item) => (
          <div
            key={item.id}
            className={`falling-item ${item.type === 'bonus' ? 'bonus-token' : 'word-token'} ${
              item.isCorrect ? 'token-good' : 'token-bad'
            }`}
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
            }}
          >
            {item.type === 'bonus' ? (
              <div className="heart-token-shape" />
            ) : (
              <span>{item.text}</span>
            )}
          </div>
        ))}

        <div
          className="player-shell"
          style={{
            width: `${engine.layout.pigSize}px`,
            height: `${engine.layout.pigSize}px`,
            transform: `translate3d(${engine.pigX || 0}px, ${engine.layout.pigY}px, 0)`,
          }}
        >
          <div
            className={`player-core ${
              engine.feedback?.type === 'correct'
                ? 'hit-correct'
                : engine.feedback?.type === 'wrong'
                ? 'hit-wrong'
                : engine.feedback?.type === 'bonus-life'
                ? 'hit-bonus'
                : ''
            }`}
          >
            <div className="pig-face-art player-pig">
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
          </div>

          {engine.feedback?.type === 'correct' && (
            <div className="effect-layer kiss-burst" key={engine.feedback.id}>
              <span className="effect-heart eh-1" />
              <span className="effect-heart eh-2" />
              <span className="effect-heart eh-3" />
              <span className="effect-star es-1" />
              <span className="effect-star es-2" />
            </div>
          )}

          {engine.feedback?.type === 'wrong' && (
            <div className="effect-layer wrong-burst" key={engine.feedback.id}>
              <span className="wrong-ring wr-1" />
              <span className="wrong-ring wr-2" />
            </div>
          )}

          {engine.feedback?.type === 'bonus-life' && (
            <div className="effect-layer life-burst" key={engine.feedback.id}>
              <span className="life-pop lp-1" />
              <span className="life-pop lp-2" />
              <span className="life-pop lp-3" />
              <span className="life-pop lp-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}