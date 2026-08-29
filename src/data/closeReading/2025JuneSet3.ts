import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2025JuneSet3.json';
import analyses from './2025JuneSet3.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';
import { june2025Set3StructureOverrides } from './blogStructureOverrides';

export const cet6CloseReadings202506Set3 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
  june2025Set3StructureOverrides,
);
