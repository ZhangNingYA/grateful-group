import { useMemo, useState } from 'react';
import StudyMath from './StudyMath.jsx';

const observations = [8.4, 11.1, 9.8, 13.7, 12.8, 16.2, 15.3, 18.5, 18.1, 21.4];
const runScalarFilter = (processNoise, measurementNoise) => {
  let estimate = 0;
  let variance = 4;

  return observations.map((measurement, index) => {
    const prior = estimate;
    const priorVariance = variance + processNoise;
    const innovation = measurement - prior;
    const innovationVariance = priorVariance + measurementNoise;
    const gain = priorVariance / innovationVariance;
    estimate = prior + gain * innovation;
    variance = (1 - gain) * priorVariance;

    return {
      step: index + 1,
      measurement,
      prior,
      priorVariance,
      innovation,
      innovationVariance,
      gain,
      estimate,
      variance,
    };
  });
};

const format = (value) => value.toFixed(2);

export default function KalmanStepExplorer() {
  const [processNoise, setProcessNoise] = useState(0.8);
  const [measurementNoise, setMeasurementNoise] = useState(4);
  const [step, setStep] = useState(0);
  const steps = useMemo(
    () => runScalarFilter(processNoise, measurementNoise),
    [processNoise, measurementNoise],
  );
  const current = steps[step];
  const uncertainty = Math.sqrt(current.variance);
  const priorUncertainty = Math.sqrt(current.priorVariance);
  const scaleMin = Math.min(current.prior, current.measurement, current.estimate) - 3;
  const scaleMax = Math.max(current.prior, current.measurement, current.estimate) + 3;
  const position = (value) => `${((value - scaleMin) / (scaleMax - scaleMin)) * 100}%`;
  const intervalWidth = (standardDeviation) => `${Math.min(100, (standardDeviation * 4 / (scaleMax - scaleMin)) * 100)}%`;

  return (
    <section className="step-explorer" data-study-step="step-explorer" aria-labelledby="step-explorer-title">
      <div className="step-explorer-head">
        <div>
          <span className="textbook-label">可交互推导 · 逐步计算</span>
          <h3 id="step-explorer-title">把第 <StudyMath expression={String(current.step)} /> 次更新拆开看</h3>
        </div>
        <p>拖动时间轴。每一步都只做两件事：先预测，再用测量修正。</p>
      </div>

      <div className="step-explorer-controls">
        <label>
          <span>过程噪声 <StudyMath expression={`Q=${processNoise.toFixed(1)}`} /></span>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={processNoise}
            onChange={(event) => setProcessNoise(Number(event.target.value))}
          />
        </label>
        <label>
          <span>测量噪声 <StudyMath expression={`R=${measurementNoise.toFixed(1)}`} /></span>
          <input
            type="range"
            min="0.5"
            max="12"
            step="0.5"
            value={measurementNoise}
            onChange={(event) => setMeasurementNoise(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="step-timeline">
        <div className="step-timeline-label"><span>离散时间 <StudyMath expression="k" /></span><StudyMath expression={`${current.step}/${steps.length}`} /></div>
        <input
          type="range"
          min="0"
          max={steps.length - 1}
          step="1"
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-label="选择滤波时间步"
        />
        <div className="step-ticks" aria-hidden="true">
          {steps.map((item, index) => <span key={item.step} className={index === step ? 'is-active' : ''}><StudyMath expression={String(item.step)} /></span>)}
        </div>
      </div>

      <div className="step-number-line" aria-label="预测、测量和更新后估计的位置比较">
        <div className="step-number-axis"><StudyMath expression={scaleMin.toFixed(0)} /><StudyMath expression={scaleMax.toFixed(0)} /></div>
        <div className="step-number-track">
          <i className="step-uncertainty prior" style={{ left: position(current.prior), width: intervalWidth(priorUncertainty) }} />
          <i className="step-uncertainty posterior" style={{ left: position(current.estimate), width: intervalWidth(uncertainty) }} />
          <span className="step-marker prior" style={{ left: position(current.prior) }}>
            <b>预测 <StudyMath expression={'\\hat x_k^-'} /></b><StudyMath expression={format(current.prior)} />
          </span>
          <span className="step-marker measurement" style={{ left: position(current.measurement) }}>
            <b>测量 <StudyMath expression="z_k" /></b><StudyMath expression={format(current.measurement)} />
          </span>
          <span className="step-marker posterior" style={{ left: position(current.estimate) }}>
            <b>更新 <StudyMath expression={'\\hat x_k^+'} /></b><StudyMath expression={format(current.estimate)} />
          </span>
        </div>
      </div>

      <div className="step-equations" aria-live="polite">
        <div className="step-equation step-equation-muted">
          <span>① 预测不确定性</span>
          <StudyMath expression={`P_k^-=P_{k-1}^++Q=${format(current.priorVariance)}`} display />
          <small>模型走一步，方差增加 <StudyMath expression="Q" />。</small>
        </div>
        <div className="step-equation">
          <span>② 创新与创新方差</span>
          <StudyMath expression={`y_k=z_k-\\hat x_k^-=${format(current.innovation)}`} display />
          <StudyMath expression={`S_k=P_k^-+R=${format(current.innovationVariance)}`} display />
          <small>创新必须与自己的方差 <StudyMath expression="S_k" /> 一起解释。</small>
        </div>
        <div className="step-equation step-equation-accent">
          <span>③ 卡尔曼增益</span>
          <StudyMath expression={`K_k=\\frac{P_k^-}{P_k^-+R}=${current.gain.toFixed(3)}`} display />
          <small><StudyMath expression="K_k" /> 是本次应该向测量靠近的比例，不是永久常数。</small>
        </div>
        <div className="step-equation">
          <span>④ 更新状态与方差</span>
          <StudyMath expression={`\\hat x_k^+=\\hat x_k^-+K_ky_k=${format(current.estimate)}`} display />
          <StudyMath expression={`P_k^+=(1-K_k)P_k^-=${format(current.variance)}`} display />
          <small>估计落在预测与测量之间，同时记录吸收证据后剩余的不确定性。</small>
        </div>
      </div>

      <div className="step-insight">
        <strong>这一格的结论</strong>
        {current.gain > 0.5
          ? '当前预测还不够确定，所以滤波器明显向新测量靠近。'
          : '当前测量相对不可靠，所以滤波器保留了更多自己的预测。'}
        <span>后验方差 <StudyMath expression={`P_k^+=${format(current.variance)}`} />，比预测方差 <StudyMath expression={`P_k^-=${format(current.priorVariance)}`} /> 更小。</span>
      </div>
    </section>
  );
}
