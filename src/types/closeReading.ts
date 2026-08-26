export type SentenceRole =
  | 'subject'
  | 'predicate'
  | 'object'
  | 'complement'
  | 'adverbial';

export interface CloseReadingHighlight {
  role: SentenceRole;
  text: string;
}

export interface CloseReadingVocabulary {
  term: string;
  explanation: string;
}

export interface CloseReadingSegment {
  source: string;
  translation: string;
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
}
