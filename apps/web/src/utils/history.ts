import { CanvasObject } from '~/types/canvas';
import { HistoryState } from '~/types/history';

export const addToHistory = (
  action: HistoryState,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  setHistory((prev) => {
    const newHistory = prev.slice(0, prev.length + 1);
    return [
      ...newHistory,
      {
        type: action.type,
        objects: action.objects,
        selectedObjectId: action.selectedObjectId,
      },
    ];
  });
  setCurrentHistoryIndex((prev) => prev + 1);
};

export const handleAddObject = async (
  newObject: CanvasObject,
  setObjects: (callback: (prev: CanvasObject[]) => CanvasObject[]) => void,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  setObjects((prev) => {
    const newObjects = [...prev, newObject];

    setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, prev.length + 1);
        return [
          ...newHistory,
          {
            type: 'create',
            objects: newObjects,
            selectedObjectId: newObject.id,
          },
        ];
      });
      setCurrentHistoryIndex((prev) => prev + 1);
    }, 0);

    return newObjects;
  });
};
