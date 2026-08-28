import { useMemo, useState } from 'react';

const WIDTH = 760;
const HEIGHT = 270;
const PAD = { top: 18, right: 18, bottom: 24, left: 34 };
const STEPS = 42;

const pseudoNoise = (index, phase = 0) => (
  Math.sin(index * 12.9898 + phase) * 0.62
  + Math.sin(index * 4.141 + phase * 2) * 0.28
);

const runFilter = (processNoise, measurementNoise) => {
  let estimate = 0;
  let covariance = 1;
  const points = [];
  let gain = 0;

  for (let index = 0; index < STEPS; index += 1) {
    const truth = 4 + index * 0.72 + Math.sin(index * 0.31) * 1.8;
    const measurement = truth + pseudoNoise(index, 0.7) * Math.sqrt(measurementNoise) * 1.9;

    covariance += processNoise;
    gain = covariance / (covariance + measurementNoise);
    estimate += gain * (measurement - estimate);
    covariance *= 1 - gain;

    points.push({ truth, measurement, estimate, gain });
  }

  const measurementError = Math.sqrt(
    points.reduce((sum, point) => sum + (point.measurement - point.truth) ** 2, 0) / points.length,
  );
  const estimateError = Math.sqrt(
    points.reduce((sum, point) => sum + (point.estimate - point.truth) ** 2, 0) / points.length,
  );

  return {
    points,
    gain,
    measurementError,
    estimateError,
    latest: points.at(-1),
  };
};

const pathFor = (points, key, min, max) => {
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;
  return points
    .map((point, index) => {
      const x = PAD.left + (index / (points.length - 1)) * chartWidth;
      const y = PAD.top + ((max - point[key]) / (max - min)) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export default function KalmanSimulator() {
  const [processNoise, setProcessNoise] = useState(0.32);
  const [measurementNoise, setMeasurementNoise] = useState(4.2);
  const result = useMemo(
    () => runFilter(processNoise, measurementNoise),
    [processNoise, measurementNoise],
  );

  const values = result.points.flatMap((point) => [point.truth, point.measurement, point.estimate]);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const chartWidth = WIDTH - PAD.left - PAD.right;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;

  return (
    <section className="study-simulator" data-study-step="simulator" aria-labelledby="simulator-title">
      <div className="study-simulator-header">
        <div>
          <p className="study-section-kicker">Experiment 01 / Scalar filter</p>
          <h3 id="simulator-title">让估计值和噪声正面相遇</h3>
        </div>
        <p>先不要背公式。调节两个噪声，观察算法在“相信模型”和“相信测量”之间如何取舍。</p>
      </div>

      <svg
        className="study-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="真实位置、带噪声测量值和卡尔曼估计值的曲线对比"
      >
        {[0.2, 0.5, 0.8].map((ratio) => {
          const y = PAD.top + ratio * chartHeight;
          return <line key={ratio} className="study-chart-grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />;
        })}
        <line className="study-chart-grid" x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
        <line className="study-chart-grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} />
        <path className="study-chart-true" d={pathFor(result.points, 'truth', min, max)} />
        <path className="study-chart-estimate" d={pathFor(result.points, 'estimate', min, max)} />
        {result.points.map((point, index) => {
          const x = PAD.left + (index / (result.points.length - 1)) * chartWidth;
          const y = PAD.top + ((max - point.measurement) / (max - min)) * chartHeight;
          return <circle key={index} className="study-chart-measurement" cx={x} cy={y} r="3.1" />;
        })}
      </svg>

      <div className="study-sim-legend" aria-hidden="true">
        <span className="legend-measurement">传感器测量</span>
        <span className="legend-true">真实状态</span>
        <span className="legend-estimate">滤波估计</span>
      </div>

      <div className="study-sim-controls">
        <label>
          <span className="study-range-label"><span>过程噪声 Q</span><strong>{processNoise.toFixed(2)}</strong></span>
          <input
            className="study-range"
            type="range"
            min="0.01"
            max="1.5"
            step="0.01"
            value={processNoise}
            onChange={(event) => setProcessNoise(Number(event.target.value))}
          />
        </label>
        <label>
          <span className="study-range-label"><span>测量噪声 R</span><strong>{measurementNoise.toFixed(1)}</strong></span>
          <input
            className="study-range"
            type="range"
            min="0.2"
            max="12"
            step="0.1"
            value={measurementNoise}
            onChange={(event) => setMeasurementNoise(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="study-sim-stats">
        <div className="study-sim-stat"><span>测量 RMSE</span><strong>{result.measurementError.toFixed(2)}</strong></div>
        <div className="study-sim-stat"><span>估计 RMSE</span><strong>{result.estimateError.toFixed(2)}</strong></div>
        <div className="study-sim-stat"><span>最后 Kalman Gain</span><strong>{result.gain.toFixed(3)}</strong></div>
      </div>
    </section>
  );
}
