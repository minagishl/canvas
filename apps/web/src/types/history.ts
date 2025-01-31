import { CanvasObject } from './canvas';

export interface HistoryState {
  type: 'init' | 'create' | 'update' | 'delete' | 'move' | 'resize' | 'copy';
  objects: CanvasObject[];
  selectedObjectId: string | null;
}
