import { useState } from 'react';
import StudyMath from './StudyMath.jsx';
import StudyRichText from './StudyRichText.jsx';

const chapters = [
  {
    id: 'model',
    tab: '状态模型',
    eyebrow: '01 · 先声明世界如何变化、传感器如何观察',
    title: '系统模型不是答案，而是滤波器的前提',
    equations: [
      'x_k = F_k x_{k-1} + B_k u_k + w_k',
      'z_k = H_k x_k + v_k',
      'w_k\\sim\\mathcal N(0,Q_k),\\qquad v_k\\sim\\mathcal N(0,R_k)',
    ],
    reading: '第一行说：下一时刻状态 = 旧状态经动力学传播 + 已知控制作用 + 模型没有解释的随机扰动。第二行说：测量 = 真实状态映射到传感器空间后的结果 + 测量误差。',
    terms: [
      ['x_k\\in\\mathbb R^{n\\times1}', '状态向量', '真正想估计的物理量，例如 [位置, 速度]ᵀ。'],
      ['F_k\\in\\mathbb R^{n\\times n}', '状态转移矩阵', '描述没有新测量时，状态如何从 k−1 演化到 k。'],
      ['B_ku_k\\in\\mathbb R^{n\\times1}', '控制作用', 'u 是已知输入，B 把输入转换成状态变化。'],
      ['H_k\\in\\mathbb R^{p\\times n}', '测量矩阵', '把 n 维状态投影到 p 维传感器空间。'],
      ['Q_k\\in\\mathbb R^{n\\times n}', '过程噪声协方差', '量化模型遗漏的随机状态变化。'],
      ['R_k\\in\\mathbb R^{p\\times p}', '测量噪声协方差', '量化传感器误差及不同测量通道间的相关性。'],
    ],
    steps: [
      '先选状态：状态必须包含足以预测下一步的信息。若只放位置，却想描述匀速运动，模型就缺少速度。',
      '再写 $F$、$B$、$H$：它们决定系统结构，而 $Q$、$R$ 只描述结构中的随机不确定性。',
      '最后标定 $Q$、$R$：二者是协方差，不是随手调节的“平滑强度”。',
    ],
    check: '量纲检查：$Fx$、$Bu$、$w$ 必须都与 $x$ 同单位；$Hx$ 与 $v$ 必须都与 $z$ 同单位。$Q$、$R$ 的单位分别是对应变量单位的平方。',
  },
  {
    id: 'predict',
    tab: '预测',
    eyebrow: '02 · 用模型把上一步后验推到下一时刻',
    title: '均值描述“预计在哪里”，协方差描述“预计有多不准”',
    equations: [
      '\\hat x_k^- = F_k\\hat x_{k-1}^+ + B_ku_k',
      'P_k^- = F_kP_{k-1}^+F_k^T+Q_k',
    ],
    reading: '上标 $-$ 表示读入本次测量之前的先验，上标 $+$ 表示已经吸收上一次测量后的后验。预测同时传播均值与误差协方差，缺少其中任何一个都不是完整的卡尔曼状态。',
    terms: [
      ['\\hat x_k^-\\in\\mathbb R^{n\\times1}', '先验均值', '只依赖旧信息，对时刻 k 状态的预测。'],
      ['P_k^-\\in\\mathbb R^{n\\times n}', '先验协方差', '预测误差 $e_k^-=x_k-\\hat x_k^-$ 的协方差。'],
      ['\\hat x_{k-1}^+', '上一步后验均值', '上一轮更新的输出，也是本轮预测的输入。'],
      ['P_{k-1}^+', '上一步后验协方差', '上一轮更新后尚未传播的估计不确定性。'],
      ['F_k^T', '状态矩阵的转置', '协方差在线性变换下按 A P Aᵀ 传播。'],
    ],
    steps: [
      '对状态方程取条件期望；由于 $\\mathrm E[w_k]=0$，均值式里不出现 $w_k$。',
      '写出预测误差 $e_k^-=F_ke_{k-1}^++w_k$。',
      '计算 $\\mathrm E[e_k^-(e_k^-)^T]$；独立性使交叉项为 $0$，留下 $FPF^T+Q$。',
    ],
    check: '正定性检查：$P$ 与 $Q$ 都应半正定，因此 $FPF^T+Q$ 仍半正定。$Q$ 增大只会增加模型传播后的不确定性，不会直接改变预测均值。',
  },
  {
    id: 'innovation',
    tab: '创新与增益',
    eyebrow: '03 · 先问测量与预测差多少，再问这个差是否显著',
    title: '创新必须与自己的不确定性一起解释',
    equations: [
      'y_k=z_k-H_k\\hat x_k^-',
      'S_k=H_kP_k^-H_k^T+R_k',
      'K_k=P_k^-H_k^TS_k^{-1}',
    ],
    reading: '$y_k$ 是测量残差，但仅看绝对大小没有意义：同样 $3\\,\\mathrm m$ 的偏差，对厘米级传感器很异常，对误差几十米的传感器却很普通。$S_k$ 给出创新应有的协方差，$K_k$ 再据此决定如何把测量空间的误差转换成状态修正。',
    terms: [
      ['y_k\\in\\mathbb R^{p\\times1}', '创新', '实际测量减去先验预测出的测量。'],
      ['S_k\\in\\mathbb R^{p\\times p}', '创新协方差', '综合预测投影的不确定性与传感器不确定性。'],
      ['K_k\\in\\mathbb R^{n\\times p}', '卡尔曼增益', '把 p 维创新映射成 n 维状态修正。'],
      ['S_k^{-1}', '创新协方差的逆', '按每个方向的可信度归一化残差；实现时通常解线性方程而不显式求逆。'],
    ],
    steps: [
      '先把先验状态投影到测量空间：$\\hat z_k^-=H_k\\hat x_k^-$。',
      '两种独立误差相加：预测投影误差 $HPH^T$ 与测量误差 $R$ 共同组成 $S$。',
      '选择 $K$，使更新后误差协方差（常以 $\\operatorname{tr}(P^+)$ 衡量）最小。',
    ],
    check: '标量且 $H=1$ 时，$K=P^-/(P^-+R)$，所以 $0\\le K\\le1$；矩阵问题中 $K$ 不是“百分比”，其元素也不必全部落在 $0$ 到 $1$。',
  },
  {
    id: 'update',
    tab: '更新',
    eyebrow: '04 · 用被不确定性归一化后的证据修正先验',
    title: '更新的是状态，也必须同步更新对误差的认识',
    equations: [
      '\\hat x_k^+=\\hat x_k^-+K_ky_k',
      'P_k^+=(I-K_kH_k)P_k^-',
      'P_k^+=(I-K_kH_k)P_k^-(I-K_kH_k)^T+K_kR_kK_k^T',
    ],
    reading: '状态式把创新经过 $K$ 映射后加到先验上；协方差式则记录“吸收这条独立证据后，我们少了多少不确定性”。简单式在精确算术和最优 $K$ 下成立，Joseph 形式在浮点计算中更稳健。',
    terms: [
      ['\\hat x_k^+\\in\\mathbb R^{n\\times1}', '后验均值', '融合 zₖ 后，对状态的最新条件均值。'],
      ['P_k^+\\in\\mathbb R^{n\\times n}', '后验协方差', '更新后估计误差的协方差。'],
      ['I\\in\\mathbb R^{n\\times n}', '单位矩阵', '保证 I−KH 与状态空间维度一致。'],
      ['K_ky_k\\in\\mathbb R^{n\\times1}', '状态修正', '不是新状态本身，而是从先验移动的增量。'],
    ],
    steps: [
      '把 $\\hat x^+$ 写成 $\\hat x^-+Ky$，是所有线性更新器的一般形式。',
      '将真实状态减去更新式，得到后验误差 $e^+=(I-KH)e^--Kv$。',
      '对 $e^+e^{+T}$ 取期望得到 Joseph 形式；代入最优 $K$ 后可化简为 $(I-KH)P^-$。',
    ],
    check: '信息检查：在模型一致、$R$ 有限且测量确实提供信息时，更新不会增加不确定性；但 $P^+$ 变小不等于真实误差在每一次样本上都必然变小。',
  },
];

export default function KalmanFormulaAtlas() {
  const [activeId, setActiveId] = useState('model');
  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];

  const navigateTabs = (event, index) => {
    const keyTargets = {
      ArrowRight: (index + 1) % chapters.length,
      ArrowLeft: (index - 1 + chapters.length) % chapters.length,
      Home: 0,
      End: chapters.length - 1,
    };
    const nextIndex = keyTargets[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    setActiveId(chapters[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <section className="formula-atlas" data-study-step="formula-atlas" aria-labelledby="formula-atlas-title">
      <div className="formula-atlas-heading">
        <div>
          <span className="textbook-label">动态公式图谱</span>
          <h3 id="formula-atlas-title">不要背五行公式，先读懂每一个对象</h3>
        </div>
        <p>选择一个阶段，查看公式怎样读、每个符号是什么、结论从哪里来。</p>
      </div>

      <div className="formula-atlas-tabs" role="tablist" aria-label="卡尔曼滤波公式阶段">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            type="button"
            role="tab"
            aria-selected={activeId === chapter.id}
            aria-controls={`formula-panel-${chapter.id}`}
            id={`formula-tab-${chapter.id}`}
            className={activeId === chapter.id ? 'is-active' : ''}
            tabIndex={activeId === chapter.id ? 0 : -1}
            onClick={() => setActiveId(chapter.id)}
            onKeyDown={(event) => navigateTabs(event, index)}
          >
            {chapter.tab}
          </button>
        ))}
      </div>

      <div
        className="formula-atlas-panel"
        role="tabpanel"
        id={`formula-panel-${active.id}`}
        aria-labelledby={`formula-tab-${active.id}`}
      >
        <div className="formula-atlas-overview">
          <span>{active.eyebrow}</span>
          <h4>{active.title}</h4>
          <div className="formula-atlas-equations">
            {active.equations.map((equation) => <StudyMath key={equation} expression={equation} display />)}
          </div>
          <p><b>逐句读法</b><StudyRichText>{active.reading}</StudyRichText></p>
        </div>

        <div className="formula-atlas-details">
          <div className="formula-atlas-symbols">
            <h5>符号与维度</h5>
            <dl>
              {active.terms.map(([symbol, name, meaning]) => (
                <div key={symbol}>
                  <dt><StudyMath expression={symbol} /><span>{name}</span></dt>
                  <dd><StudyRichText>{meaning}</StudyRichText></dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="formula-atlas-derivation">
            <h5>它为什么成立</h5>
            <ol>
              {active.steps.map((step) => <li key={step}><StudyRichText>{step}</StudyRichText></li>)}
            </ol>
            <p><b>自检</b><StudyRichText>{active.check}</StudyRichText></p>
          </div>
        </div>
      </div>
    </section>
  );
}
