import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const START_LIVES = 3;
const MAX_LIVES = 5;
const BONUS_EVERY = 10;
const BASE_FALL_SPEED = 200; // 稍微调慢一点基础速度，更适合阅读
const MAX_FALL_SPEED = 300;
const HIT_PAUSE_MS = 600; // 答对时的停顿时间缩短，保持节奏感
const API_ENDPOINT = 'https://api.fulafu.com/api/words';

const SOUND_FILES = {
  correct: '', wrong: '', combo: '', resultB: '', resultA: '', resultS: '', resultSSS: '',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const isOverlap = (ax, ay, aw, ah, bx, by, bw, bh) =>
  ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

const normalizeWords = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        if (!item.en || !item.zh) return null;
        return { en: String(item.en).trim(), zh: String(item.zh).trim() };
      })
      .filter(Boolean)
      .filter((item) => item.en && item.zh);
  }
  if (typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([en, zh]) => typeof en === 'string' && typeof zh === 'string')
      .map(([en, zh]) => ({ en: en.trim(), zh: zh.trim() }))
      .filter((item) => item.en && item.zh);
  }
  return [];
};

const createDefaultStats = () => ({
  score: 0, wrong: 0, lives: START_LIVES, combo: 0, maxCombo: 0, currentIndex: 0,
});

const getDropSpeed = (currentIndex, totalWords, mode = 'normal') => {
  const progress = totalWords > 1 ? currentIndex / (totalWords - 1) : 0;
  const speed = BASE_FALL_SPEED + (MAX_FALL_SPEED - BASE_FALL_SPEED) * progress;
  return mode === 'bonus' ? speed * 0.9 : speed;
};

const getGrade = (accuracy, completion) => {
  if (completion === 100 && accuracy === 100) return 'SSS';
  if (accuracy >= 82) return 'S';
  if (accuracy >= 60) return 'A';
  return 'B';
};

const RESULT_META = {
  B: { title: '再接再厉', subtitle: '别灰心，复习一下错词，我们重头再来！', pill: '熟能生巧' },
  A: { title: '表现不错', subtitle: '词汇量很扎实，离完美只差一点点啦。', pill: '再稳一点' },
  S: { title: '词汇达人', subtitle: '超棒的反应力，几乎全对了！', pill: '太厉害了' },
  SSS: { title: '满分通关', subtitle: '完美无瑕！所有的单词都接得稳稳当当。', pill: '膜拜大佬' },
};

function PigFace({ className = '' }) {
  return (
    <div className={`pig-face ${className}`.trim()}>
      <span className="pig-ear pig-ear-left" />
      <span className="pig-ear pig-ear-right" />
      <span className="pig-eye pig-eye-left" />
      <span className="pig-eye pig-eye-right" />
      <span className="pig-blush pig-blush-left" />
      <span className="pig-blush pig-blush-right" />
      <span className="pig-snout"><i /><i /></span>
    </div>
  );
}

export default function PiggyVocabGame() {
  const [date, setDate] = useState(getTodayInputValue());
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(createDefaultStats());
  const [, setFrameTick] = useState(0);

  // 新增：错词复习弹窗的状态
  const [mistakeCtx, setMistakeCtx] = useState(null);

  const boardRef = useRef(null);
  const pigRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const requestRef = useRef(null);
  const resultSoundPlayedRef = useRef(false);

  const wordsRef = useRef([]);
  const statsRef = useRef(createDefaultStats());
  const phaseRef = useRef('start');
  const dragRef = useRef({ active: false, pointerId: null, grabOffsetX: 0 });

  const engineRef = useRef({
    pigX: null,
    items: [],
    mode: 'normal',
    status: 'idle',
    feedback: null,
    rafId: 0,
    timeoutId: 0,
    lastTs: 0,
    layout: { width: 390, height: 844, pigSize: 84, pigY: 0, itemWidth: 120, itemHeight: 64, paddingX: 20 },
  });

  const invalidate = useCallback(() => setFrameTick((n) => (n + 1) % 1000000), []);

  const syncStats = useCallback((patch) => {
    const next = { ...statsRef.current, ...patch };
    statsRef.current = next;
    setStats(next);
  }, []);

  const resetRoundState = useCallback(() => {
    const cleanStats = createDefaultStats();
    statsRef.current = cleanStats;
    setStats(cleanStats);
    setMistakeCtx(null);

    const engine = engineRef.current;
    engine.items = [];
    engine.feedback = null;
    engine.mode = 'normal';
    engine.status = 'idle';
    engine.pigX = null;
    engine.lastTs = 0;
    dragRef.current = { active: false, pointerId: null, grabOffsetX: 0 };
  }, []);

  const cleanupEngine = useCallback(() => {
    const engine = engineRef.current;
    if (engine.rafId) cancelAnimationFrame(engine.rafId);
    if (engine.timeoutId) clearTimeout(engine.timeoutId);
    engine.rafId = 0;
    engine.timeoutId = 0;
    engine.lastTs = 0;
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  }, []);

  const unlockAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (e) {}
    }
    audioUnlockedRef.current = true;
  }, [getAudioContext]);

  const playTone = useCallback((ctx, { freq, start, duration, type = 'sine', gain = 0.03, endFreq = null }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }, []);

  const playAssetSound = useCallback((src) => {
    if (!src) return false;
    try {
      const audio = new Audio(src);
      audio.volume = 0.62;
      audio.play().catch(() => {});
      return true;
    } catch { return false; }
  }, []);

  const playCorrectSound = useCallback(() => {
    if (playAssetSound(SOUND_FILES.correct)) return;
    const ctx = getAudioContext();
    if (!ctx || !audioUnlockedRef.current) return;
    const t = ctx.currentTime;
    playTone(ctx, { freq: 760, start: t, duration: 0.08, type: 'triangle', gain: 0.03 });
    playTone(ctx, { freq: 1040, start: t + 0.07, duration: 0.11, type: 'triangle', gain: 0.03 });
  }, [getAudioContext, playAssetSound, playTone]);

  const playWrongSound = useCallback(() => {
    if (playAssetSound(SOUND_FILES.wrong)) return;
    const ctx = getAudioContext();
    if (!ctx || !audioUnlockedRef.current) return;
    const t = ctx.currentTime;
    playTone(ctx, { freq: 330, start: t, duration: 0.15, endFreq: 220, type: 'sawtooth', gain: 0.025 });
    playTone(ctx, { freq: 220, start: t + 0.06, duration: 0.18, endFreq: 150, type: 'triangle', gain: 0.02 });
  }, [getAudioContext, playAssetSound, playTone]);

  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const syncLayout = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const engine = engineRef.current;
    const rect = board.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 390;
    const height = rect.height || window.innerHeight || 844;

    const pigSize = clamp(width * 0.22, 80, 100);
    const itemWidth = clamp(width * 0.38, 110, 150);
    const itemHeight = 64; 
    const pigY = height - pigSize - 30; // 稍微抬高一点距离底部
    const paddingX = clamp(width * 0.05, 16, 24);

    engine.layout = { width, height, pigSize, pigY, itemWidth, itemHeight, paddingX };
    if (typeof engine.pigX !== 'number') {
      engine.pigX = (width - pigSize) / 2;
    } else {
      engine.pigX = clamp(engine.pigX, 10, width - pigSize - 10);
    }
    invalidate();
  }, [invalidate]);

  const positionPigByClientX = useCallback((clientX) => {
    const board = boardRef.current;
    if (!board) return;
    const engine = engineRef.current;
    const rect = board.getBoundingClientRect();
    const { pigSize } = engine.layout;
    engine.pigX = clamp(clientX - rect.left - dragRef.current.grabOffsetX, 10, rect.width - pigSize - 10);
    invalidate();
  }, [invalidate]);

  const spawnNormalItems = useCallback((wordIndex, wordList = wordsRef.current) => {
    const engine = engineRef.current;
    const currentWord = wordList[wordIndex];
    if (!currentWord) return;

    const pool = [];
    const seenZh = new Set([currentWord.zh]);
    for (const word of shuffle(wordList.filter((_, index) => index !== wordIndex))) {
      if (!seenZh.has(word.zh)) {
        seenZh.add(word.zh);
        pool.push(word);
      }
      if (pool.length >= 2) break; // 3选1
    }

    const options = shuffle([
      { text: currentWord.zh, isCorrect: true, type: 'word' },
      ...pool.map((item) => ({ text: item.zh, isCorrect: false, type: 'word' })),
    ]);

    const { width, height, itemWidth, itemHeight, paddingX } = engine.layout;
    const count = options.length;
    const slotWidth = (width - paddingX * 2) / count;
    const w = Math.min(itemWidth, slotWidth - 12);

    engine.mode = 'normal';
    engine.items = options.map((option, index) => ({
      id: createId(),
      text: option.text,
      isCorrect: option.isCorrect,
      type: option.type,
      w,
      h: itemHeight,
      x: paddingX + slotWidth * index + (slotWidth - w) / 2,
      y: -(itemHeight + Math.random() * (height * 0.1) + 20),
    }));
    engine.feedback = null;
    invalidate();
  }, [invalidate]);

  const finishGame = useCallback(() => {
    cleanupEngine();
    engineRef.current.items = [];
    engineRef.current.status = 'done';
    setPhase('result');
    invalidate();
  }, [cleanupEngine, invalidate]);

  const resumeNormalRound = useCallback(() => {
    engineRef.current.status = 'running';
    engineRef.current.feedback = null;
    spawnNormalItems(statsRef.current.currentIndex, wordsRef.current);
  }, [spawnNormalItems]);

  // 新增：处理复习弹窗的关闭
  const handleAcknowledgeMistake = useCallback(() => {
    const engine = engineRef.current;
    setMistakeCtx(null); // 关闭弹窗

    const nextLives = statsRef.current.lives - 1;
    const nextWrong = statsRef.current.wrong + 1;
    syncStats({ lives: nextLives, wrong: nextWrong, combo: 0 });

    if (nextLives <= 0) {
      finishGame();
    } else {
      resumeNormalRound();
    }
  }, [finishGame, resumeNormalRound, syncStats]);


  const resolveWordCatch = useCallback((item) => {
    const engine = engineRef.current;
    
    if (item.isCorrect) {
      engine.status = 'paused';
      const nextScore = statsRef.current.score + 1;
      const nextCombo = statsRef.current.combo + 1;
      const nextMaxCombo = Math.max(statsRef.current.maxCombo, nextCombo);
      const nextIndex = statsRef.current.currentIndex + 1;

      syncStats({ score: nextScore, combo: nextCombo, maxCombo: nextMaxCombo, currentIndex: nextIndex });
      engine.feedback = { type: 'correct', id: createId() };
      playCorrectSound();
      invalidate();

      if (engine.timeoutId) clearTimeout(engine.timeoutId);
      engine.timeoutId = window.setTimeout(() => {
        if (nextIndex >= wordsRef.current.length) {
          finishGame();
          return;
        }
        resumeNormalRound();
      }, HIT_PAUSE_MS);
    } else {
      // 接错逻辑：自动暂停，弹出解析
      if (engine.timeoutId) clearTimeout(engine.timeoutId);
      engine.status = 'paused';
      playWrongSound();
      engine.feedback = { type: 'wrong', id: createId() };
      setMistakeCtx({
        type: 'caught_wrong',
        wordEn: wordsRef.current[statsRef.current.currentIndex].en,
        correctZh: wordsRef.current[statsRef.current.currentIndex].zh,
        caughtZh: item.text,
      });
      invalidate();
    }
  }, [finishGame, invalidate, playCorrectSound, playWrongSound, resumeNormalRound, syncStats]);

  const gameLoop = useCallback((timestamp) => {
    const engine = engineRef.current;
    if (phaseRef.current !== 'playing') return;

    if (!engine.lastTs) engine.lastTs = timestamp;
    const delta = Math.min(32, timestamp - engine.lastTs || 16);
    engine.lastTs = timestamp;

    if (engine.status === 'running') {
      const speed = getDropSpeed(statsRef.current.currentIndex, wordsRef.current.length, engine.mode);
      const moveY = (speed * delta) / 1000;
      const { height, pigSize, pigY } = engine.layout;

      let allPassed = engine.items.length > 0;
      let hitItem = null;

      for (const item of engine.items) {
        item.y += moveY;
        if (item.y < height + item.h) {
          allPassed = false;
        }
        if (isOverlap(item.x, item.y, item.w, item.h, engine.pigX, pigY, pigSize, pigSize)) {
          hitItem = item;
          break;
        }
      }

      if (hitItem) {
        resolveWordCatch(hitItem);
      } else if (allPassed || engine.items.length === 0) {
        // 漏接逻辑：自动暂停，弹出解析
        engine.status = 'paused';
        playWrongSound();
        engine.feedback = { type: 'wrong', id: createId() };
        setMistakeCtx({
          type: 'missed',
          wordEn: wordsRef.current[statsRef.current.currentIndex].en,
          correctZh: wordsRef.current[statsRef.current.currentIndex].zh,
        });
        invalidate();
      }
    }

    invalidate();
    engine.rafId = requestAnimationFrame(gameLoop);
  }, [invalidate, playWrongSound, resolveWordCatch]);

  const fetchWords = useCallback(async (selectedDate) => {
    cleanupEngine();
    resetRoundState();
    setErrorMessage('');
    setPhase('loading');

    if (requestRef.current) requestRef.current.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch(`${API_ENDPOINT}?date=${selectedDate}`, { signal: controller.signal });
      if (!response.ok) throw new Error('网络似乎开小差了，请重试。');
      const data = await response.json();
      if (data?.error) throw new Error(String(data.error));
      
      const list = shuffle(normalizeWords(data));
      if (!list.length) throw new Error('这一天还没有可练习的单词。');

      wordsRef.current = list;
      setWords(list);
      setPhase('playing');
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(error?.message || '加载失败，请检查网络。');
      setPhase('error');
    }
  }, [cleanupEngine, resetRoundState]);

  const startGame = useCallback(async () => {
    await unlockAudio();
    await fetchWords(date);
  }, [date, fetchWords, unlockAudio]);

  const restartSameDate = useCallback(async () => {
    await unlockAudio();
    await fetchWords(date);
  }, [date, fetchWords, unlockAudio]);

  const goStart = useCallback(() => {
    cleanupEngine();
    if (requestRef.current) requestRef.current.abort();
    resetRoundState();
    setWords([]);
    setErrorMessage('');
    setPhase('start');
  }, [cleanupEngine, resetRoundState]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    syncLayout();
    const engine = engineRef.current;
    engine.status = 'running';
    if (engine.items.length === 0) spawnNormalItems(statsRef.current.currentIndex, wordsRef.current);

    const onResize = () => syncLayout();
    window.addEventListener('resize', onResize);
    engine.rafId = requestAnimationFrame(gameLoop);

    return () => {
      cleanupEngine();
      window.removeEventListener('resize', onResize);
    };
  }, [cleanupEngine, gameLoop, phase, spawnNormalItems, syncLayout]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragRef.current.active) return;
      if (dragRef.current.pointerId !== null && event.pointerId !== dragRef.current.pointerId) return;
      positionPigByClientX(event.clientX);
    };
    const handlePointerUp = (event) => {
      if (!dragRef.current.active) return;
      if (dragRef.current.pointerId !== null && event.pointerId !== dragRef.current.pointerId) return;
      dragRef.current.active = false;
      const pig = pigRef.current;
      if (pig && dragRef.current.pointerId !== null && pig.hasPointerCapture?.(dragRef.current.pointerId)) {
        pig.releasePointerCapture(dragRef.current.pointerId);
      }
      dragRef.current.pointerId = null;
      dragRef.current.grabOffsetX = 0;
      invalidate();
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [invalidate, positionPigByClientX]);

  const totalWords = words.length;
  const answeredCount = stats.score + stats.wrong;
  const accuracy = useMemo(() => {
    if (answeredCount <= 0) return 0;
    return Math.round((stats.score / answeredCount) * 100);
  }, [answeredCount, stats.score]);
  const completion = totalWords > 0 ? Math.round((stats.score / totalWords) * 100) : 0;
  const grade = getGrade(accuracy, completion);
  const engine = engineRef.current;
  const currentWord = words[stats.currentIndex];

  const handlePigPointerDown = async (event) => {
    // 弹窗时禁止拖动
    if (phase !== 'playing' || mistakeCtx) return; 
    await unlockAudio();
    const board = boardRef.current;
    const pig = pigRef.current;
    if (!board || !pig) return;
    const boardRect = board.getBoundingClientRect();
    const localX = event.clientX - boardRect.left;
    dragRef.current.active = true;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.grabOffsetX = clamp(localX - engine.pigX, 0, engine.layout.pigSize);
    if (pig.setPointerCapture) {
      try { pig.setPointerCapture(event.pointerId); } catch {}
    }
    positionPigByClientX(event.clientX);
  };

  // ========== 渲染视图 ==========

  if (phase === 'start') {
    return (
      <div className="pg-container">
        <div className="card-panel shadow-lg flex-center">
          <div className="hero-visual">
            <PigFace className="hero-pig" />
          </div>
          <h1 className="title-primary">单词接接乐</h1>
          <p className="subtitle">复习错词，巩固记忆。左右拖动小猪接住正确的中文释义。</p>
          
          <div className="form-group">
            <label>选择练习日期</label>
            <input type="date" className="input-modern" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn-primary btn-block" onClick={startGame}>开始练习</button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="pg-container">
        <div className="card-panel shadow-md flex-center">
          <div className="spinner-pig"><PigFace className="hero-pig" /></div>
          <h2 className="title-secondary">正在获取词库...</h2>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="pg-container">
        <div className="card-panel shadow-md flex-center">
          <div className="icon-error">!</div>
          <h2 className="title-secondary">出错了</h2>
          <p className="subtitle">{errorMessage}</p>
          <div className="btn-row mt-4">
            <button className="btn-ghost" onClick={() => goStart()}>返回主页</button>
            <button className="btn-primary" onClick={restartSameDate}>重试</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const meta = RESULT_META[grade];
    return (
      <div className="pg-container pg-bg-pattern">
        <div className="card-panel shadow-lg">
          <div className="result-header">
            <div className={`grade-badge grade-${grade.toLowerCase()}`}>{grade}</div>
            <h2 className="title-primary mt-3">{meta.title}</h2>
            <p className="subtitle">{meta.subtitle}</p>
          </div>

          <div className="stat-grid mt-4">
            <div className="stat-box highlight">
              <span>正确率</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="stat-box">
              <span>完成度</span>
              <strong>{completion}%</strong>
            </div>
            <div className="stat-box">
              <span>正确数</span>
              <strong>{stats.score}/{totalWords}</strong>
            </div>
            <div className="stat-box">
              <span>最高连击</span>
              <strong>{stats.maxCombo}</strong>
            </div>
          </div>

          <div className="btn-row mt-5">
            <button className="btn-ghost" onClick={() => goStart()}>换个日期</button>
            <button className="btn-primary" onClick={restartSameDate}>再练一次</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="play-shell">
      <div className="play-scene" ref={boardRef}>
        
        {/* 顶部精简状态栏 */}
        <div className="top-status-bar">
          <div className="status-lives">
            {Array.from({ length: MAX_LIVES }).map((_, index) => (
              <i key={index} className={`heart-icon ${index < stats.lives ? 'alive' : 'lost'}`}>❤️</i>
            ))}
          </div>
          <div className="status-progress">
            <div className="progress-bar-bg">
              <div className="progress-fill" style={{ width: `${((stats.currentIndex) / totalWords) * 100}%` }} />
            </div>
            <span>{Math.min(stats.currentIndex + 1, totalWords)} / {totalWords}</span>
          </div>
          <button className="btn-text-sm" onClick={() => goStart()}>退出</button>
        </div>

        {/* 目标单词板 (屏幕中央偏上) */}
        <div className="target-word-board shadow-md">
          <span className="board-label">找出对应的中文意思</span>
          <h2 className="board-word">{currentWord?.en || '--'}</h2>
        </div>

        {/* 掉落物层 */}
        <div className="fall-layer">
          {engine.items.map((item) => (
            <div
              key={item.id}
              className="fall-bubble shadow-sm"
              style={{
                width: `${item.w}px`,
                height: `${item.h}px`,
                transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
              }}
            >
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* 小猪轨道区 */}
        <div className="ground-line" />
        <div
          ref={pigRef}
          className={`pig-dragger ${dragRef.current.active ? 'dragging' : ''} ${engine.feedback?.type || ''}`}
          style={{
            width: `${engine.layout.pigSize}px`,
            height: `${engine.layout.pigSize}px`,
            transform: `translate3d(${typeof engine.pigX === 'number' ? engine.pigX : 0}px, ${engine.layout.pigY}px, 0)`,
          }}
          onPointerDown={handlePigPointerDown}
        >
          <div className="pig-shadow" />
          <PigFace className="play-pig" />
          
          {engine.feedback?.type === 'correct' && (
             <div className="floating-feedback text-green">+1</div>
          )}
          {engine.feedback?.type === 'wrong' && (
             <div className="floating-feedback text-red">X</div>
          )}
        </div>

        {/* 错词复习弹窗 (覆盖在游戏上) */}
        {mistakeCtx && (
          <div className="mistake-overlay">
            <div className="mistake-card shadow-lg">
              <div className="mistake-icon">⚠️</div>
              <h3 className="mistake-title">哎呀，记混了！</h3>
              
              <div className="word-comparison">
                <div className="word-en">{mistakeCtx.wordEn}</div>
                <div className="meaning-correct">
                  <span className="label">正确释义</span>
                  <strong>{mistakeCtx.correctZh}</strong>
                </div>
                {mistakeCtx.type === 'caught_wrong' ? (
                  <div className="meaning-wrong">
                    <span className="label">你接到了</span>
                    <strike>{mistakeCtx.caughtZh}</strike>
                  </div>
                ) : (
                  <div className="meaning-wrong text-gray">
                    <span className="label">你错过了它...</span>
                  </div>
                )}
              </div>
              
              <p className="mistake-tip">仔细多看两眼，加深肌肉记忆。</p>
              <button className="btn-primary btn-block" onClick={handleAcknowledgeMistake}>
                记住了，继续
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}