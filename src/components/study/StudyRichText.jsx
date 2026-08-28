import StudyMath from './StudyMath.jsx';

export default function StudyRichText({ children }) {
  const text = String(children ?? '');
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return <StudyMath key={`${part}-${index}`} expression={part.slice(1, -1)} />;
    }
    return part;
  });
}
