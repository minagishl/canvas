import { CanvasObject } from '../types/canvas';
import { HistoryAction } from '../types/history';
import { HistoryState } from '../types/history';

export const addToHistory = (
  action: HistoryAction,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
) => {
  setHistory((prev) => {
    const newHistory = prev.slice(0, currentHistoryIndex + 1);
    return [
      ...newHistory,
      {
        objects: action.objects,
        selectedObjectId: action.selectedObjectId,
      },
    ];
  });
  setCurrentHistoryIndex((prev) => prev + 1);
};

export const handleUndo = (
  currentHistoryIndex: number,
  history: HistoryState[],
  setObjects: (objects: CanvasObject[]) => void,
  setSelectedObjectId: (id: string | null) => void,
  setCurrentHistoryIndex: (callback: (prev: number) => number) => void
) => {
  if (currentHistoryIndex > 0) {
    const previousState = history[currentHistoryIndex - 1];
    setObjects(previousState.objects);
    setSelectedObjectId(previousState.selectedObjectId);
    setCurrentHistoryIndex((prev) => prev - 1);
  }
};

export const handleAddObject = async (
  newObject: CanvasObject,
  setObjects: (callback: (prev: CanvasObject[]) => CanvasObject[]) => void,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
) => {
  setObjects((prev) => {
    const newObjects = [...prev, newObject];

    setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentHistoryIndex + 1);
        return [
          ...newHistory,
          { objects: newObjects, selectedObjectId: newObject.id },
        ];
      });
      setCurrentHistoryIndex((prev) => prev + 1);
    }, 0);

    return newObjects;
  });
};
