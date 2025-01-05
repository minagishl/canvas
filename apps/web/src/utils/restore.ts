import { CanvasObject } from '../types/canvas';

export const handleRestoreObjects = (
  objects: CanvasObject[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const latestObject = objects[objects.length - 1];
  if (!latestObject) return;

  setObjects((prevObjects) =>
    prevObjects.filter((obj) => obj.id !== latestObject.id)
  );

  setSelectedObjectId(null);
};
