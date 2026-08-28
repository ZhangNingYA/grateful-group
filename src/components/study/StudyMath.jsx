import katex from 'katex';

export default function StudyMath({ expression, display = false, label }) {
  const html = katex.renderToString(expression, {
    displayMode: display,
    throwOnError: false,
    output: 'htmlAndMathml',
  });

  const Tag = display ? 'div' : 'span';
  return (
    <Tag
      className={display ? 'study-math study-math-display' : 'study-math study-math-inline'}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
