import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2024JuneSet3.json';
import analyses from './2024JuneSet3.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';

export const cet6CloseReadings202406Set3 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
);
