export type ShowroomModelId = 'watch' | 'speaker' | 'lamp';

export interface ShowroomModelDefinition {
  id: ShowroomModelId;
  name: string;
  summary: string;
  sizeHint: string;
}