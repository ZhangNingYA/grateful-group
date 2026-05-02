import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';


const START_LIVES = 3;
const MAX_LIVES = 5;
const BONUS_EVERY = 10;
const BASE_FALL_SPEED = 218;
const MAX_FALL_SPEED = 320;
const HIT_PAUSE_MS = 720;
const API_ENDPOINT = 'https://api.fulafu.com/api/words';

const SOUND_FILES = {
  correct: '',
  wrong: '',
  combo: '',
  resultB: '',
  resultA: '',
  resultS: '',
  resultSSS: '',
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
  score: 0,
  wrong: 0,
  lives: START_LIVES,
  combo: 0,
  maxCombo: 0,
  currentIndex: 0,
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
  B: {
    title: '先抱一下',
    subtitle: '今天先到这里，亲亲先给你存着。',
    pill: '下轮多接一点，我就把亲亲全补给你。',
  },
  A: {
    title: '已经很乖啦',
    subtitle: '差一点点就能收更多亲亲。',
    pill: '你再认真一点，我就舍不得停。',
  },
  S: {
    title: '好会接呀',
    subtitle: '今天要多奖励你好多亲亲。',
    pill: '这轮真的很甜，我想继续奖励你。',
  },
  SSS: {
    title: '满分小宝贝',
    subtitle: '这轮当然要给你一大把亲亲。',
    pill: '亲亲雨已经准备好了，全都落给你。',
  },
};

const RESULT_KISS_COUNT = {
  B: 0,
  A: 6,
  S: 12,
  SSS: 18,
};

const RESULT_KISSES = Array.from({ length: 18 }).map((_, index) => ({
  id: `kiss-${index}`,
  x: [8, 16, 28, 72, 84, 92, 12, 24, 38, 62, 76, 88, 10, 20, 46, 68, 80, 90][index],
  y: [16, 6, 0, 2, 10, 20, 78, 90, 96, 96, 90, 80, 50, 64, 8, 12, 58, 44][index],
  rotate: [-12, 10, -16, 8, 18, -8, 12, -10, 6, -6, 14, -14, 9, -18, 12, -8, 16, -10][index],
  delay: index * 0.06,
}));

function PigFace({ className = '' }) {
  return (
    <div className={`pig-face ${className}`.trim()}>
      <span className="pig-ear pig-ear-left" />
      <span className="pig-ear pig-ear-right" />
      <span className="pig-eye pig-eye-left" />
      <span className="pig-eye pig-eye-right" />
      <span className="pig-blush pig-blush-left" />
      <span className="pig-blush pig-blush-right" />
      <span className="pig-snout">
        <i />
        <i />
      </span>
    </div>
  );
}

export default function PiggyVocabGame() {
  const [date, setDate] = useState(getTodayInputValue());
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(createDefaultStats());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setFrameTick] = useState(0);

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
    layout: {
      width: 390,
      height: 844,
      pigSize: 88,
      pigY: 0,
      itemWidth: 108,
      itemHeight: 92,
      paddingX: 14,
    },
  });

  const invalidate = useCallback(() => {
    setFrameTick((n) => (n + 1) % 1000000);
  }, []);

  const syncStats = useCallback((patch) => {
    const next = { ...statsRef.current, ...patch };
    statsRef.current = next;
    setStats(next);
  }, []);

  const resetRoundState = useCallback(() => {
    const cleanStats = createDefaultStats();
    statsRef.current = cleanStats;
    setStats(cleanStats);

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

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  }, []);

  const unlockAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.error('audio resume failed:', error);
      }
    }
    audioUnlockedRef.current = true;
  }, [getAudioContext]);

  const playTone = useCallback((ctx, { freq, start, duration, type = 'sine', gain = 0.03, endFreq = null }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    }

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
    } catch {
      return false;
    }
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

  const playComboSound = useCallback(() => {
    if (playAssetSound(SOUND_FILES.combo)) return;
    const ctx = getAudioContext();
    if (!ctx || !audioUnlockedRef.current) return;
    const t = ctx.currentTime;
    playTone(ctx, { freq: 660, start: t, duration: 0.08, type: 'triangle', gain: 0.025 });
    playTone(ctx, { freq: 900, start: t + 0.08, duration: 0.1, type: 'triangle', gain: 0.028 });
    playTone(ctx, { freq: 1200, start: t + 0.16, duration: 0.14, type: 'triangle', gain: 0.03 });
  }, [getAudioContext, playAssetSound, playTone]);

  const playResultSound = useCallback((grade) => {
    const assetKey = grade === 'SSS' ? 'resultSSS' : grade === 'S' ? 'resultS' : grade === 'A' ? 'resultA' : 'resultB';
    if (playAssetSound(SOUND_FILES[assetKey])) return;

    const ctx = getAudioContext();
    if (!ctx || !audioUnlockedRef.current) return;
    const t = ctx.currentTime;

    if (grade === 'SSS') {
      playTone(ctx, { freq: 784, start: t, duration: 0.12, type: 'triangle', gain: 0.028 });
      playTone(ctx, { freq: 988, start: t + 0.08, duration: 0.13, type: 'triangle', gain: 0.03 });
      playTone(ctx, { freq: 1174, start: t + 0.16, duration: 0.16, type: 'triangle', gain: 0.032 });
      playTone(ctx, { freq: 1568, start: t + 0.26, duration: 0.18, type: 'sine', gain: 0.03 });
      return;
    }

    if (grade === 'S') {
      playTone(ctx, { freq: 659, start: t, duration: 0.1, type: 'triangle', gain: 0.026 });
      playTone(ctx, { freq: 880, start: t + 0.09, duration: 0.13, type: 'triangle', gain: 0.028 });
      playTone(ctx, { freq: 1046, start: t + 0.18, duration: 0.16, type: 'triangle', gain: 0.03 });
      return;
    }

    if (grade === 'A') {
      playTone(ctx, { freq: 523, start: t, duration: 0.12, type: 'triangle', gain: 0.024 });
      playTone(ctx, { freq: 659, start: t + 0.11, duration: 0.14, type: 'triangle', gain: 0.026 });
      return;
    }

    playTone(ctx, { freq: 392, start: t, duration: 0.18, type: 'triangle', gain: 0.022 });
  }, [getAudioContext, playAssetSound, playTone]);

  const updateFullscreenState = useCallback(() => {
    if (typeof document === 'undefined') return;
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    updateFullscreenState();
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, [updateFullscreenState]);

  const tryEnterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return false;
    const el = document.documentElement;
    if (!el || !el.requestFullscreen || document.fullscreenElement) return false;
    try {
      await el.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }, []);

  const tryExitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement || !document.exitFullscreen) return;
    try {
      await document.exitFullscreen();
    } catch {
      // ignore
    }
  }, []);

  const syncLayout = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const engine = engineRef.current;
    const rect = board.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 390;
    const height = rect.height || window.innerHeight || 844;

    const pigSize = clamp(width * 0.195, 84, 112);
    const itemWidth = clamp(width * 0.26, 88, 138);
    const itemHeight = clamp(width * 0.24, 84, 112);
    const pigY = height - pigSize - 22;
    const paddingX = clamp(width * 0.04, 12, 18);

    engine.layout = {
      width,
      height,
      pigSize,
      pigY,
      itemWidth,
      itemHeight,
      paddingX,
    };

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
    const x = clamp(clientX - rect.left - dragRef.current.grabOffsetX, 10, rect.width - pigSize - 10);
    engine.pigX = x;
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
      if (pool.length >= 2) break;
    }

    const options = shuffle([
      { text: currentWord.zh, isCorrect: true, type: 'word' },
      ...pool.map((item) => ({ text: item.zh, isCorrect: false, type: 'word' })),
    ]);

    const { width, height, itemWidth, itemHeight, paddingX } = engine.layout;
    const count = Math.max(options.length, 1);
    const slotWidth = (width - paddingX * 2) / count;
    const w = Math.min(itemWidth, slotWidth - 10);
    const h = itemHeight;

    engine.mode = 'normal';
    engine.items = options.map((option, index) => ({
      id: createId(),
      text: option.text,
      isCorrect: option.isCorrect,
      type: option.type,
      w,
      h,
      x: paddingX + slotWidth * index + (slotWidth - w) / 2,
      y: -(h + Math.random() * (height * 0.14 + 24)),
    }));
    engine.feedback = null;
    invalidate();
  }, [invalidate]);

  const spawnBonusItem = useCallback(() => {
    const engine = engineRef.current;
    const { width, height } = engine.layout;
    const size = clamp(engine.layout.itemHeight * 0.92, 82, 96);

    engine.mode = 'bonus';
    engine.items = [
      {
        id: createId(),
        text: '💋',
        isCorrect: true,
        type: 'bonus',
        w: size,
        h: size,
        x: (width - size) / 2,
        y: -(size + height * 0.12),
      },
    ];
    engine.feedback = null;
    invalidate();
  }, [invalidate]);

  const finishGame = useCallback(() => {
    const engine = engineRef.current;
    cleanupEngine();
    engine.items = [];
    engine.feedback = null;
    engine.status = 'done';
    setPhase('result');
    invalidate();
  }, [cleanupEngine, invalidate]);

  const resumeNormalRound = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'running';
    engine.feedback = null;
    spawnNormalItems(statsRef.current.currentIndex, wordsRef.current);
  }, [spawnNormalItems]);

  const resolveBonusCatch = useCallback(() => {
    const engine = engineRef.current;
    engine.status = 'paused';
    engine.feedback = { type: 'bonus', id: createId() };

    const nextLives = Math.min(MAX_LIVES, statsRef.current.lives + 1);
    syncStats({ lives: nextLives });
    playComboSound();
    invalidate();

    if (engine.timeoutId) clearTimeout(engine.timeoutId);
    engine.timeoutId = window.setTimeout(() => {
      resumeNormalRound();
    }, HIT_PAUSE_MS);
  }, [invalidate, playComboSound, resumeNormalRound, syncStats]);

  const resolveWordCatch = useCallback((item) => {
    const engine = engineRef.current;
    engine.status = 'paused';

    if (item.isCorrect) {
      const nextScore = statsRef.current.score + 1;
      const nextCombo = statsRef.current.combo + 1;
      const nextMaxCombo = Math.max(statsRef.current.maxCombo, nextCombo);
      const nextIndex = statsRef.current.currentIndex + 1;

      syncStats({
        score: nextScore,
        combo: nextCombo,
        maxCombo: nextMaxCombo,
        currentIndex: nextIndex,
      });

      engine.feedback = {
        type: nextCombo > 0 && nextCombo % BONUS_EVERY === 0 ? 'combo' : 'correct',
        id: createId(),
      };

      if (nextCombo > 0 && nextCombo % BONUS_EVERY === 0) {
        playComboSound();
      } else {
        playCorrectSound();
      }

      invalidate();

      if (engine.timeoutId) clearTimeout(engine.timeoutId);
      engine.timeoutId = window.setTimeout(() => {
        if (nextIndex >= wordsRef.current.length) {
          finishGame();
          return;
        }
        engine.status = 'running';
        if (nextCombo > 0 && nextCombo % BONUS_EVERY === 0) {
          spawnBonusItem();
        } else {
          spawnNormalItems(nextIndex, wordsRef.current);
        }
      }, HIT_PAUSE_MS);
      return;
    }

    const nextLives = statsRef.current.lives - 1;
    const nextWrong = statsRef.current.wrong + 1;

    syncStats({ lives: nextLives, wrong: nextWrong, combo: 0 });
    engine.feedback = { type: 'wrong', id: createId() };
    playWrongSound();
    invalidate();

    if (engine.timeoutId) clearTimeout(engine.timeoutId);
    engine.timeoutId = window.setTimeout(() => {
      if (nextLives <= 0) {
        finishGame();
        return;
      }
      resumeNormalRound();
    }, HIT_PAUSE_MS);
  }, [finishGame, invalidate, playComboSound, playCorrectSound, playWrongSound, resumeNormalRound, spawnBonusItem, spawnNormalItems, syncStats]);

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

        if (
          isOverlap(
            item.x,
            item.y,
            item.w,
            item.h,
            engine.pigX,
            pigY,
            pigSize,
            pigSize
          )
        ) {
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
          engine.status = 'paused';
          engine.feedback = { type: 'wrong', id: createId() };

          const nextLives = statsRef.current.lives - 1;
          const nextWrong = statsRef.current.wrong + 1;
          syncStats({ lives: nextLives, wrong: nextWrong, combo: 0 });
          playWrongSound();
          invalidate();

          if (engine.timeoutId) clearTimeout(engine.timeoutId);
          engine.timeoutId = window.setTimeout(() => {
            if (nextLives <= 0) {
              finishGame();
              return;
            }
            resumeNormalRound();
          }, HIT_PAUSE_MS);
        }
      }
    }

    invalidate();
    engine.rafId = requestAnimationFrame(gameLoop);
  }, [finishGame, invalidate, playWrongSound, resolveBonusCatch, resolveWordCatch, resumeNormalRound, syncStats]);

  const fetchWords = useCallback(async (selectedDate) => {
    cleanupEngine();
    resetRoundState();
    setErrorMessage('');
    setPhase('loading');

    if (requestRef.current) {
      requestRef.current.abort();
    }

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch(`${API_ENDPOINT}?date=${selectedDate}`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error('单词还没抱过来，再试一下。');
      }

      const data = await response.json();
      if (data?.error) {
        throw new Error(String(data.error));
      }

      const list = shuffle(normalizeWords(data));
      if (!list.length) {
        throw new Error('这一天还没有单词呀。');
      }

      wordsRef.current = list;
      setWords(list);
      setPhase('playing');
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(error?.message || '加载失败了。');
      setPhase('error');
    }
  }, [cleanupEngine, resetRoundState]);

  const startGame = useCallback(async () => {
    await unlockAudio();
    await tryEnterFullscreen();
    await fetchWords(date);
  }, [date, fetchWords, tryEnterFullscreen, unlockAudio]);

  const restartSameDate = useCallback(async () => {
    await unlockAudio();
    if (!isFullscreen) {
      await tryEnterFullscreen();
    }
    await fetchWords(date);
  }, [date, fetchWords, isFullscreen, tryEnterFullscreen, unlockAudio]);

  const goStart = useCallback(async (exitFullscreen = false) => {
    cleanupEngine();
    if (requestRef.current) {
      requestRef.current.abort();
      requestRef.current = null;
    }
    resetRoundState();
    setWords([]);
    setErrorMessage('');
    setPhase('start');
    if (exitFullscreen) {
      await tryExitFullscreen();
    }
  }, [cleanupEngine, resetRoundState, tryExitFullscreen]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    syncLayout();
    const engine = engineRef.current;
    engine.status = 'running';
    engine.feedback = null;

    if (engine.items.length === 0) {
      spawnNormalItems(statsRef.current.currentIndex, wordsRef.current);
    }

    const onResize = () => syncLayout();
    const board = boardRef.current;
    let observer = null;

    if (typeof ResizeObserver !== 'undefined' && board) {
      observer = new ResizeObserver(onResize);
      observer.observe(board);
    } else {
      window.addEventListener('resize', onResize);
    }

    engine.rafId = requestAnimationFrame(gameLoop);

    return () => {
      cleanupEngine();
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', onResize);
      }
    };
  }, [cleanupEngine, gameLoop, phase, spawnNormalItems, syncLayout]);

  useEffect(() => () => {
    cleanupEngine();
    if (requestRef.current) {
      requestRef.current.abort();
    }
  }, [cleanupEngine]);

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

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const totalWords = words.length;
  const answeredCount = stats.score + stats.wrong;
  const accuracy = useMemo(() => {
    if (answeredCount <= 0) return 0;
    return Math.round((stats.score / answeredCount) * 100);
  }, [answeredCount, stats.score]);
  const completion = totalWords > 0 ? Math.round((stats.score / totalWords) * 100) : 0;
  const grade = getGrade(accuracy, completion);
  const resultMeta = RESULT_META[grade];
  const kissCount = RESULT_KISS_COUNT[grade];
  const engine = engineRef.current;
  const currentWord = words[stats.currentIndex];

  useEffect(() => {
    if (phase === 'result' && !resultSoundPlayedRef.current) {
      playResultSound(grade);
      resultSoundPlayedRef.current = true;
      return;
    }
    if (phase !== 'result') {
      resultSoundPlayedRef.current = false;
    }
  }, [grade, phase, playResultSound]);

  const handlePigPointerDown = async (event) => {
    if (phase !== 'playing') return;
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
      try {
        pig.setPointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }

    positionPigByClientX(event.clientX);
  };

  if (phase === 'start') {
    return (
      <div className="pg-shell pg-shell-start">
        <div className="scene-blush blush-a" />
        <div className="scene-blush blush-b" />
        <div className="float-kiss fk-1">💋</div>
        <div className="float-kiss fk-2">💋</div>
        <div className="float-kiss fk-3">💋</div>

        <div className="start-card">
          <div className="start-hero">
            <div className="hero-bubble">接对就奖励你亲亲</div>
            <div className="hero-pig-wrap">
              <div className="hero-pig-glow" />
              <PigFace className="hero-pig" />
            </div>
            <h1>小猪接单词</h1>
            <p>按住小猪左右拖，把对的意思接住就好。</p>
          </div>

          <div className="start-panel">
            <label className="date-label" htmlFor="piggy-date">想练哪一天</label>
            <input
              id="piggy-date"
              className="date-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />

            <button type="button" className="start-button" onClick={startGame}>
              开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="pg-shell pg-shell-center">
        <div className="loading-card">
          <div className="loading-pig-ring">
            <PigFace className="loading-pig" />
          </div>
          <h2>单词抱过来啦</h2>
          <p>等我一下下。</p>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="pg-shell pg-shell-center">
        <div className="simple-card">
          <div className="error-mark">!</div>
          <h2>没抱到单词</h2>
          <p>{errorMessage}</p>
          <div className="result-actions compact-actions">
            <button type="button" className="ghost-button" onClick={() => goStart(false)}>
              换一天
            </button>
            <button type="button" className="solid-button" onClick={restartSameDate}>
              再试试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className={`pg-shell pg-shell-result grade-${grade.toLowerCase()}`}>
        <div className="scene-blush blush-a" />
        <div className="scene-blush blush-c" />

        <div className="result-card">
          <div className="result-top-visual">
            <div className={`result-medal grade-${grade.toLowerCase()}`}>{grade}</div>
            {RESULT_KISSES.slice(0, kissCount).map((item) => (
              <span
                key={item.id}
                className="result-kiss"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  '--r': `${item.rotate}deg`,
                  animationDelay: `${item.delay}s`,
                }}
              >
                💋
              </span>
            ))}
          </div>

          <div className="result-copy">
            <h2>{resultMeta.title}</h2>
            <p>{resultMeta.subtitle}</p>
            <div className="result-pill">{resultMeta.pill}</div>
          </div>

          <div className="result-stat-main">
            <span>正确率</span>
            <strong>{accuracy}%</strong>
          </div>

          <div className="result-grid">
            <div className="result-stat">
              <span>完成率</span>
              <strong>{completion}%</strong>
            </div>
            <div className="result-stat">
              <span>答对</span>
              <strong>{stats.score}/{totalWords || 0}</strong>
            </div>
            <div className="result-stat wide">
              <span>最高连击</span>
              <strong>{stats.maxCombo}</strong>
            </div>
          </div>

          <div className="result-actions">
            <button type="button" className="ghost-button" onClick={() => goStart(true)}>
              换一天
            </button>
            <button type="button" className="solid-button" onClick={restartSameDate}>
              再来一轮
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`play-shell ${engine.mode === 'bonus' ? 'mode-bonus' : ''}`}>
      <div className="play-scene" ref={boardRef}>
        <div className="scene-blush blush-a" />
        <div className="scene-blush blush-b" />
        <div className="light-orb lo-1" />
        <div className="light-orb lo-2" />
        <div className="light-orb lo-3" />

        <div className="play-top-ui">
          <div className="top-progress-card">
            <div className="top-progress-head">
              <span>练习进度</span>
              <strong>{Math.min(stats.currentIndex + 1, totalWords || 0)}/{totalWords || 0}</strong>
            </div>
            <div className="top-progress-track">
              <div
                className="top-progress-fill"
                style={{ width: `${totalWords ? ((stats.currentIndex + 1) / totalWords) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="top-mini-row">
            <div className="mini-stat-card">
              <span>正确率</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="mini-stat-card">
              <span>连击</span>
              <strong>{stats.combo}</strong>
            </div>
            <div className="mini-life-card">
              <span>生命</span>
              <div className="heart-row">
                {Array.from({ length: MAX_LIVES }).map((_, index) => (
                  <i key={index} className={`tiny-heart ${index < stats.lives ? 'alive' : ''}`} />
                ))}
              </div>
            </div>
            <button type="button" className="quit-button" onClick={() => goStart(true)}>
              退出
            </button>
          </div>

          <div className={`word-card ${engine.mode === 'bonus' ? 'bonus-word-card' : ''}`}>
            {engine.mode === 'bonus' ? (
              <>
                <div className="bonus-icon">💋</div>
                <div className="word-caption">亲亲奖励</div>
                <div className="word-main bonus-main">接住就多一颗命</div>
              </>
            ) : (
              <>
                <div className="word-caption">接住对的意思</div>
                <div className="word-main">{currentWord?.en || '--'}</div>
              </>
            )}
          </div>
        </div>

        <div className="fall-layer" aria-hidden="true">
          {engine.items.map((item) => (
            <div
              key={item.id}
              className={`fall-item ${item.type === 'bonus' ? 'fall-item-bonus' : 'fall-item-word'}`}
              style={{
                width: `${item.w}px`,
                height: `${item.h}px`,
                transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
              }}
            >
              {item.type === 'bonus' ? <span className="bonus-drop-kiss">💋</span> : <span>{item.text}</span>}
            </div>
          ))}
        </div>

        <div className="pig-dock" aria-hidden="true" />

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
          <div className="pig-shell-body">
            <PigFace className="play-pig" />
          </div>

          {engine.feedback?.type === 'correct' && (
            <div key={engine.feedback.id} className="effect-burst kiss-burst">
              <span>💋</span>
              <span>💋</span>
              <span>✨</span>
            </div>
          )}

          {engine.feedback?.type === 'combo' && (
            <div key={engine.feedback.id} className="effect-burst combo-burst">
              <span>💋</span>
              <span>💋</span>
              <span>💋</span>
              <b>奖励</b>
            </div>
          )}

          {engine.feedback?.type === 'bonus' && (
            <div key={engine.feedback.id} className="effect-burst bonus-burst">
              <span>💋</span>
              <span>+1</span>
              <span>💋</span>
            </div>
          )}

          {engine.feedback?.type === 'wrong' && (
            <div key={engine.feedback.id} className="effect-burst wrong-burst">
              <span>唔</span>
              <span>再来</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
