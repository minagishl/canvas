import { CanvasObject } from '../types/canvas';

export const handleRetoreObjects = (
  objects: CanvasObject[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
) => {
  const latestObject = objects[objects.length - 1];
  if (!latestObject) return;

  setObjects((prevObjects) =>
    prevObjects.filter((obj) => obj.id !== latestObject.id)
  );
};
