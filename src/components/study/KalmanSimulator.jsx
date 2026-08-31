import { useMemo, useState } from 'react';
import StudyMath from './StudyMath.jsx';
import StudyRichText from './StudyRichText.jsx';

const WIDTH = 820;
const HEIGHT = 300;
const PAD = { top: 22, right: 18, bottom: 28, left: 38 };
const STEPS = 48;
const ACTUAL_MEASUREMENT_VARIANCE = 4.5;

const scenarios = {
  steady: {
    label: '缓慢变化',
    description: '随机游走模型尚可近似状态变化，主要挑战来自传感器噪声。',
    truthAt: (index) => 5 + index * 0.62 + Math.sin(index * 0.24) * 1.4,
  },
  turn: {
    label: '突然加速',
    description: '在 $k=22$ 后发生变道/加速，原来的运动模型暂时失配。',
    truthAt: (index) => 5 + index * 0.52 + Math.max(0, index - 21) * 1.05 + Math.sin(index * 0.2) * 1.1,
  },
};

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

const runFilter = (processNoise, measurementNoise, scenario, seed) => {
  let estimate = scenarios[scenario].truthAt(0);
  let covariance = 4;
  const points = [];
  const noiseSamples = gaussianSamples(STEPS, seed);

  for (let index = 0; index < STEPS; index += 1) {
    const truth = scenarios[scenario].truthAt(index);
    const measurement = truth + noiseSamples[index] * Math.sqrt(ACTUAL_MEASUREMENT_VARIANCE);
    const prior = estimate;
    const priorCovariance = covariance + processNoise;
    const gain = priorCovariance / (priorCovariance + measurementNoise);
    estimate = prior + gain * (measurement - prior);
    covariance = (1 - gain) * priorCovariance;
    points.push({ truth, measurement, estimate, covariance, gain });
  }

  const rmse = (key) => Math.sqrt(
    points.reduce((sum, point) => sum + (point[key] - point.truth) ** 2, 0) / points.length,
  );
  return {
    points,
    measurementError: rmse('measurement'),
    estimateError: rmse('estimate'),
    averageGain: points.reduce((sum, point) => sum + point.gain, 0) / points.length,
    latest: points.at(-1),
  };
};

const pathFor = (points, valueAt, min, max) => {
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;
  return points.map((point, index) => {
    const x = PAD.left + (index / (points.length - 1)) * chartWidth;
    const value = valueAt(point);
    const y = PAD.top + ((max - value) / (max - min)) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
};

export default function KalmanSimulator() {
  const [processNoise, setProcessNoise] = useState(0.45);
  const [measurementNoise, setMeasurementNoise] = useState(4.5);
  const [scenario, setScenario] = useState('steady');
  const [seed, setSeed] = useState(1);
  const result = useMemo(
    () => runFilter(processNoise, measurementNoise, scenario, seed),
    [processNoise, measurementNoise, scenario, seed],
  );
  const repeatedEstimateStats = useMemo(() => {
    const runs = Array.from({ length: 24 }, (_, index) => (
      runFilter(processNoise, measurementNoise, scenario, index + 101).estimateError
    ));
    const mean = runs.reduce((sum, value) => sum + value, 0) / runs.length;
    const variance = runs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, runs.length - 1);
    return { mean, standardDeviation: Math.sqrt(variance) };
  }, [processNoise, measurementNoise, scenario]);
  const values = result.points.flatMap((point) => [
    point.truth,
    point.measurement,
    point.estimate - Math.sqrt(point.covariance) * 2,
    point.estimate + Math.sqrt(point.covariance) * 2,
  ]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;
  const xAt = (index) => PAD.left + (index / (result.points.length - 1)) * chartWidth;
  const yAt = (value) => PAD.top + ((max - value) / (max - min)) * chartHeight;
  const bandPath = `${pathFor(result.points, (point) => point.estimate + Math.sqrt(point.covariance) * 2, min, max)} ${result.points
    .slice().reverse().map((point, reverseIndex) => {
      const index = result.points.length - reverseIndex - 1;
      return `L ${xAt(index).toFixed(2)} ${yAt(point.estimate - Math.sqrt(point.covariance) * 2).toFixed(2)}`;
    }).join(' ')} Z`;

  const interpretation = result.averageGain > 0.65
    ? `当前平均增益为 $\\bar K=${result.averageGain.toFixed(3)}$：更新明显偏向新测量，响应较快，也会带入更多测量抖动。`
    : result.averageGain < 0.35
      ? `当前平均增益为 $\\bar K=${result.averageGain.toFixed(3)}$：更新保留更多先验，曲线较平滑，也更可能落后于真实变化。`
      : `当前平均增益为 $\\bar K=${result.averageGain.toFixed(3)}$：预测与测量都对更新保留了明显影响。`;

  return (
    <section className="simulator-card" data-study-step="simulator" aria-labelledby="simulator-title">
      <div className="simulator-topline">
        <span className="textbook-label">实验台 · 参数敏感性 · 真实测量方差 <StudyMath expression={`R_{\\mathrm{true}}=${ACTUAL_MEASUREMENT_VARIANCE}`} /></span>
        <button className="simulator-reset" type="button" onClick={() => setSeed((value) => value + 1)}>
          换一组测量噪声 ↻
        </button>
      </div>
      <div className="simulator-heading">
        <div>
          <h3 id="simulator-title">让 <StudyMath expression="Q" /> 和 <StudyMath expression="R" /> 负责不同的错误</h3>
          <p><StudyRichText>{scenarios[scenario].description}</StudyRichText></p>
        </div>
        <div className="simulator-scenario" role="group" aria-label="选择运动场景">
          {Object.entries(scenarios).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={scenario === key ? 'is-selected' : ''}
              onClick={() => setScenario(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <svg className="simulator-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="真实状态、传感器测量、卡尔曼估计和百分之九十五不确定性区间；横轴为离散时间 k，纵轴为状态值">
        {[0.2, 0.5, 0.8].map((ratio) => {
          const y = PAD.top + ratio * chartHeight;
          return <line key={ratio} className="chart-grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />;
        })}
        <line className="chart-axis" x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
        <line className="chart-axis" x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} />
        <path className="chart-band" d={bandPath} />
        <path className="chart-truth" d={pathFor(result.points, (point) => point.truth, min, max)} />
        <path className="chart-estimate" d={pathFor(result.points, (point) => point.estimate, min, max)} />
        {result.points.map((point, index) => (
          <circle key={index} className="chart-measurement" cx={xAt(index)} cy={yAt(point.measurement)} r="3" />
        ))}
        <text className="chart-axis-label" x={PAD.left + 5} y={PAD.top + 13}>状态值 <tspan className="chart-axis-math">xₖ</tspan></text>
        <text className="chart-axis-label" x={PAD.left} y={HEIGHT - 8}>k=0</text>
        <text className="chart-axis-label" x={WIDTH - PAD.right} y={HEIGHT - 8} textAnchor="end">k={STEPS - 1}</text>
      </svg>

      <div className="simulator-legend" aria-hidden="true">
        <span className="legend-measurement">测量 <StudyMath expression="z_k" /></span>
        <span className="legend-truth">真实状态 <StudyMath expression="x_k" /></span>
        <span className="legend-estimate">估计 <StudyMath expression={'\\hat x_{k|k}'} /></span>
        <span className="legend-band"><StudyMath expression={'\\pm2\\sigma_k'} /> 置信带</span>
      </div>

      <div className="simulator-controls">
        <label>
          <span>滤波器假设的过程噪声 <StudyMath expression={`Q=${processNoise.toFixed(2)}`} /></span>
          <input type="range" min="0.02" max="3" step="0.01" value={processNoise} onChange={(event) => setProcessNoise(Number(event.target.value))} />
          <small>模型对真实运动的无知程度（状态单位²）</small>
        </label>
        <label>
          <span>滤波器假设的测量噪声 <StudyMath expression={`R=${measurementNoise.toFixed(1)}`} /></span>
          <input type="range" min="0.2" max="14" step="0.1" value={measurementNoise} onChange={(event) => setMeasurementNoise(Number(event.target.value))} />
          <small>传感器误差的方差（状态单位²）</small>
        </label>
      </div>

      <div className="simulator-stats" aria-live="polite">
        <div><span>本次测量 <StudyMath expression={'\\operatorname{RMSE}(z)'} /></span><StudyMath expression={result.measurementError.toFixed(2)} /></div>
        <div><span>本次估计 <StudyMath expression={'\\operatorname{RMSE}(\\hat x)'} /></span><StudyMath expression={result.estimateError.toFixed(2)} /></div>
        <div><span>24 次平均估计 RMSE</span><StudyMath expression={repeatedEstimateStats.mean.toFixed(2)} /><small>样本标准差 ±{repeatedEstimateStats.standardDeviation.toFixed(2)}</small></div>
        <div><span>平均 <StudyMath expression={'\\bar K'} /></span><StudyMath expression={result.averageGain.toFixed(3)} /></div>
        <div><span>末步 <StudyMath expression={'\\sigma'} /></span><StudyMath expression={Math.sqrt(result.latest.covariance).toFixed(2)} /></div>
      </div>
      <p className="simulator-interpretation"><b>读图提示：</b><StudyRichText>{interpretation}</StudyRichText> 调参时测量点保持不变，因此你看到的是滤波器信念的改变。置信带表达的是滤波器自己的不确定性，不是“真实值一定在里面”的保证。</p>
    </section>
  );
}
