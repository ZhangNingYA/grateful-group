import type { CloseReading, SentenceRole } from '../../types/closeReading';

type VocabularyItem = readonly [term: string, explanation: string];
type HighlightItem = readonly [role: SentenceRole, text: string];

const roleLabels: Record<SentenceRole, string> = {
  subject: '主语',
  predicate: '谓语',
  object: '宾语',
  complement: '表语或补足语',
  adverbial: '状语',
};

const summarizeHighlights = (highlights: readonly HighlightItem[]) =>
  highlights
    .map(([role, text]) => `“${text}”是${roleLabels[role]}`)
    .join('；');

export const createStudyCloseReading = (
  translation: string,
  vocabulary: readonly VocabularyItem[],
  pattern: string,
  highlights: readonly HighlightItem[],
  note?: string,
): CloseReading => ({
  translation,
  vocabulary: vocabulary.map(([term, explanation]) => ({ term, explanation })),
  structure: {
    pattern,
    explanation: `${summarizeHighlights(highlights)}。${note ?? ''}`,
  },
  highlights: highlights.map(([role, text]) => ({ role, text })),
});
