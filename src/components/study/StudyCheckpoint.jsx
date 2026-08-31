import { useEffect, useState } from 'react';
import StudyRichText from './StudyRichText.jsx';

export default function StudyCheckpoint({
  id,
  question,
  options,
  answer,
  explanation,
  hint,
  wrongFeedback = '还差一点。重新检查每个选项背后的假设，再试一次。',
}) {
  const storageKey = `study-checkpoint:${id}`;
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

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
      <p className="study-checkpoint-question"><StudyRichText>{question}</StudyRichText></p>
      <form onSubmit={checkAnswer}>
        <fieldset className="checkpoint-fieldset">
          <legend className="sr-only">选择一个答案</legend>
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
              <span><StudyRichText>{option}</StudyRichText></span>
            </label>
          ))}
        </div>
        </fieldset>
        <div className="checkpoint-actions">
          <button className="study-checkpoint-submit" type="submit" disabled={selected === null}>检查我的判断</button>
          {hint && (
            <button className="study-checkpoint-hint" type="button" aria-expanded={showHint} aria-controls={`${id}-hint`} onClick={() => setShowHint((value) => !value)}>
              {showHint ? '收起提示' : '我需要一个提示'}
            </button>
          )}
        </div>
      </form>
      {hint && <p id={`${id}-hint`} className="study-checkpoint-hint-copy" hidden={!showHint}><b>提示：</b><StudyRichText>{hint}</StudyRichText></p>}
      {result === 'correct' && (
        <p className="study-checkpoint-result success" role="status">判断正确。<StudyRichText>{explanation}</StudyRichText></p>
      )}
      {result === 'wrong' && (
        <p className="study-checkpoint-result" role="status"><StudyRichText>{wrongFeedback}</StudyRichText></p>
      )}
    </section>
  );
}
