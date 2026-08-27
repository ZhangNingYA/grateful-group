export type ReadingOptionKey = 'A' | 'B' | 'C' | 'D';

export interface ReadingQuestionOption {
  key: ReadingOptionKey;
  text: string;
  explanation: string;
}

export interface ReadingQuestion {
  number: number;
  prompt: string;
  translation: string;
  answer: ReadingOptionKey;
  evidence: string;
  analysis: string;
  options: readonly ReadingQuestionOption[];
}
