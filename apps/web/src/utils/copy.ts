import { CanvasObject } from '../types/canvas';

export const handleCopyObject = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectId: (value: React.SetStateAction<string | null>) => void
) => {
  if (!selectedObjectId) return;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (!selectedObject) return;

  const id = Math.random().toString(36).slice(2, 11);

  setObjects((prevObjects) => [
    ...prevObjects,
    {
      ...selectedObject,
      id,
      position: {
        x: selectedObject.position.x + 40,
        y: selectedObject.position.y + 40,
      },
    },
  ]);

  setSelectedObjectId(id);
};
