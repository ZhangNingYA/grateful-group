import type { CloseReading, SentenceRole } from '../../types/closeReading';

type VocabularyItem = readonly [term: string, explanation: string];
type HighlightItem = readonly [role: SentenceRole, text: string];

export const createCloseReading = (
  translation: string,
  vocabulary: readonly VocabularyItem[],
  pattern: string,
  explanation: string,
  highlights: readonly HighlightItem[],
): CloseReading => ({
  translation,
  vocabulary: vocabulary.map(([term, itemExplanation]) => ({
    term,
    explanation: itemExplanation,
  })),
  structure: { pattern, explanation },
  highlights: highlights.map(([role, text]) => ({ role, text })),
});
