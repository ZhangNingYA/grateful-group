import React, { useCallback, useEffect, useRef, useState } from 'react';


const MAX_LIVES = 3;
const API_ENDPOINT = 'https://api.fulafu.com/api/words';

const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const normalizeWords = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        if (!item.en || !item.zh) return null;
        return { en: String(item.en).trim(), zh: String(item.zh).trim() };
      })
      .filter(Boolean);
  }
  if (typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([en, zh]) => typeof en === 'string' && typeof zh === 'string')
      .map(([en, zh]) => ({ en: en.trim(), zh: zh.trim() }))
      .filter((item) => item.en && item.zh);
  }
  return [];
};

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'shoot') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.2);
    }
  } catch (e) {}
};

export default function SlingshotVocabGame() {
  const [date, setDate] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const [phase, setPhase] = useState('start');
  const [words, setWords] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [stats, setStats] = useState({ score: 0, wrong: 0, lives: MAX_LIVES, combo: 0, maxCombo: 0, currentIndex: 0 });
  const [mistakeCtx, setMistakeCtx] = useState(null);

  // 物理引擎状态
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const engineRef = useRef({
    width: 0, height: 0,
    targets: [],
    projectile: { active: false, x: 0, y: 0, vx: 0, vy: 0, radius: 40 },
    anchor: { x: 0, y: 0 },
    drag: { active: false, x: 0, y: 0 },
    particles: [],
    rafId: 0
  });

  const generateTargets = useCallback((index, wordList, width, height) => {
    if (!wordList || !wordList[index]) return [];
    const currentWord = wordList[index];
    const pool = shuffle(wordList.filter((_, i) => i !== index)).slice(0, 3);
    const options = shuffle([
      { text: currentWord.zh, isCorrect: true, id: 'correct' },
      ...pool.map((w, i) => ({ text: w.zh, isCorrect: false, id: `wrong-${i}` }))
    ]);

    // 初始化漂浮气泡的位置和速度
    return options.map((opt, i) => {
      const radius = 50;
      const x = (width / options.length) * i + radius + Math.random() * 20;
      const y = height * 0.15 + Math.random() * (height * 0.3);
      return {
        ...opt, x, y, radius,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        scale: 0, // 用于出场动画
      };
    });
  }, []);

  const initRound = useCallback((index, wordList) => {
    const engine = engineRef.current;
    engine.projectile.active = false;
    engine.projectile.x = engine.anchor.x;
    engine.projectile.y = engine.anchor.y;
    engine.targets = generateTargets(index, wordList, engine.width, engine.height);
  }, [generateTargets]);

  const initGame = useCallback((wordList) => {
    setStats({ score: 0, wrong: 0, lives: MAX_LIVES, combo: 0, maxCombo: 0, currentIndex: 0 });
    setMistakeCtx(null);
    initRound(0, wordList);
    setPhase('playing');
  }, [initRound]);

  const fetchWords = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`${API_ENDPOINT}?date=${date}`);
      if (!res.ok) throw new Error('星空信号断了，再连一次嘛~');
      const data = await res.json();
      const list = shuffle(normalizeWords(data));
      if (!list.length) throw new Error('宝贝，这天宇宙里没有单词哦。');
      setWords(list);
      
      // 预先设置尺寸保证第一题生成位置正确
      if (containerRef.current) {
        engineRef.current.width = containerRef.current.clientWidth;
        engineRef.current.height = containerRef.current.clientHeight;
        engineRef.current.anchor = { x: engineRef.current.width / 2, y: engineRef.current.height * 0.85 };
      }
      initGame(list);
    } catch (err) {
      setErrorMsg(err.message || '网络傲娇了~');
      setPhase('error');
    }
  };

  // 物理引擎核心循环
  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    const engine = engineRef.current;

    // 适配高分屏 DPI，让文字和连线极其清晰锐利
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      engine.width = rect.width;
      engine.height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      engine.anchor = { x: engine.width / 2, y: engine.height * 0.82 };
      
      if (!engine.projectile.active && !engine.drag.active) {
        engine.projectile.x = engine.anchor.x;
        engine.projectile.y = engine.anchor.y;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const checkCollision = () => {
      const proj = engine.projectile;
      for (let i = 0; i < engine.targets.length; i++) {
        const t = engine.targets[i];
        const dist = Math.hypot(proj.x - t.x, proj.y - t.y);
        if (dist < proj.radius + t.radius - 10) { // 稍微缩小碰撞箱，手感更好
          return t;
        }
      }
      return null;
    };

    const explodeTarget = (target) => {
      playSound('hit');
      for(let i=0; i<20; i++) {
        engine.particles.push({
          x: target.x, y: target.y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1, color: target.isCorrect ? '#4ade80' : '#f87171'
        });
      }
      engine.targets = engine.targets.filter(t => t.id !== target.id);
    };

    const loop = () => {
      ctx.clearRect(0, 0, engine.width, engine.height);

      // 1. 更新与绘制漂浮目标 (中文泡泡)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      engine.targets.forEach(t => {
        // 出场放大动画
        if (t.scale < 1) t.scale += 0.05;
        
        // 漂浮物理
        t.x += t.vx; t.y += t.vy;
        if (t.x < t.radius || t.x > engine.width - t.radius) t.vx *= -1;
        if (t.y < t.radius || t.y > engine.height * 0.55) t.vy *= -1;

        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.scale(t.scale, t.scale);
        
        // 泡泡本体
        ctx.beginPath();
        ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        // 中文文字
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px -apple-system, sans-serif';
        // 简单处理超长文本换行
        if (t.text.length > 5) {
          ctx.fillText(t.text.slice(0, 5), 0, -10);
          ctx.fillText(t.text.slice(5, 10), 0, 14);
        } else {
          ctx.fillText(t.text, 0, 0);
        }
        ctx.restore();
      });

      // 2. 绘制拖拽辅助线 (拉弓时的瞄准线)
      if (engine.drag.active && !mistakeCtx) {
        const dx = engine.anchor.x - engine.drag.x;
        const dy = engine.anchor.y - engine.drag.y;
        
        ctx.beginPath();
        ctx.moveTo(engine.anchor.x, engine.anchor.y);
        ctx.lineTo(engine.drag.x, engine.drag.y);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 轨迹预测虚线
        ctx.beginPath();
        ctx.moveTo(engine.anchor.x, engine.anchor.y);
        ctx.lineTo(engine.anchor.x + dx * 2, engine.anchor.y + dy * 2);
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. 更新弹射物 (飞行的单词)
      const proj = engine.projectile;
      if (proj.active && !mistakeCtx) {
        proj.x += proj.vx;
        proj.y += proj.vy;
        
        // 添加拖尾粒子
        engine.particles.push({
          x: proj.x, y: proj.y,
          vx: 0, vy: 0,
          life: 0.5, color: '#60a5fa'
        });

        // 碰撞检测
        const hitTarget = checkCollision();
        if (hitTarget) {
          proj.active = false;
          explodeTarget(hitTarget);
          
          if (hitTarget.isCorrect) {
            // 答对处理
            setStats(p => {
              const nextIndex = p.currentIndex + 1;
              const nextCombo = p.combo + 1;
              if (nextIndex >= words.length) {
                setTimeout(() => setPhase('result'), 600);
              } else {
                setTimeout(() => initRound(nextIndex, words), 400);
              }
              return { ...p, score: p.score + 1, combo: nextCombo, maxCombo: Math.max(p.maxCombo, nextCombo), currentIndex: nextIndex };
            });
          } else {
            // 答错处理
            playSound('error');
            setMistakeCtx({
              wordEn: words[stats.currentIndex].en,
              correctZh: words[stats.currentIndex].zh,
              caughtZh: hitTarget.text
            });
          }
        } else if (proj.x < 0 || proj.x > engine.width || proj.y < -50 || proj.y > engine.height) {
          // 飞出边界 (打偏了)
          proj.active = false;
          playSound('error');
          setMistakeCtx({
            wordEn: words[stats.currentIndex].en,
            correctZh: words[stats.currentIndex].zh,
            caughtZh: '打偏在无垠的太空了'
          });
        }
      }

      // 4. 绘制弹射物 (英文单词球)
      if (!mistakeCtx) {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#bfdbfe';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const wordText = words[stats.currentIndex]?.en || '';
        if (wordText.length > 7) {
            ctx.font = 'bold 14px -apple-system, sans-serif';
        }
        ctx.fillText(wordText, 0, 0);
        ctx.restore();
      }

      // 5. 绘制粒子
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const p = engine.particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) engine.particles.splice(i, 1);
      }

      engine.rafId = requestAnimationFrame(loop);
    };

    engine.rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(engine.rafId);
      window.removeEventListener('resize', resize);
    };
  }, [phase, words, stats.currentIndex, mistakeCtx, initRound]);

  // 拖拽手势处理
  const handlePointerDown = (e) => {
    if (phase !== 'playing' || mistakeCtx || engineRef.current.projectile.active) return;
    const engine = engineRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检查是否点中了发射台区域
    const dist = Math.hypot(x - engine.anchor.x, y - engine.anchor.y);
    if (dist < 60) {
      engine.drag.active = true;
      engine.drag.x = x;
      engine.drag.y = y;
    }
  };

  const handlePointerMove = (e) => {
    const engine = engineRef.current;
    if (!engine.drag.active) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // 限制最大拉力半径
    const maxPull = 120;
    const dx = x - engine.anchor.x;
    const dy = y - engine.anchor.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxPull) {
      x = engine.anchor.x + (dx / dist) * maxPull;
      y = engine.anchor.y + (dy / dist) * maxPull;
    }

    engine.drag.x = x;
    engine.drag.y = y;
    engine.projectile.x = x;
    engine.projectile.y = y;
  };

  const handlePointerUp = () => {
    const engine = engineRef.current;
    if (!engine.drag.active) return;
    engine.drag.active = false;
    
    const dx = engine.anchor.x - engine.drag.x;
    const dy = engine.anchor.y - engine.drag.y;
    const pullDist = Math.hypot(dx, dy);

    // 只有拉动距离超过阈值才算发射
    if (pullDist > 20) {
      playSound('shoot');
      engine.projectile.active = true;
      // 速度放大系数，手感调节关键
      engine.projectile.vx = dx * 0.25; 
      engine.projectile.vy = dy * 0.25;
    } else {
      // 归位
      engine.projectile.x = engine.anchor.x;
      engine.projectile.y = engine.anchor.y;
    }
  };

  const handleAcknowledgeMistake = () => {
    setMistakeCtx(null);
    const nextLives = stats.lives - 1;
    setStats(p => ({ ...p, lives: nextLives, wrong: p.wrong + 1, combo: 0 }));
    
    if (nextLives <= 0) {
      setPhase('result');
    } else {
      initRound(stats.currentIndex, words);
    }
  };

  // --- 界面渲染 ---
  if (phase === 'start') {
    return (
      <div className="sling-wrap theme-starry">
        <div className="glass-panel">
          <div className="icon-pulse">🎯</div>
          <h1 className="neon-title">星轨弹弓</h1>
          <p className="desc-text">别再无聊地点点点了！<br/>按住底部的英文单词，**向后拉动**瞄准正确的中文气泡，松手将它击碎！<br/>小心别射偏哦，我会心疼你的连击的~</p>
          <div className="input-group">
            <input type="date" className="sling-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="sling-btn primary" onClick={fetchWords}>拉弓准备</button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="sling-wrap theme-starry">
        <div className="glass-panel center">
          <div className="loader-ring"></div>
          <p className="desc-text mt-16">正在为您捕捉太空里的单词...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="sling-wrap theme-starry">
        <div className="glass-panel center">
          <div className="icon-pulse text-red">💢</div>
          <h2 className="text-red">连接断开了</h2>
          <p className="desc-text">{errorMsg}</p>
          <button className="sling-btn outline mt-16" onClick={() => setPhase('start')}>回基地抱抱</button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const accuracy = stats.score + stats.wrong === 0 ? 0 : Math.round((stats.score / (stats.score + stats.wrong)) * 100);
    const completion = words.length === 0 ? 0 : Math.round((stats.score / words.length) * 100);
    return (
      <div className="sling-wrap theme-starry">
        <div className="glass-panel center">
          <div className="score-badge">{accuracy >= 80 ? 'S' : accuracy >= 60 ? 'A' : 'B'}</div>
          <h2 className="neon-title mt-16">狙击报告</h2>
          <p className="desc-text">
            {accuracy === 100 ? "百发百中！你简直是我的神射手！" : 
             accuracy >= 80 ? "很棒啦，只有几个气泡逃脱了你的手心~" : 
             "呜呜准星有点飘，下次我手把手教你瞄准！"}
          </p>
          <div className="stat-row">
            <div className="s-box"><span>命中率</span><strong>{accuracy}%</strong></div>
            <div className="s-box"><span>击碎数</span><strong>{stats.score}/{words.length}</strong></div>
            <div className="s-box"><span>最高连击</span><strong>{stats.maxCombo}</strong></div>
          </div>
          <div className="btn-row mt-16">
            <button className="sling-btn outline" onClick={() => setPhase('start')}>换一天</button>
            <button className="sling-btn primary" onClick={() => initGame(words)}>重新狙击</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sling-wrap game-mode">
      {/* 顶部状态栏 */}
      <div className="hud">
        <div className="health-bar">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <div key={i} className={`heart-bit ${i < stats.lives ? 'alive' : 'dead'}`}></div>
          ))}
        </div>
        <div className="combo-display">🔥 {stats.combo}</div>
        <div className="progress-display">{stats.currentIndex + 1} / {words.length}</div>
      </div>

      {/* 交互画布 */}
      <div 
        className="canvas-layer" 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas ref={canvasRef} />
        
        {/* 发射台底座指示器 */}
        {!engineRef.current.projectile.active && !mistakeCtx && (
          <div className="launch-pad-hint">
            <span>拉动我瞄准</span>
          </div>
        )}
      </div>

      {/* 娇嗔惩罚弹窗 */}
      {mistakeCtx && (
        <div className="mistake-modal">
          <div className="mistake-content">
            <div className="emoji-huge">🥺</div>
            <h3 className="text-red">哎呀！打歪啦！</h3>
            <p className="sub-text">大笨蛋，这都没瞄准！罚你仔细看一遍：</p>
            
            <div className="compare-card">
              <div className="word-main">{mistakeCtx.wordEn}</div>
              <div className="row correct">
                <span className="tag">正确目标</span>
                <span className="val">{mistakeCtx.correctZh}</span>
              </div>
              <div className="row wrong">
                <span className="tag">你砸中了</span>
                <span className="val"><strike>{mistakeCtx.caughtZh}</strike></span>
              </div>
            </div>

            <button className="sling-btn primary w-full" onClick={handleAcknowledgeMistake}>
              乖乖记住了，继续！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}