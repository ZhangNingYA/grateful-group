import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2025JuneSet2.json';
import analyses from './2025JuneSet2.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';
import { june2025Set2StructureOverrides } from './blogStructureOverrides';

export const cet6CloseReadings202506Set2 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
  june2025Set2StructureOverrides,
);
