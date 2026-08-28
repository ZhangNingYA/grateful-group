import { useState } from 'react';
import StudyRichText from './StudyRichText.jsx';

const quickPrompts = [
  '用一句话解释 $Q$ 和 $R$ 的区别',
  '给我一个不直接揭晓答案的提示',
  '为什么 $K_k$ 会逐渐稳定？',
];

const demoReply = (question) => {
  if (/\b(?:q|r)\b|过程噪声|测量噪声/.test(question.toLowerCase())) {
    return '在本页 $H=1$ 的标量模型中，把 $Q$ 想成“运动模型有多不可靠”，把 $R$ 想成“传感器有多不可靠”。$Q$ 变大，估计会更愿意跟随新测量；$R$ 变大，估计会更坚持自己的预测。先回到上面的两个滑块验证这个关系。';
  }
  if (/gain|增益|相信|权重/.test(question.toLowerCase())) {
    return '$K_k$ 不是固定权重，它由当前预测协方差 $P_k^-$ 和测量协方差 $R_k$ 共同决定。预测越不确定，$K_k$ 越大；测量越不可靠，$K_k$ 越小。';
  }
  if (/提示|hint|帮助/.test(question.toLowerCase())) {
    return '先观察两个极端：分别令 $R\\gg Q$ 与 $Q\\gg R$。看估计线更接近预测还是测量，再用“哪一方更不可靠”解释。';
  }
  return '这是一个很好的问题。先把它拆成两件事：算法此刻对自己的预测有多确定，以及传感器这次读数有多可信。你可以告诉我你观察到的曲线变化，我会继续追问。';
};

export default function StudyCoach({ endpoint = '' }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '我是这页的学习教练。先描述你在模拟器里看到的变化，我会用问题引导你，而不是直接把答案塞给你。' },
  ]);
  const [pending, setPending] = useState(false);

  const ask = async (event, preset) => {
    event?.preventDefault();
    const question = (preset ?? input).trim();
    if (!question || pending) return;

    setInput('');
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setPending(true);

    let reply;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            courseId: 'kalman-filter',
            blockId: 'prediction-update',
            mode: 'socratic',
            question,
          }),
        });
        if (!response.ok) throw new Error('Coach request failed');
        const data = await response.json();
        if (!data.reply) throw new Error('Empty coach response');
        reply = data.reply;
      } catch {
        reply = `${demoReply(question)}\n\n（暂时无法连接 AI 服务，以上是本地演示提示。）`;
      }
    } else {
      reply = `${demoReply(question)}\n\n（当前为本地演示模式；接入 /api/study/coach 后即可替换为真实 AI。）`;
    }

    setMessages((current) => [...current, { role: 'assistant', text: reply }]);
    setPending(false);
  };

  return (
    <section className="study-coach" data-study-step="coach" aria-labelledby="coach-title">
      <div className="study-coach-header">
        <div className="study-coach-title">
          <span className="study-coach-orb" aria-hidden="true">✦</span>
          <h3 id="coach-title">AI 学习教练</h3>
        </div>
        <span className="study-coach-badge">Socratic demo</span>
      </div>
      <p className="study-coach-intro">AI 只看当前学习单元和你的问题，优先给提示、追问和误区反馈。数值模拟仍由页面程序计算。</p>
      <div className="study-coach-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`study-coach-message ${message.role}`} key={`${message.role}-${index}`}><StudyRichText>{message.text}</StudyRichText></div>
        ))}
        {pending && <div className="study-coach-message assistant">正在整理一个不会直接剧透的提示…</div>}
      </div>
      <div className="study-coach-quick">
        {quickPrompts.map((prompt) => (
          <button key={prompt} type="button" onClick={(event) => ask(event, prompt)}><StudyRichText>{prompt}</StudyRichText></button>
        ))}
      </div>
      <form className="study-coach-form" onSubmit={ask}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="写下你卡住的地方…" aria-label="向 AI 学习教练提问" />
        <button type="submit" disabled={pending}>发送问题</button>
      </form>
    </section>
  );
}
