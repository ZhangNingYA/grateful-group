import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/boll.css'
// 游戏物理配置
const PIG_SIZE = 60; // 小猪大小
const ITEM_SIZE = 70; // 掉落物大小
const FALL_SPEED = 3.5; // 下落速度

export default function PiggyVocabGame() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gameState, setGameState] = useState('start'); // start, loading, playing, result, error
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // 游戏核心状态
  const containerRef = useRef(null);
  const engineRef = useRef({
    pigX: 150,
    items: [],
    currentIndex: 0,
    status: 'playing',
    feedback: null,
  });

  const [, setTick] = useState(0);
  const requestRef = useRef();

  // 获取单词
  const fetchWords = async (selectedDate) => {
    setGameState('loading');
    try {
      const response = await fetch(`https://api.fulafu.com/api/words?date=${selectedDate}`);
      if (!response.ok) throw new Error('网络请求失败啦，宝宝检查一下网络哦');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const wordsArray = Object.entries(data).map(([en, zh]) => ({ en, zh }));
      if (wordsArray.length === 0) throw new Error('今天没有录入单词哦，宝宝可以休息一天啦！🐷');

      const shuffledWords = wordsArray.sort(() => 0.5 - Math.random());
      setWords(shuffledWords);
      setScore(0);

      engineRef.current.currentIndex = 0;
      engineRef.current.status = 'playing';
      engineRef.current.feedback = null;
      engineRef.current.items = [];

      setGameState('playing');
    } catch (error) {
      setErrorMessage(error.message || '获取单词失败了🥺');
      setGameState('error');
    }
  };

  // 生成一波掉落物
  const spawnItems = useCallback((wordIndex, wordList = words) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const currentWord = wordList[wordIndex];

    const options = [{ text: currentWord.zh, isCorrect: true }];
    const distractors = wordList.filter((_, i) => i !== wordIndex).sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(2, distractors.length); i++) {
      options.push({ text: distractors[i].zh, isCorrect: false });
    }

    options.sort(() => 0.5 - Math.random());
    const spacing = containerWidth / options.length;

    engineRef.current.items = options.map((opt, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: opt.text,
      isCorrect: opt.isCorrect,
      x: spacing * i + (spacing / 2) - (ITEM_SIZE / 2),
      y: -ITEM_SIZE - Math.random() * 50,
    }));
  }, [words]);

  // 核心游戏循环
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' || engineRef.current.status !== 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const state = engineRef.current;
    const containerHeight = containerRef.current?.clientHeight || 0;
    const pigY = containerHeight - PIG_SIZE - 20;

    let needsRespawn = true;
    let collidedItem = null;

    state.items.forEach((item) => {
      item.y += FALL_SPEED;

      if (item.y < containerHeight) {
        needsRespawn = false;
      }

      if (
        item.y + ITEM_SIZE > pigY &&
        item.y < pigY + PIG_SIZE &&
        item.x + ITEM_SIZE > state.pigX &&
        item.x < state.pigX + PIG_SIZE
      ) {
        collidedItem = item;
      }
    });

    if (collidedItem) {
      state.status = 'paused';
      state.feedback = collidedItem.isCorrect ? 'correct' : 'wrong';

      if (collidedItem.isCorrect) {
        setScore((s) => s + 1);
      }

      setTick((t) => t + 1);

      setTimeout(() => {
        if (collidedItem.isCorrect) {
          const nextIndex = state.currentIndex + 1;
          if (nextIndex >= words.length) {
            setGameState('result');
          } else {
            state.currentIndex = nextIndex;
            state.status = 'playing';
            state.feedback = null;
            spawnItems(nextIndex);
            setTick((t) => t + 1);
          }
        } else {
          setGameState('result');
        }
      }, 1000);

      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (needsRespawn || state.items.length === 0) {
      spawnItems(state.currentIndex);
    }

    setTick((t) => t + 1);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, words, spawnItems]);

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, gameLoop]);

  const handleMove = useCallback((clientX) => {
    if (engineRef.current.status !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newX = clientX - rect.left - PIG_SIZE / 2;

    newX = Math.max(0, Math.min(newX, rect.width - PIG_SIZE));
    engineRef.current.pigX = newX;
  }, []);

  if (gameState === 'start') {
    return (
      <div className="piggy-page piggy-page-start">
        <div className="start-card">
          <div className="start-emoji">🐽</div>
          <h1 className="start-title">小猪接单词</h1>
          <p className="start-desc">左右滑动接住正确的意思，小心别被砸晕啦！</p>

          <div className="form-group">
            <label className="form-label">给宝宝的专属日期：</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-input"
            />
          </div>

          <button onClick={() => fetchWords(date)} className="start-button">
            开始游玩 🎮
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading' || gameState === 'error') {
    return (
      <div className="piggy-page piggy-page-loading">
        {gameState === 'loading' ? (
          <div className="loading-box">
            <div className="loading-emoji">💨🐷</div>
            <p className="loading-text">小猪正在狂奔去拿单词...</p>
          </div>
        ) : (
          <div className="error-card">
            <div className="error-emoji">🥺</div>
            <p className="error-text">{errorMessage}</p>
            <button onClick={() => setGameState('start')} className="retry-button">
              返回重试
            </button>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'result') {
    const accuracy = (score / words.length) * 100;
    const isPerfect = accuracy === 100;
    const isFail = accuracy < 60;

    return (
      <div className="piggy-page piggy-page-result">
        <div className={`result-card ${isPerfect ? 'result-perfect' : ''}`}>
          {isPerfect && <div className="result-bg-hearts" />}

          <div className="result-content">
            <div
              className={`result-emoji-wrap ${
                isPerfect ? 'bounce' : isFail ? 'shake' : ''
              }`}
            >
              {isPerfect ? '💋🐷' : isFail ? '🔨😭' : '🐷✨'}
            </div>

            <h1 className="result-title">
              {isPerfect ? '满分宝宝！亲死你！' : isFail ? '接错啦！重新开始！' : '宝宝真棒！'}
            </h1>

            <p className="result-desc">
              {isPerfect
                ? '太厉害了吧乖乖，全部接中了！奖励无数个亲亲！😘'
                : isFail
                ? '哎呀，接错单词被砸晕啦！快重新开始挑战吧，不然没有亲亲哦！🥺'
                : '差一点点就满分啦，继续加油哦！💖'}
            </p>

            <div className="score-box">
              <div className="score-label">最终正确率</div>
              <div className={`score-value ${isFail ? 'score-fail' : 'score-pass'}`}>
                {accuracy.toFixed(0)}%
              </div>
              <div className="score-detail">
                接对 {score} 个 / 共 {words.length} 个
              </div>
            </div>

            <button onClick={() => setGameState('start')} className="restart-button">
              再玩一次 🔄
            </button>
          </div>
        </div>
      </div>
    );
  }

  const engine = engineRef.current;
  const currentWord = words[engine.currentIndex];

  return (
    <div
      className="game-root"
      style={{ touchAction: 'none' }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchStart={(e) => handleMove(e.touches[0].clientX)}
    >
      <div className="game-container" ref={containerRef}>
        <div className="top-panel">
          <div className="top-status-row">
            <span className="status-badge status-badge-blue">
              {engine.currentIndex + 1} / {words.length}
            </span>
            <span className="status-badge status-badge-pink">💖 {score}</span>
          </div>

          <div className="target-card">
            <div className="target-label">快接住这个意思：</div>
            <h2 className="target-word">{currentWord?.en}</h2>
          </div>
        </div>

        {engine.items.map((item) => (
          <div
            key={item.id}
            className="falling-item"
            style={{
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              left: item.x,
              top: item.y,
              transition: 'none',
            }}
          >
            {item.text}
          </div>
        ))}

        <div
          className="pig-player"
          style={{
            width: PIG_SIZE,
            height: PIG_SIZE,
            left: engine.pigX,
            transition: engine.status === 'paused' ? 'transform 0.3s' : 'none',
            transform: engine.status === 'paused' ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          {engine.feedback === 'correct' && (
            <div className="pig-feedback pig-feedback-correct">💖</div>
          )}
          {engine.feedback === 'wrong' && (
            <div className="pig-feedback pig-feedback-wrong">🔨</div>
          )}

          <div className="pig-body">
            {engine.feedback === null && '🐷'}
            {engine.feedback === 'correct' && '🥰'}
            {engine.feedback === 'wrong' && '😵'}
          </div>
        </div>
      </div>
    </div>
  );
}