import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2025JuneSet1.json';
import analyses from './2025JuneSet1.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';
import { june2025Set1StructureOverrides } from './blogStructureOverrides';

export const cet6CloseReadings202506Set1 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
  june2025Set1StructureOverrides,
);
