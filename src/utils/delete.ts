import { CanvasObject } from '../types/canvas';

export const handleDeleteObject = (
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!selectedObjectId) return;

  setObjects((prevObjects) =>
    prevObjects.filter((obj) => obj.id !== selectedObjectId)
  );
  setSelectedObjectId(null);
};
