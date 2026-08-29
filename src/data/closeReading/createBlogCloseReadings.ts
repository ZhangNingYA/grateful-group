import type {
  CloseReading,
  CloseReadingAnalysis,
  CloseReadingHighlight,
  SentenceRole,
} from '../../types/closeReading';

export type AnalysisPart = readonly [
  role: SentenceRole,
  text: string,
  label?: string,
];

export interface AnalysisOverride {
  highlights?: readonly AnalysisPart[];
  trunk?: readonly AnalysisPart[];
  pattern?: string;
  explanation?: string;
}

const roleLabels: Record<SentenceRole, string> = {
  subject: '主语',
  predicate: '谓语',
  object: '宾语',
  complement: '表语 / 补语',
  adverbial: '状语',
};

const toHighlights = (parts: readonly AnalysisPart[]): CloseReadingHighlight[] => parts.map(
  ([role, text, label]) => ({ role, text, ...(label ? { label } : {}) }),
);

const derivePattern = (highlights: readonly CloseReadingHighlight[]) => highlights
  .map((item) => item.label ?? roleLabels[item.role])
  .filter((label, index, labels) => index === 0 || label !== labels[index - 1])
  .join(' + ');

const deriveExplanation = (highlights: readonly CloseReadingHighlight[]) => {
  const clauses = highlights
    .map((item) => item.label)
    .filter((label): label is string => Boolean(label?.includes('从句')));
  const distinctClauses = [...new Set(clauses)];
  if (distinctClauses.length > 0) {
    return `先确认主句的主语、谓语和宾语或表语；${distinctClauses.join('、')}作为一个完整成分理解，不再拆分内部主谓宾。`;
  }
  const predicates = highlights.filter((item) => item.role === 'predicate').length;
  if (predicates > 1) {
    return '句中有并列或承接的主句（谓语）；按原句顺序分别抓住各自的主语、谓语和宾语或表语。';
  }
  return '先确认主句的主语、谓语和宾语或表语；时间、地点、方式等信息作为整体补充。';
};

const normalizeAnalysis = (
  generated: CloseReadingAnalysis,
  override?: AnalysisOverride,
): CloseReadingAnalysis => {
  const highlights = override?.highlights
    ? toHighlights(override.highlights)
    : generated.highlights;
  const trunk = override?.trunk
    ? toHighlights(override.trunk)
    : highlights
      .filter((item) => item.role !== 'adverbial')
      .map(({ role, text, label }) => ({ role, text, ...(label ? { label } : {}) }));
  return {
    pattern: override?.pattern ?? derivePattern(highlights),
    explanation: override?.explanation ?? deriveExplanation(highlights),
    highlights,
    trunk,
  };
};

export const createBlogCloseReadings = (
  notes: Readonly<Record<string, CloseReading>>,
  generatedAnalyses: Readonly<Record<string, CloseReadingAnalysis>>,
  overrides: Readonly<Record<string, AnalysisOverride>> = {},
): Readonly<Record<string, CloseReading>> => Object.fromEntries(
  Object.entries(notes).map(([key, note]) => {
    const generated = generatedAnalyses[key];
    if (!generated) return [key, note];
    return [key, {
      ...note,
      analysis: normalizeAnalysis(generated, overrides[key]),
    }];
  }),
);
