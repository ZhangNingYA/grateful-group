import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

const API_ENDPOINT = 'https://api.fulafu.com/api/words';
const START_LIVES = 5;
const PREVIEW_DURATION = 3000; // ms to show word before spelling
const HINT_DURATION = 1500;
const LETTER_FADE_TIME = 12000; // ms before letters start fading
const COMBO_THRESHOLD = 3;

const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalizeWords = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        if (!item.en || !item.zh) return null;
        return { en: String(item.en).trim().toLowerCase(), zh: String(item.zh).trim() };
      })
      .filter(Boolean)
      .filter((item) => item.en && item.zh);
  }
  if (typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([en, zh]) => typeof en === 'string' && typeof zh === 'string')
      .map(([en, zh]) => ({ en: en.trim().toLowerCase(), zh: zh.trim() }))
      .filter((item) => item.en && item.zh);
  }
  return [];
};

// Generate distractor letters
const generateLetterPool = (word) => {
  const letters = word.split('');
  // Add 3-5 random distractor letters
  const distractorCount = Math.min(5, Math.max(3, Math.floor(word.length * 0.5)));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < distractorCount; i++) {
    letters.push(alphabet[Math.floor(Math.random() * 26)]);
  }
  return shuffle(letters).map((char, idx) => ({
    id: `${char}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    char,
    used: false,
    wrong: false,
    x: 10 + Math.random() * 75, // percentage position
    y: 10 + Math.random() * 70,
  }));
};

// World regions unlocked by exploration points
const REGIONS = [
  { id: 'meadow', name: '字母草原', icon: '🌿', color: '#22c55e', threshold: 0, desc: '旅程的起点' },
  { id: 'cave', name: '回忆洞穴', icon: '🕯️', color: '#a855f7', threshold: 15, desc: '在黑暗中回忆拼写' },
  { id: 'peak', name: '速记山巅', icon: '⛰️', color: '#3b82f6', threshold: 35, desc: '时间更紧迫' },
  { id: 'ruins', name: '古词遗迹', icon: '🏛️', color: '#f59e0b', threshold: 60, desc: '没有任何提示' },
  { id: 'sky', name: '词境之巅', icon: '✨', color: '#ec4899', threshold: 100, desc: '终极挑战' },
];

const getRegionForScore = (score) => {
  let region = REGIONS[0];
  for (const r of REGIONS) {
    if (score >= r.threshold) region = r;
  }
  return region;
};

export default function VocabQuiz() {
  const [phase, setPhase] = useState('start');
  const [date, setDate] = useState(getTodayInputValue());
  const [words, setWords] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Exploration state (persisted)
  const [totalExp, setTotalExp] = useState(() => {
    try { return parseInt(localStorage.getItem('vocab_exp') || '0', 10); } catch { return 0; }
  });

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);

  // Spelling state
  const [letterPool, setLetterPool] = useState([]);
  const [typedLetters, setTypedLetters] = useState([]);
  const [wordPhase, setWordPhase] = useState('preview'); // preview | hint | spell | complete | wrong
  const [shakeWord, setShakeWord] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [encounters, setEncounters] = useState({}); // word -> times seen
  const [fadeProgress, setFadeProgress] = useState(0); // 0-100

  // Map state
  const [currentRegion, setCurrentRegion] = useState(REGIONS[0]);
  const [pathProgress, setPathProgress] = useState(0); // 0-100 within current region

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Save exp
  useEffect(() => {
    try { localStorage.setItem('vocab_exp', String(totalExp)); } catch {}
  }, [totalExp]);

  // Current word
  const currentWord = useMemo(() => words[currentIndex] || null, [words, currentIndex]);

  // How many times we've seen this word
  const wordEncounterCount = useMemo(() => {
    if (!currentWord) return 0;
    return encounters[currentWord.en] || 0;
  }, [currentWord, encounters]);

  // Start letter fade timer
  const startFadeTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setFadeProgress(0);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / LETTER_FADE_TIME) * 100);
      setFadeProgress(progress);
      if (progress < 100) {
        fadeTimerRef.current = requestAnimationFrame(tick);
      }
    };
    fadeTimerRef.current = requestAnimationFrame(tick);
  }, []);

  const stopFadeTimer = useCallback(() => {
    if (fadeTimerRef.current) {
      cancelAnimationFrame(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  // Setup a new word for spelling
  const setupWord = useCallback((wordObj, encounterCount) => {
    const pool = generateLetterPool(wordObj.en);
    setLetterPool(pool);
    setTypedLetters([]);
    setShakeWord(false);
    setShowSuccess(false);
    stopFadeTimer();
    setFadeProgress(0);

    if (encounterCount === 0) {
      // First time: show full word preview
      setWordPhase('preview');
      timerRef.current = setTimeout(() => {
        setWordPhase('spell');
        startFadeTimer();
      }, PREVIEW_DURATION);
    } else if (encounterCount === 1) {
      // Second time: brief hint then spell
      setWordPhase('hint');
      timerRef.current = setTimeout(() => {
        setWordPhase('spell');
        startFadeTimer();
      }, HINT_DURATION);
    } else {
      // Third+ time: straight to spelling
      setWordPhase('spell');
      startFadeTimer();
    }
  }, [startFadeTimer, stopFadeTimer]);

  // Fetch words
  const fetchWords = useCallback(async (selectedDate) => {
    setErrorMsg('');
    setPhase('loading');

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_ENDPOINT}?date=${selectedDate}`, { signal: controller.signal });
      if (!res.ok) throw new Error('网络请求失败，请重试');
      const data = await res.json();
      if (data?.error) throw new Error(String(data.error));

      const list = shuffle(normalizeWords(data));
      if (!list.length) throw new Error('这一天还没有可练习的单词');

      setWords(list);
      setCurrentIndex(0);
      setLives(START_LIVES);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setWrongWords([]);
      setEncounters({});
      setPathProgress(0);

      // Mark first encounter
      const firstWord = list[0];
      setEncounters({ [firstWord.en]: 1 });
      setupWord(firstWord, 0);
      setPhase('playing');
    } catch (err) {
      if (controller.signal.aborted) return;
      setErrorMsg(err?.message || '加载失败');
      setPhase('error');
    }
  }, [setupWord]);

  // Handle letter tap
  const handleLetterTap = useCallback((letterId) => {
    if (wordPhase !== 'spell') return;

    const letterObj = letterPool.find(l => l.id === letterId);
    if (!letterObj || letterObj.used) return;

    const targetChar = currentWord.en[typedLetters.length];

    if (letterObj.char === targetChar) {
      // Correct letter!
      const newTyped = [...typedLetters, letterObj.char];
      setTypedLetters(newTyped);
      setLetterPool(prev => prev.map(l => l.id === letterId ? { ...l, used: true } : l));

      // Check if word complete
      if (newTyped.length === currentWord.en.length) {
        // Word complete!
        stopFadeTimer();
        setWordPhase('complete');
        setShowSuccess(true);
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        setScore(prev => prev + 1);

        // Gain exp
        const expGain = newCombo >= COMBO_THRESHOLD ? 3 : 1;
        setTotalExp(prev => prev + expGain);
        setPathProgress(prev => Math.min(100, prev + (100 / words.length)));

        // Advance after delay
        timerRef.current = setTimeout(() => {
          advanceWord();
        }, 1000);
      }
    } else {
      // Wrong letter!
      setShakeWord(true);
      setLetterPool(prev => prev.map(l => l.id === letterId ? { ...l, wrong: true } : l));

      setTimeout(() => {
        setShakeWord(false);
        setLetterPool(prev => prev.map(l => l.id === letterId ? { ...l, wrong: false } : l));
      }, 400);

      // Shuffle letter positions on mistake
      setTimeout(() => {
        setLetterPool(prev => {
          const available = prev.filter(l => !l.used);
          const newPositions = available.map(() => ({
            x: 10 + Math.random() * 75,
            y: 10 + Math.random() * 70,
          }));
          let posIdx = 0;
          return prev.map(l => {
            if (l.used) return l;
            const pos = newPositions[posIdx++];
            return { ...l, x: pos.x, y: pos.y };
          });
        });
      }, 300);

      setCombo(0);
      setLives(prev => prev - 1);

      // Check game over
      if (lives - 1 <= 0) {
        stopFadeTimer();
        setWrongWords(prev => [...prev, { en: currentWord.en, zh: currentWord.zh }]);
        timerRef.current = setTimeout(() => {
          setPhase('result');
        }, 600);
        return;
      }
    }
  }, [wordPhase, letterPool, currentWord, typedLetters, combo, lives, words.length, stopFadeTimer]);

  // Skip / give up current word (when time runs out)
  const skipWord = useCallback(() => {
    stopFadeTimer();
    setWordPhase('wrong');
    setCombo(0);
    setLives(prev => prev - 1);
    setWrongWords(prev => [...prev, { en: currentWord.en, zh: currentWord.zh }]);

    if (lives - 1 <= 0) {
      timerRef.current = setTimeout(() => setPhase('result'), 800);
    } else {
      timerRef.current = setTimeout(() => advanceWord(), 1500);
    }
  }, [currentWord, lives, stopFadeTimer]);

  // When fade reaches 100%, auto-skip
  useEffect(() => {
    if (fadeProgress >= 100 && wordPhase === 'spell') {
      skipWord();
    }
  }, [fadeProgress, wordPhase, skipWord]);

  // Advance to next word
  const advanceWord = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      setPhase('result');
      return;
    }

    setCurrentIndex(nextIndex);
    const nextWord = words[nextIndex];
    const count = encounters[nextWord.en] || 0;
    setEncounters(prev => ({ ...prev, [nextWord.en]: count + 1 }));
    setupWord(nextWord, count);
  }, [currentIndex, words, encounters, setupWord]);

  // Start game
  const startGame = useCallback(() => {
    fetchWords(date);
  }, [date, fetchWords]);

  // Go back to start
  const goStart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    stopFadeTimer();
    setPhase('start');
    setWords([]);
  }, [stopFadeTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
      if (fadeTimerRef.current) cancelAnimationFrame(fadeTimerRef.current);
    };
  }, []);

  // Update region based on exp
  useEffect(() => {
    setCurrentRegion(getRegionForScore(totalExp));
  }, [totalExp]);

  // Computed
  const totalWords = words.length;
  const answered = score + wrongWords.length;
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0;

  // ===== RENDER =====

  if (phase === 'start') {
    return (
      <div className="vocab-app">
        <div className="v-panel">
          <div className="v-logo">✨</div>
          <h1 className="v-title">字母炼金术</h1>
          <p className="v-subtitle">
            看中文，拼英文。<br />
            每个字母都是散落的元素碎片，<br />
            按正确顺序点击它们来合成单词魔法！
          </p>

          <div className="v-mode-badges">
            <span className="v-badge">🧩 主动拼写</span>
            <span className="v-badge">🗺️ 探索进度</span>
            <span className="v-badge">🧠 间隔记忆</span>
          </div>

          {/* Region progress */}
          <div className="v-region-preview">
            <span className="v-region-icon-sm">{currentRegion.icon}</span>
            <span className="v-region-name-sm">{currentRegion.name}</span>
            <span className="v-region-exp">EXP {totalExp}</span>
          </div>

          <div className="v-form-group">
            <label>词库日期</label>
            <input
              type="date"
              className="v-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button className="v-btn v-btn-primary" onClick={startGame}>
            ✨ 开始炼词
          </button>

          {/* Region map preview */}
          <div className="v-map-preview">
            {REGIONS.map((r) => (
              <div
                key={r.id}
                className={`v-map-node ${totalExp >= r.threshold ? 'v-map-node-active' : ''}`}
                style={{ '--node-color': r.color }}
              >
                <span className="v-map-node-icon">{r.icon}</span>
                <span className="v-map-node-name">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="vocab-app">
        <div className="v-panel">
          <div className="v-spinner" />
          <h2 className="v-title" style={{ fontSize: 20 }}>收集字母元素中...</h2>
          <p className="v-subtitle">正在连接词库</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="vocab-app">
        <div className="v-panel">
          <div className="v-error-icon">⚠️</div>
          <h2 className="v-title" style={{ fontSize: 20 }}>出错了</h2>
          <p className="v-subtitle">{errorMsg}</p>
          <div className="v-btn-row">
            <button className="v-btn v-btn-ghost" onClick={goStart}>返回</button>
            <button className="v-btn v-btn-primary" onClick={startGame}>重试</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="vocab-app">
        <div className="v-panel v-panel-scroll">
          <div className="v-result-icon">{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '⭐' : '📖'}</div>
          <h2 className="v-title">探索结束</h2>
          <p className="v-subtitle">
            {accuracy >= 80 ? '出色的拼写能力！' : accuracy >= 50 ? '不错的表现，继续加油！' : '多练习几次会更好的！'}
          </p>

          <div className="v-stats">
            <div className="v-stat v-stat-highlight">
              <div className="v-stat-label">正确率</div>
              <div className="v-stat-value">{accuracy}%</div>
            </div>
            <div className="v-stat">
              <div className="v-stat-label">拼对</div>
              <div className="v-stat-value">{score}/{totalWords}</div>
            </div>
            <div className="v-stat">
              <div className="v-stat-label">最高连击</div>
              <div className="v-stat-value">{maxCombo}</div>
            </div>
            <div className="v-stat">
              <div className="v-stat-label">总经验</div>
              <div className="v-stat-value">{totalExp}</div>
            </div>
          </div>

          {wrongWords.length > 0 && (
            <div className="v-wrong-section">
              <div className="v-wrong-title">📝 需要复习的词</div>
              <div className="v-wrong-list">
                {wrongWords.map((w, i) => (
                  <div key={i} className="v-wrong-item">
                    <span className="v-wrong-en">{w.en}</span>
                    <span className="v-wrong-zh">{w.zh}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="v-btn-row">
            <button className="v-btn v-btn-ghost" onClick={goStart}>返回</button>
            <button className="v-btn v-btn-primary" onClick={startGame}>再来一次</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  if (phase === 'playing' && currentWord) {
    const progress = totalWords > 0 ? Math.round(((currentIndex) / totalWords) * 100) : 0;
    const hintText = wordEncounterCount <= 1 ? currentWord.en[0] + '...' : '';

    return (
      <div className={`vocab-app vocab-app-playing ${shakeWord ? 'v-shake' : ''}`}>
        <div className="v-game">
          {/* Top bar */}
          <div className="v-topbar">
            <div className="v-lives">
              {Array.from({ length: START_LIVES }).map((_, i) => (
                <span key={i} className={`v-heart ${i >= lives ? 'v-heart-lost' : ''}`}>❤️</span>
              ))}
            </div>
            <div className="v-score-pill">
              <span className="v-score-num">{score}</span>
            </div>
            <button className="v-exit-btn" onClick={goStart}>退出</button>
          </div>

          {/* Progress */}
          <div className="v-progress-wrap">
            <div className="v-progress-bar">
              <div className="v-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="v-progress-text">{currentIndex + 1}/{totalWords}</span>
          </div>

          {/* Region indicator */}
          <div className="v-region-bar">
            <span>{currentRegion.icon} {currentRegion.name}</span>
            {combo >= COMBO_THRESHOLD && (
              <span className="v-combo-badge">🔥 x{combo}</span>
            )}
          </div>

          {/* Chinese meaning */}
          <div className="v-meaning-card">
            <div className="v-meaning-label">拼出这个词的英文</div>
            <div className="v-meaning-zh">{currentWord.zh}</div>
            {wordPhase === 'hint' && (
              <div className="v-meaning-hint">提示: {hintText}</div>
            )}
          </div>

          {/* Typed letters display */}
          <div className="v-typed-area">
            <div className="v-typed-slots">
              {currentWord.en.split('').map((char, i) => (
                <div
                  key={i}
                  className={`v-typed-slot ${i < typedLetters.length ? 'v-typed-filled' : ''} ${i === typedLetters.length ? 'v-typed-current' : ''}`}
                >
                  {i < typedLetters.length ? typedLetters[i] : ''}
                </div>
              ))}
            </div>
            {wordPhase === 'preview' && (
              <div className="v-preview-word">{currentWord.en}</div>
            )}
          </div>

          {/* Letter pool - the interactive area */}
          <div className="v-letter-zone">
            {/* Time indicator */}
            <div className="v-time-bar">
              <div
                className={`v-time-fill ${fadeProgress > 70 ? 'v-time-danger' : fadeProgress > 40 ? 'v-time-warning' : ''}`}
                style={{ width: `${100 - fadeProgress}%` }}
              />
            </div>

            {wordPhase === 'spell' && letterPool.filter(l => !l.used).map((letter) => (
              <button
                key={letter.id}
                className={`v-letter-orb ${letter.wrong ? 'v-letter-wrong' : ''}`}
                style={{
                  left: `${letter.x}%`,
                  top: `${letter.y}%`,
                  opacity: Math.max(0.3, 1 - fadeProgress / 120),
                }}
                onClick={() => handleLetterTap(letter.id)}
              >
                {letter.char}
              </button>
            ))}

            {wordPhase === 'complete' && (
              <div className="v-spell-success">
                <span className="v-success-emoji">✨</span>
                <span className="v-success-text">完美拼写！</span>
              </div>
            )}

            {wordPhase === 'wrong' && (
              <div className="v-spell-fail">
                <span className="v-fail-word">{currentWord.en}</span>
                <span className="v-fail-text">正确拼写</span>
              </div>
            )}

            {wordPhase === 'preview' && (
              <div className="v-preview-hint">
                <span className="v-preview-icon">👀</span>
                <span>记住这个词的拼写...</span>
              </div>
            )}

            {wordPhase === 'hint' && (
              <div className="v-preview-hint">
                <span className="v-preview-icon">💡</span>
                <span>回忆一下...</span>
              </div>
            )}
          </div>

          {/* Skip button */}
          {wordPhase === 'spell' && (
            <button className="v-skip-btn" onClick={skipWord}>
              跳过 (扣1命)
            </button>
          )}

          {showSuccess && (
            <div className="v-feedback-pop">✨</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
