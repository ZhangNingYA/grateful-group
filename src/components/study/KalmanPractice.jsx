import { useEffect, useMemo, useState } from 'react';
import StudyMath from './StudyMath.jsx';
import StudyRichText from './StudyRichText.jsx';

const exercises = [
  {
    id: 'position-update',
    label: '练习 A · 位置更新',
    title: '把一次新测量放回公式链',
    description: '用一组新数据完成整条更新链。先在纸上计算，再把五个中间量填入输入框。',
    values: { prior: 8, priorVariance: 3, measurement: 10.5, measurementVariance: 2 },
    answers: { innovation: 2.5, innovationVariance: 5, gain: 0.6, posterior: 9.5, posteriorVariance: 1.2 },
    hints: [
      '先分别计算 $y=z-\\hat x^-$ 与 $S=P^-+R$，不要混淆二者单位。',
      '再用 $K=P^-/S$；标量正方差模型中结果应落在 $0$ 与 $1$ 之间。',
      '最后同时更新均值和方差：$\\hat x^+=\\hat x^-+Ky$，$P^+=(1-K)P^-$。',
    ],
    solution: [
      ['y=z-\\hat x^-', '10.5-8=2.5\\,\\mathrm m'],
      ['S=P^-+R', '3+2=5\\,\\mathrm m^2'],
      ['K=P^-/S', '3/5=0.600'],
      ['\\hat x^+=\\hat x^-+Ky', '8+0.6\\times2.5=9.5\\,\\mathrm m'],
      ['P^+=(1-K)P^-', '(1-0.6)\\times3=1.2\\,\\mathrm m^2'],
    ],
  },
  {
    id: 'cautious-update',
    label: '练习 B · 不太可靠的传感器',
    title: '观察较大的 $R$ 如何改变结果',
    description: '预测已经相当确定，而传感器噪声较大。计算后检查后验是否明显靠近测量。',
    values: { prior: 4.5, priorVariance: 0.8, measurement: 5.7, measurementVariance: 2 },
    answers: { innovation: 1.2, innovationVariance: 2.8, gain: 0.2857, posterior: 4.8429, posteriorVariance: 0.5714 },
    hints: [
      '先标出两端：先验均值是 $4.5$，测量是 $5.7$；后验必须落在两者之间。',
      '$R=2$ 比 $P^-=0.8$ 大，说明传感器更不确定，因此 $K$ 应小于 $0.5$。',
      '把结果保留到小数点后 $3$ 位即可；最后用 $P^+<P^-$ 做一致性检查。',
    ],
    solution: [
      ['y=z-\\hat x^-', '5.7-4.5=1.2'],
      ['S=P^-+R', '0.8+2=2.8'],
      ['K=P^-/S', '0.8/2.8\\approx0.286'],
      ['\\hat x^+=\\hat x^-+Ky', '4.5+0.286\\times1.2\\approx4.843'],
      ['P^+=(1-K)P^-', '(1-0.286)\\times0.8\\approx0.571'],
    ],
  },
];

const fields = [
  ['innovation', '创新', 'y_k', '例如 2'],
  ['innovationVariance', '创新方差', 'S_k', '例如 5'],
  ['gain', '卡尔曼增益', 'K_k', '例如 0.4'],
  ['posterior', '后验均值', '\\hat x_k^+', '例如 10.8'],
  ['posteriorVariance', '后验方差', 'P_k^+', '例如 1.2'],
];

const closeEnough = (actual, expected) => Number.isFinite(actual) && Math.abs(actual - expected) <= 0.012;

export default function KalmanPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const emptyAnswers = () => Object.fromEntries(fields.map(([key]) => [key, '']));
  const [answers, setAnswers] = useState(emptyAnswers);
  const [checked, setChecked] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const exercise = useMemo(() => exercises[exerciseIndex], [exerciseIndex]);

  useEffect(() => {
    setAnswers(emptyAnswers());
    setChecked(false);
    setHintCount(0);
    setShowSolution(false);
  }, [exerciseIndex]);

  const updateAnswer = (key, value) => {
    setChecked(false);
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const checkAnswers = (event) => {
    event.preventDefault();
    setChecked(true);
  };

  const correctCount = fields.reduce((count, [key]) => {
    const actual = Number(answers[key]);
    return count + (closeEnough(actual, exercise.answers[key]) ? 1 : 0);
  }, 0);

  return (
    <section className="kalman-practice" data-study-step="practice" data-study-practice="kalman-scalar" aria-labelledby="kalman-practice-title">
      <div className="practice-header">
        <div>
          <span className="textbook-label">{exercise.label} · 先算后看</span>
          <h3 id="kalman-practice-title"><StudyRichText>{exercise.title}</StudyRichText></h3>
        </div>
        <span className="practice-index">{exerciseIndex + 1} / {exercises.length}</span>
      </div>
      <p className="practice-description">{exercise.description}</p>

      <div className="practice-givens" aria-label="题目给定数据">
        <div><span>先验均值</span><StudyMath expression={`\\hat x_k^-=${exercise.values.prior}`} /></div>
        <div><span>先验方差</span><StudyMath expression={`P_k^-=${exercise.values.priorVariance}`} /></div>
        <div><span>测量</span><StudyMath expression={`z_k=${exercise.values.measurement}`} /></div>
        <div><span>测量方差</span><StudyMath expression={`R=${exercise.values.measurementVariance}`} /></div>
      </div>

      <div className="practice-route" aria-label="计算路线">
        <span><b>①</b> 先算 <StudyMath expression="y_k" /></span>
        <i aria-hidden="true">→</i>
        <span><b>②</b> 再算 <StudyMath expression="S_k" /></span>
        <i aria-hidden="true">→</i>
        <span><b>③</b> 得到 <StudyMath expression="K_k" /></span>
        <i aria-hidden="true">→</i>
        <span><b>④</b> 更新 <StudyMath expression={'\\hat x_k^+'} /></span>
        <i aria-hidden="true">→</i>
        <span><b>⑤</b> 更新 <StudyMath expression={'P_k^+'} /></span>
      </div>

      <form className="practice-form" onSubmit={checkAnswers}>
        {fields.map(([key, label, formula, placeholder]) => (
          <label key={key}>
            <span>{label} <StudyMath expression={formula} /></span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={answers[key]}
              placeholder={placeholder}
              onChange={(event) => updateAnswer(key, event.target.value)}
              aria-label={`${label} ${formula}`}
            />
          </label>
        ))}
        <button className="practice-check" type="submit">检查这五步</button>
      </form>

      <div className="practice-feedback" aria-live="polite">
        {checked && correctCount === fields.length && <p className="practice-success">五步都对了。结构检查也通过：后验均值位于先验与测量之间，且 <StudyMath expression="P_k^+<P_k^-" />。</p>}
        {checked && correctCount < fields.length && <p className="practice-warn">目前答对了 {correctCount} / {fields.length} 步。先看提示，再重新计算；不要急着打开答案。</p>}
      </div>

      <div className="practice-actions">
        <button type="button" className="practice-hint-button" onClick={() => setHintCount((count) => Math.min(count + 1, exercise.hints.length))} disabled={hintCount >= exercise.hints.length}>
          {hintCount >= exercise.hints.length ? '提示已全部展开' : `展开第 ${hintCount + 1} 个提示`}
        </button>
        <button type="button" className="practice-solution-button" onClick={() => setShowSolution((value) => !value)}>
          {showSolution ? '收起分步答案' : '最后再看分步答案'}
        </button>
        <button type="button" className="practice-next-button" onClick={() => setExerciseIndex((index) => (index + 1) % exercises.length)}>
          换一道题 →
        </button>
      </div>

      {hintCount > 0 && (
        <ol className="practice-hints">
          {exercise.hints.slice(0, hintCount).map((hint, index) => <li key={hint}><b>提示 {index + 1}</b><span><StudyRichText>{hint}</StudyRichText></span></li>)}
        </ol>
      )}

      {showSolution && (
        <div className="practice-solution">
          <div className="practice-solution-head"><strong>分步答案</strong><span>把每一行和上面的计算路线对应起来</span></div>
          <div className="practice-solution-grid">
            {exercise.solution.map(([formula, value], index) => (
              <div key={formula}>
                <span>{index + 1}</span>
                <StudyMath expression={formula} display />
                <StudyMath expression={value} />
              </div>
            ))}
          </div>
          <div className="practice-mistakes"><strong>常见错误</strong><ul><li>把标准差直接当成方差填入 <StudyMath expression="R" />。</li><li>把 <StudyMath expression="K_k" /> 乘在测量上，而不是乘在创新 <StudyMath expression="y_k" /> 上。</li><li>算出后验均值跑到先验和测量之外，却没有回头检查符号。</li></ul></div>
        </div>
      )}
    </section>
  );
}
