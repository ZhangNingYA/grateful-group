import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2024DecemberSet1.json';
import analyses from './2024DecemberSet1.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';

export const cet6CloseReadings202412Set1 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
);
