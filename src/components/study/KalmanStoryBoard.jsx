import { useEffect, useMemo, useState } from 'react';
import StudyMath from './StudyMath.jsx';

const frames = [
  { title: '第一条证据', truth: 10.2, measurement: 8.4, estimate: 9.4, note: '传感器读得偏低，但我们还不能确定它错了多少。' },
  { title: '第二条证据', truth: 11.1, measurement: 12.8, estimate: 10.8, note: '新测量跑到预测另一侧；滤波器只移动一部分。' },
  { title: '第三条证据', truth: 12.4, measurement: 10.1, estimate: 11.2, note: '连续几次更新后，估计开始追踪趋势，而不是复制抖动。' },
  { title: '第四条证据', truth: 13.7, measurement: 15.4, estimate: 12.9, note: '每一次移动的幅度，都由当时的预测与测量不确定性决定。' },
  { title: '第五条证据', truth: 14.8, measurement: 13.2, estimate: 13.7, note: '估计越来越稳定，但稳定不代表模型永远正确。' },
  { title: '第六条证据', truth: 16.2, measurement: 17.8, estimate: 15.2, note: '我们已经从“一个数字”转向“数字 + 对不确定性的判断”。' },
];

const linePath = (values, width, height, pad, min, max) => values.map((value, index) => {
  const x = pad + (index / (values.length - 1)) * (width - pad * 2);
  const y = pad + ((max - value) / (max - min)) * (height - pad * 2);
  return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ');

export default function KalmanStoryBoard() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[frameIndex];
  const width = 740;
  const height = 245;
  const pad = 34;
  const values = frames.flatMap((item) => [item.truth, item.measurement, item.estimate]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const xAt = (index) => pad + (index / (frames.length - 1)) * (width - pad * 2);
  const yAt = (value) => pad + ((max - value) / (max - min)) * (height - pad * 2);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setFrameIndex((index) => {
        if (index === frames.length - 1) {
          setPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const currentPosition = useMemo(() => ({
    x: xAt(frameIndex),
    truthY: yAt(frame.truth),
    measurementY: yAt(frame.measurement),
    estimateY: yAt(frame.estimate),
  }), [frameIndex, frame]);

  return (
    <section className="storyboard" data-study-step="storyboard" aria-labelledby="storyboard-title">
      <div className="storyboard-head">
        <div>
          <span className="textbook-label">先看见，再推导</span>
          <h3 id="storyboard-title">一辆看不见的车，留下六次不完美的证据</h3>
        </div>
        <button className="storyboard-play" type="button" onClick={() => {
          if (frameIndex === frames.length - 1) setFrameIndex(0);
          setPlaying((value) => !value);
        }}>
          {playing ? '暂停动画' : frameIndex === frames.length - 1 ? '重新播放' : '播放这一段'}
        </button>
      </div>
      <p className="storyboard-intro">灰线是真实状态（算法看不见），橙色点是传感器读数，蓝绿色线是逐步形成的估计。拖动时间轴，先猜下一步应该往哪里移动。</p>

      <svg className="storyboard-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="真实状态、传感器测量和滤波估计随时间变化的动画">
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = pad + ratio * (height - pad * 2);
          return <line key={ratio} className="storyboard-grid" x1={pad} x2={width - pad} y1={y} y2={y} />;
        })}
        <path className="storyboard-truth" d={linePath(frames.map((item) => item.truth), width, height, pad, min, max)} />
        <path className="storyboard-estimate" d={linePath(frames.map((item) => item.estimate), width, height, pad, min, max)} />
        {frames.map((item, index) => (
          <circle key={item.title} className={`storyboard-measurement ${index === frameIndex ? 'is-current' : ''}`} cx={xAt(index)} cy={yAt(item.measurement)} r={index === frameIndex ? 6 : 3.8} />
        ))}
        <line className="storyboard-cursor" x1={currentPosition.x} x2={currentPosition.x} y1={pad} y2={height - pad} />
        <circle className="storyboard-current-truth" cx={currentPosition.x} cy={currentPosition.truthY} r="5" />
        <circle className="storyboard-current-estimate" cx={currentPosition.x} cy={currentPosition.estimateY} r="5" />
      </svg>

      <div className="storyboard-legend" aria-hidden="true">
        <span className="storyboard-legend-truth">隐藏真实状态 <StudyMath expression="x_k" /></span>
        <span className="storyboard-legend-measurement">传感器测量 <StudyMath expression="z_k" /></span>
        <span className="storyboard-legend-estimate">滤波估计 <StudyMath expression="\\hat x_{k|k}" /></span>
      </div>

      <div className="storyboard-caption">
        <div><span>{frame.title}</span><strong><StudyMath expression={`k=${frameIndex + 1}`} /></strong></div>
        <p>{frame.note}</p>
        <div className="storyboard-numbers">
          <span>真实 <StudyMath expression={`x=${frame.truth.toFixed(1)}`} /></span>
          <span>测量 <StudyMath expression={`z=${frame.measurement.toFixed(1)}`} /></span>
          <span>估计 <StudyMath expression={`\\hat x=${frame.estimate.toFixed(1)}`} /></span>
        </div>
      </div>

      <label className="storyboard-timeline">
        <span>时间轴</span>
        <input type="range" min="0" max={frames.length - 1} step="1" value={frameIndex} onChange={(event) => {
          setPlaying(false);
          setFrameIndex(Number(event.target.value));
        }} />
        <div>{frames.map((item, index) => <i key={item.title} className={index === frameIndex ? 'is-active' : ''}>{index + 1}</i>)}</div>
      </label>
    </section>
  );
}
