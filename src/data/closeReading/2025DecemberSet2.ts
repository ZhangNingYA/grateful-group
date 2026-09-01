import type { CloseReading, CloseReadingAnalysis } from '../../types/closeReading';
import notes from './2025DecemberSet2.json';
import analyses from './2025DecemberSet2.structures.json';
import { createBlogCloseReadings } from './createBlogCloseReadings';
import { december2025Set2StructureOverrides } from './2025DecemberStructureOverrides';

export const cet6CloseReadings202512Set2 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReadingAnalysis>>,
  december2025Set2StructureOverrides,
);
