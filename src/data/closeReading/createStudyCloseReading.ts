import type { CloseReading, SentenceRole } from '../../types/closeReading';

type VocabularyItem = readonly [term: string, explanation: string];
type HighlightItem = readonly [role: SentenceRole, text: string];
type SegmentItem = readonly [source: string, translation: string];

export const createStudyCloseReading = (
  translation: string,
  vocabulary: readonly VocabularyItem[],
  pattern: string,
  highlights: readonly HighlightItem[],
  note?: string,
  segments?: readonly SegmentItem[],
): CloseReading => ({
  translation,
  vocabulary: vocabulary.map(([term, explanation]) => ({ term, explanation })),
  structure: {
    pattern,
    explanation: note ?? '先抓住主句主干，再把时间、原因、条件和补充说明放回原句。',
  },
  highlights: highlights.map(([role, text]) => ({ role, text })),
  segments: segments?.map(([source, segmentTranslation]) => ({
    source,
    translation: segmentTranslation,
  })),
});
