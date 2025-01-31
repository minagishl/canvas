import { CanvasObject } from './canvas';

export interface HistoryState {
  objects: CanvasObject[];
  selectedObjectId: string | null;
}

export type HistoryAction = {
  type: 'create' | 'update' | 'delete' | 'move' | 'resize';
  objects: CanvasObject[];
  selectedObjectId: string | null;
};
