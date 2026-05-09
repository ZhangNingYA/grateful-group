import { useState, useEffect, useCallback } from 'react';

const CARDS = [
  {
    id: 1,
    tag: '填空 [2]',
    title: '可数名词复数 — jobs',
    color: '#3b82f6',
    emoji: '📦',
    sentence: 'This problem of ___ for graduates.',
    answer: 'jobs',
    wrong: 'job',
    explanation: 'job 是可数名词，泛指"工作岗位"时没有 a/the 限定，必须用复数 jobs。',
    rule: '可数名词泛指时 → 必须用复数形式',
    examples: [
      { text: 'I need a job.', note: '一份工作 → 单数+冠词' },
      { text: 'There are no jobs.', note: '泛指多份 → 复数' },
    ],
  },
  {
    id: 2,
    tag: '填空 [5]',
    title: '副词修饰动词 — confusedly',
    color: '#8b5cf6',
    emoji: '🔮',
    sentence: 'universities panic and ___ .',
    answer: 'confusedly',
    wrong: 'confused',
    explanation: '此处修饰动词 panic，需要副词形式。confused(形容词) → confusedly(副词)。',
    rule: '修饰动词 → 用副词（形容词 + ly）',
    examples: [
      { text: 'She spoke softly.', note: 'softly 修饰动词 spoke' },
      { text: 'He ran quickly.', note: 'quickly 修饰动词 ran' },
    ],
  },
  {
    id: 3,
    tag: '填空 [7]',
    title: '现在完成时 — has carried',
    color: '#059669',
    emoji: '⏳',
    sentence: 'our government ___ carried out a policy...',
    answer: 'has carried',
    wrong: 'carried',
    explanation: '现在完成时 has/have + 过去分词，表示过去的动作对现在有影响。主语 government 是单数用 has。',
    rule: 'has/have + 过去分词 = 现在完成时',
    examples: [
      { text: 'She has finished her work.', note: '已完成 → 对现在有影响' },
      { text: 'They have lived here for 10 years.', note: '持续到现在' },
    ],
  },
  {
    id: 4,
    tag: '填空 [8]',
    title: '可数名词不能裸奔 — schools into universities',
    color: '#dc2626',
    emoji: '🏫',
    sentence: 'absorbs more students from middle ___ into ___',
    answer: 'schools / universities',
    wrong: 'school / university',
    explanation: '可数名词 school 和 university 泛指多所时必须用复数，不能单独使用单数形式。',
    rule: '可数名词不能"裸奔"：要么加冠词(a/the)，要么用复数',
    examples: [
      { text: 'I go to a school.', note: '单数 + 冠词 a' },
      { text: 'Many schools are closed.', note: '泛指多所 → 复数' },
    ],
  },
  {
    id: 5,
    tag: '填空 [9]',
    title: '序数词 — second / in the second place',
    color: '#ea580c',
    emoji: '🥈',
    sentence: '___ , lots of courses which set up...',
    answer: 'second / in the second place',
    wrong: 'two',
    explanation: '"其次"用 second 或 in the second place，不能用基数词 two。与 first and foremost 对应。',
    rule: '列举论点：first(ly) → second(ly) → last but not least',
    examples: [
      { text: 'First and foremost, ...', note: '首先' },
      { text: 'In the second place, ...', note: '其次' },
    ],
  },
  {
    id: 6,
    tag: '改错 [2]',
    title: '物主代词 — their own',
    color: '#0891b2',
    emoji: '👤',
    sentence: 'everybody has ___ opinions.',
    answer: 'their own',
    wrong: 'individuals',
    explanation: '修饰名词 opinions 需要形容词性物主代词 their，加 own 强调"各自的"。individuals 是名词不能直接修饰名词。',
    rule: '物主代词(my/your/their...) + 名词',
    examples: [
      { text: 'This is their own choice.', note: 'their own = 他们自己的' },
      { text: 'Everyone has his/her own style.', note: '物主代词修饰名词' },
    ],
  },
  {
    id: 7,
    tag: '改错 [4]',
    title: '副词修饰动词 — selectively',
    color: '#7c3aed',
    emoji: '🎯',
    sentence: 'Some people think that we should read [3] books ___.',
    answer: 'selectively',
    wrong: 'selective',
    explanation: '修饰动词 read 需要副词。selective(形容词:有选择的) → selectively(副词:有选择地)。',
    rule: '动词 + 副词（不是形容词！）',
    examples: [
      { text: 'Read selectively.', note: 'selectively 修饰 read' },
      { text: 'Think carefully.', note: 'carefully 修饰 think' },
    ],
  },
  {
    id: 8,
    tag: '改错 [5]',
    title: '可数名词复数 — reasons',
    color: '#be185d',
    emoji: '📝',
    sentence: 'There are some ___ for reading books selectively.',
    answer: 'reasons',
    wrong: 'reason',
    explanation: 'some 后接可数名词必须用复数。There are 也暗示复数。',
    rule: 'some + 可数名词复数 / some + 不可数名词',
    examples: [
      { text: 'some reasons / some books', note: '可数 → 复数' },
      { text: 'some water / some advice', note: '不可数 → 原形' },
    ],
  },
  {
    id: 9,
    tag: '改错 [7]',
    title: '现在分词作结果状语 — making it impossible',
    color: '#4338ca',
    emoji: '🌊',
    sentence: 'more and more books are published, ___ for us to read all.',
    answer: 'making it impossible',
    wrong: 'It is impossible',
    explanation: '用现在分词短语连接前后句，表示自然而然的结果，使行文更流畅。不能直接用逗号连接两个独立句子。',
    rule: '..., V-ing ... = 现在分词作结果状语',
    examples: [
      { text: 'The rain kept falling, making the road slippery.', note: '自然结果' },
      { text: 'He studied hard, earning a scholarship.', note: '努力的结果' },
    ],
  },
  {
    id: 10,
    tag: '改错 [8]',
    title: '从句连接词 — for the reason that',
    color: '#b45309',
    emoji: '🔗',
    sentence: 'It is impossible for us to read all the books ___ ...',
    answer: 'for the reason that',
    wrong: 'for the reason (无 that)',
    explanation: 'for the reason that 引导原因状语从句，that 不能省略，后面必须接完整的句子（有主语+谓语）。',
    rule: 'for the reason that + 完整从句',
    examples: [
      { text: 'because + 从句', note: '最常用' },
      { text: 'for the reason that + 从句', note: '较正式' },
      { text: 'due to + 名词/动名词', note: '介词短语' },
    ],
  },
];

// Animated flip card component
function FlipCard({ card, isFlipped, onFlip }) {
  return (
    <div
      className="gc-card-wrapper"
      onClick={onFlip}
      style={{ '--card-color': card.color }}
    >
      <div className={`gc-card ${isFlipped ? 'gc-card-flipped' : ''}`}>
        {/* Front */}
        <div className="gc-card-front">
          <div className="gc-card-tag">{card.tag}</div>
          <div className="gc-card-emoji">{card.emoji}</div>
          <h3 className="gc-card-title">{card.title}</h3>
          <div className="gc-card-sentence">
            {card.sentence.split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="gc-blank">______</span>}
              </span>
            ))}
          </div>
          <div className="gc-card-hint">👆 点击翻转查看解析</div>
        </div>
        {/* Back */}
        <div className="gc-card-back">
          <div className="gc-card-tag">{card.tag}</div>
          <div className="gc-answer-section">
            <div className="gc-answer-wrong">✗ {card.wrong}</div>
            <div className="gc-answer-right">✓ {card.answer}</div>
          </div>
          <p className="gc-explanation">{card.explanation}</p>
          <div className="gc-rule-box">
            <span className="gc-rule-icon">💡</span>
            <span>{card.rule}</span>
          </div>
          <div className="gc-examples">
            {card.examples.map((ex, i) => (
              <div key={i} className="gc-example-item">
                <span className="gc-example-text">{ex.text}</span>
                <span className="gc-example-note">{ex.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quiz mode component
function QuizMode({ cards, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const current = cards[currentIdx];

  const options = useCallback(() => {
    // Generate 3 options: correct + 2 wrong
    const correct = current.answer;
    const wrongs = cards
      .filter((c) => c.id !== current.id)
      .map((c) => c.wrong)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    return [correct, ...wrongs].sort(() => Math.random() - 0.5);
  }, [current, cards]);

  const [opts, setOpts] = useState(() => options());

  useEffect(() => {
    setOpts(options());
    setSelected(null);
    setShowResult(false);
  }, [currentIdx, options]);

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    setShowResult(true);
    if (opt === current.answer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (currentIdx + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 1500);
  };

  if (finished) {
    const pct = Math.round((score / cards.length) * 100);
    return (
      <div className="gc-quiz-result">
        <div className="gc-quiz-result-emoji">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}
        </div>
        <h3>测验结束！</h3>
        <p className="gc-quiz-score">
          {score} / {cards.length} 正确 ({pct}%)
        </p>
        <p>{pct >= 80 ? '太棒了！掌握得很好！' : pct >= 50 ? '还不错，再复习一下吧！' : '需要多看几遍哦！'}</p>
        <button className="gc-btn gc-btn-primary" onClick={onExit}>
          返回学习
        </button>
      </div>
    );
  }

  return (
    <div className="gc-quiz">
      <div className="gc-quiz-header">
        <span className="gc-quiz-progress">
          {currentIdx + 1} / {cards.length}
        </span>
        <span className="gc-quiz-score-live">得分: {score}</span>
      </div>
      <div className="gc-quiz-card" style={{ '--card-color': current.color }}>
        <div className="gc-quiz-emoji">{current.emoji}</div>
        <h4>{current.title}</h4>
        <div className="gc-quiz-sentence">
          {current.sentence.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <span className="gc-blank-quiz">?</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="gc-quiz-options">
        {opts.map((opt) => (
          <button
            key={opt}
            className={`gc-quiz-opt ${
              showResult
                ? opt === current.answer
                  ? 'gc-opt-correct'
                  : opt === selected
                  ? 'gc-opt-wrong'
                  : ''
                : selected === opt
                ? 'gc-opt-selected'
                : ''
            }`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="gc-quiz-explain">
          <p>{current.explanation}</p>
        </div>
      )}
    </div>
  );
}

// Main component
export default function GrammarCards() {
  const [mode, setMode] = useState('cards'); // cards | quiz
  const [flippedCards, setFlippedCards] = useState({});
  const [filter, setFilter] = useState('all'); // all | fill | correct

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCards =
    filter === 'all'
      ? CARDS
      : filter === 'fill'
      ? CARDS.filter((c) => c.tag.startsWith('填空'))
      : CARDS.filter((c) => c.tag.startsWith('改错'));

  if (mode === 'quiz') {
    return (
      <div className="gc-container">
        <QuizMode cards={CARDS} onExit={() => setMode('cards')} />
      </div>
    );
  }

  return (
    <div className="gc-container">
      {/* Header */}
      <div className="gc-header">
        <h2 className="gc-main-title">
          <span className="gc-title-icon">📖</span>
          英语语法知识点
        </h2>
        <p className="gc-main-subtitle">点击卡片翻转查看详细解析 | 共 {CARDS.length} 个知识点</p>
      </div>

      {/* Controls */}
      <div className="gc-controls">
        <div className="gc-filter-group">
          <button
            className={`gc-filter-btn ${filter === 'all' ? 'gc-filter-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`gc-filter-btn ${filter === 'fill' ? 'gc-filter-active' : ''}`}
            onClick={() => setFilter('fill')}
          >
            填空题
          </button>
          <button
            className={`gc-filter-btn ${filter === 'correct' ? 'gc-filter-active' : ''}`}
            onClick={() => setFilter('correct')}
          >
            改错题
          </button>
        </div>
        <button className="gc-btn gc-btn-quiz" onClick={() => setMode('quiz')}>
          🧠 开始测验
        </button>
      </div>

      {/* Cards grid */}
      <div className="gc-grid">
        {filteredCards.map((card, index) => (
          <FlipCard
            key={card.id}
            card={card}
            isFlipped={!!flippedCards[card.id]}
            onFlip={() => toggleFlip(card.id)}
          />
        ))}
      </div>

      {/* Summary table */}
      <div className="gc-summary">
        <h3 className="gc-summary-title">📋 速记表</h3>
        <div className="gc-table-wrap">
          <table className="gc-table">
            <thead>
              <tr>
                <th>规则</th>
                <th>要点</th>
                <th>示例</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>可数名词复数</td>
                <td>泛指时必须用复数</td>
                <td>jobs, schools, reasons</td>
              </tr>
              <tr>
                <td>副词修饰动词</td>
                <td>形容词 + ly = 副词</td>
                <td>selectively, confusedly</td>
              </tr>
              <tr>
                <td>现在完成时</td>
                <td>has/have + 过去分词</td>
                <td>has carried out</td>
              </tr>
              <tr>
                <td>物主代词</td>
                <td>their/my/your + 名词</td>
                <td>their own opinions</td>
              </tr>
              <tr>
                <td>现在分词作状语</td>
                <td>..., V-ing（表结果）</td>
                <td>making it impossible</td>
              </tr>
              <tr>
                <td>从句连接词</td>
                <td>that 不能省略</td>
                <td>for the reason that...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
