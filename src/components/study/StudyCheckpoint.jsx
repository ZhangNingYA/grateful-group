import { useEffect, useState } from 'react';

export default function StudyCheckpoint({ id, question, options, answer, explanation }) {
  const storageKey = `study-checkpoint:${id}`;
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === 'correct') setResult('correct');
    } catch {
      // Progress is an enhancement; the checkpoint still works without storage.
    }
  }, [storageKey]);

  const checkAnswer = (event) => {
    event.preventDefault();
    if (selected === null) return;

    const isCorrect = Number(selected) === Number(answer);
    setResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      try {
        window.localStorage.setItem(storageKey, 'correct');
      } catch {
        // Ignore storage failures in private browsing or restricted contexts.
      }
    }
  };

  return (
    <section className="study-checkpoint" data-study-step={`checkpoint-${id}`} aria-labelledby={`${id}-title`}>
      <div className="study-checkpoint-heading">
        <h3 id={`${id}-title`}>停下来，先做一个判断</h3>
        <span>Checkpoint</span>
      </div>
      <p className="study-checkpoint-question">{question}</p>
      <form onSubmit={checkAnswer}>
        <div className="study-checkpoint-options">
          {options.map((option, index) => (
            <label className="study-checkpoint-option" key={option}>
              <input
                type="radio"
                name={id}
                value={index}
                checked={selected !== null && Number(selected) === index}
                onChange={() => setSelected(index)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <button className="study-checkpoint-submit" type="submit">检查我的判断</button>
      </form>
      {result === 'correct' && (
        <p className="study-checkpoint-result success" role="status">判断正确。{explanation}</p>
      )}
      {result === 'wrong' && (
        <p className="study-checkpoint-result" role="status">还差一点。回到模拟器，再观察一次 Q 和 R 的变化。</p>
      )}
    </section>
  );
}
