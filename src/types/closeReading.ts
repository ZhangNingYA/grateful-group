export type SentenceRole =
  | 'subject'
  | 'predicate'
  | 'object'
  | 'complement'
  | 'adverbial';

export interface CloseReadingHighlight {
  role: SentenceRole;
  text: string;
  /** Optional learner-facing label for a clause kept as one component. */
  label?: string;
}

export interface CloseReadingVocabulary {
  term: string;
  explanation: string;
}

export interface InlineGlossaryEntry {
  partOfSpeech: string;
  meaning: string;
}

export interface InlineGlossary {
  words: Readonly<Record<string, InlineGlossaryEntry>>;
  phrases?: readonly CloseReadingVocabulary[];
}

export interface CloseReadingSegment {
  source: string;
  translation: string;
}

export interface CloseReadingAnalysis {
  pattern: string;
  explanation: string;
  highlights: CloseReadingHighlight[];
  trunk?: CloseReadingHighlight[];
}

export interface CloseReading {
  translation: string;
  vocabulary: CloseReadingVocabulary[];
  structure: {
    pattern: string;
    explanation: string;
  };
  highlights: CloseReadingHighlight[];
  trunk?: CloseReadingHighlight[];
  segments?: CloseReadingSegment[];
  /** Blog-only semantic analysis, separate from the inline colour ranges. */
  analysis?: CloseReadingAnalysis;
}
