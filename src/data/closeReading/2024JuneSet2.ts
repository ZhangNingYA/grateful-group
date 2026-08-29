import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2024JuneSet2.json';
import analyses from './2024JuneSet2.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';

export const cet6CloseReadings202406Set2 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
);
