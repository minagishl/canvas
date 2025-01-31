import { CanvasObject } from './canvas';

export interface HistoryState {
  type: 'init' | 'create' | 'update' | 'delete' | 'move' | 'resize';
  objects: CanvasObject[];
  selectedObjectId: string | null;
}
