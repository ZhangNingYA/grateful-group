import { useEffect, useState } from 'react';

const fields = [
  ['understood', '我现在能解释什么？'],
  ['stuck', '哪里还不确定？'],
  ['next', '下次从哪里继续？'],
];

export default function StudyReflection({ storageKey = 'study-reflection:kalman-filter' }) {
  const [notes, setNotes] = useState({ understood: '', stuck: '', next: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (value) setNotes(JSON.parse(value));
    } catch {
      // Notes remain available for the current session if storage is blocked.
    }
  }, [storageKey]);

  const update = (key, value) => {
    setSaved(false);
    setNotes((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {
      // Keep the in-memory note even when persistence is unavailable.
    }
    setSaved(true);
  };

  return (
    <section className="study-reflection" data-study-step="reflection" aria-labelledby="reflection-title">
      <h3 id="reflection-title">把一次学习变成下一次的起点</h3>
      <div className="study-reflection-grid">
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <textarea value={notes[key]} onChange={(event) => update(key, event.target.value)} />
          </label>
        ))}
      </div>
      <div className="study-reflection-actions">
        <span className="study-reflection-status" role="status">{saved ? '已保存到本机' : '笔记只保存在当前浏览器'}</span>
        <button className="study-reflection-save" type="button" onClick={save}>保存学习记录</button>
      </div>
    </section>
  );
}
