import { useMemo, useState } from 'react';
import StudyMath from './StudyMath.jsx';

const WIDTH = 760;
const HEIGHT = 220;
const PAD = { top: 18, right: 16, bottom: 24, left: 34 };
const SAMPLE_COUNT = 48;

const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const gaussianSamples = (count, seed) => {
  const random = seededRandom(seed);
  const samples = [];
  while (samples.length < count) {
    const first = Math.max(random(), Number.EPSILON);
    const second = random();
    const radius = Math.sqrt(-2 * Math.log(first));
    samples.push(radius * Math.cos(2 * Math.PI * second));
    if (samples.length < count) samples.push(radius * Math.sin(2 * Math.PI * second));
  }
  return samples;
};

const correlatedSamples = () => {
  const noise = gaussianSamples(SAMPLE_COUNT, 47);
  const correlation = 0.82;
  let previous = 0;
  return noise.map((value) => {
    previous = correlation * previous + Math.sqrt(1 - correlation ** 2) * value;
    return previous;
  });
};

const cases = [
  {
    id: 'a',
    label: '案例 A',
    answer: 'normal',
    values: gaussianSamples(SAMPLE_COUNT, 11),
    feedback: '均值、平均 NIS 和一阶自相关都接近理论目标，没有明显的系统性失配信号。',
  },
  {
    id: 'b',
    label: '案例 B',
    answer: 'bias',
    values: gaussianSamples(SAMPLE_COUNT, 23).map((value) => value + 1.25),
    feedback: '创新整体偏离零轴，首先应检查传感器偏置、模型偏置或遗漏的慢变状态。',
  },
  {
    id: 'c',
    label: '案例 C',
    answer: 'correlation',
    values: correlatedSamples(),
    feedback: '创新会连续多步保持相似方向，一阶自相关明显偏高，说明模型仍漏掉了可预测动态。',
  },
  {
    id: 'd',
    label: '案例 D',
    answer: 'scale',
    values: gaussianSamples(SAMPLE_COUNT, 71).map((value) => value * 1.9),
    feedback: '创新均值可以接近零，但平均 NIS 明显大于 1，说明滤波器低估了创新应有的方差。',
  },
];

const choices = [
  ['normal', '统计上基本一致'],
  ['bias', '存在长期偏置'],
  ['correlation', '存在时间相关'],
  ['scale', '低估了不确定性'],
];

const summarize = (values) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const centered = values.map((value) => value - mean);
  const energy = centered.reduce((sum, value) => sum + value ** 2, 0);
  const lagProduct = centered.slice(1).reduce(
    (sum, value, index) => sum + value * centered[index],
    0,
  );
  return {
    mean,
    meanNis: values.reduce((sum, value) => sum + value ** 2, 0) / values.length,
    lagOne: energy ? lagProduct / energy : 0,
  };
};

export default function KalmanDiagnosticsLab() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [checked, setChecked] = useState(false);
  const activeCase = cases[caseIndex];
  const metrics = useMemo(() => summarize(activeCase.values), [activeCase]);
  const limit = Math.max(3, ...activeCase.values.map((value) => Math.abs(value))) + 0.35;
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;
  const xAt = (index) => PAD.left + (index / (activeCase.values.length - 1)) * chartWidth;
  const yAt = (value) => PAD.top + ((limit - value) / (2 * limit)) * chartHeight;
  const path = activeCase.values.map((value, index) => (
    `${index === 0 ? 'M' : 'L'} ${xAt(index).toFixed(2)} ${yAt(value).toFixed(2)}`
  )).join(' ');

  const chooseCase = (index) => {
    setCaseIndex(index);
    setSelected('');
    setChecked(false);
  };

  return (
    <section className="diagnostics-lab" aria-labelledby="diagnostics-lab-title">
      <div className="diagnostics-lab-heading">
        <div>
          <span className="textbook-label">诊断实验 · 标量创新 · 假设 <StudyMath expression="S_k=1" /></span>
          <h3 id="diagnostics-lab-title">只看统计特征，判断滤波器哪里不对</h3>
        </div>
        <p>每个案例包含 48 步创新。先看零轴、平均 NIS 和一阶自相关，再选择判断。</p>
      </div>

      <div className="diagnostics-case-tabs" role="group" aria-label="选择创新诊断案例">
        {cases.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === caseIndex ? 'is-selected' : ''}
            onClick={() => chooseCase(index)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <svg
        className="diagnostics-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${activeCase.label} 创新序列，均值 ${metrics.mean.toFixed(2)}，平均 NIS ${metrics.meanNis.toFixed(2)}，一阶自相关 ${metrics.lagOne.toFixed(2)}`}
      >
        <rect className="diagnostics-one-sigma" x={PAD.left} y={yAt(1)} width={chartWidth} height={yAt(-1) - yAt(1)} />
        <line className="diagnostics-zero" x1={PAD.left} x2={WIDTH - PAD.right} y1={yAt(0)} y2={yAt(0)} />
        <path className="diagnostics-path" d={path} />
        {activeCase.values.map((value, index) => (
          <circle key={`${activeCase.id}-${index}`} className="diagnostics-point" cx={xAt(index)} cy={yAt(value)} r="2.5" />
        ))}
      </svg>

      <div className="diagnostics-metrics" aria-live="polite">
        <div><span>创新均值</span><strong>{metrics.mean.toFixed(2)}</strong><small>目标：接近 0</small></div>
        <div><span>平均 NIS</span><strong>{metrics.meanNis.toFixed(2)}</strong><small>目标：接近 1</small></div>
        <div><span>一阶自相关</span><strong>{metrics.lagOne.toFixed(2)}</strong><small>目标：接近 0</small></div>
      </div>

      <div className="diagnostics-question">
        <strong>你的判断</strong>
        <div className="diagnostics-choices">
          {choices.map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="diagnostics-lab-answer"
                value={value}
                checked={selected === value}
                onChange={() => {
                  setSelected(value);
                  setChecked(false);
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button type="button" disabled={!selected} onClick={() => setChecked(true)}>检查判断</button>
        {checked && (
          <p className={selected === activeCase.answer ? 'is-correct' : 'is-wrong'} role="status">
            {selected === activeCase.answer ? '判断正确。' : '还不吻合。'}{activeCase.feedback}
          </p>
        )}
      </div>
    </section>
  );
}
