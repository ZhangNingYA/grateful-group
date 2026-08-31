import { useEffect, useState } from 'react';

const defaultFields = [
  ['understood', '我现在能解释什么？'],
  ['stuck', '哪里还不确定？'],
  ['next', '下次从哪里继续？'],
];

const courseFields = [
  ['model', '我的状态向量与协方差分别来自哪里？'],
  ['risk', '实现最可能在哪条假设上失效？'],
  ['test', '上线前还缺哪一个诊断或自动化测试？'],
];

export default function StudyReflection({ storageKey = 'study-reflection:kalman-filter', variant = 'default' }) {
  const fields = variant === 'course' ? courseFields : defaultFields;
  const emptyNotes = () => Object.fromEntries(fields.map(([key]) => [key, '']));
  const [notes, setNotes] = useState(emptyNotes);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (value) {
        const savedNotes = JSON.parse(value);
        setNotes((current) => ({ ...current, ...savedNotes }));
        setStatus('saved');
      }
    } catch {
      // Notes remain available for the current session if storage is blocked.
    }
  }, [storageKey]);

  const update = (key, value) => {
    setStatus('dirty');
    setNotes((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {
      // Keep the in-memory note even when persistence is unavailable.
    }
    setStatus('saved');
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
        <span className="study-reflection-status" role="status">
          {status === 'saved' ? '已保存到当前浏览器' : status === 'dirty' ? '有未保存的修改' : '尚未填写学习记录'}
        </span>
        <button className="study-reflection-save" type="button" onClick={save}>保存学习记录</button>
      </div>
    </section>
  );
}
