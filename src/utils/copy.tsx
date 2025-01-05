import { CanvasObject } from "../types/canvas";

export const handleCopyObject = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
) => {
  if (!selectedObjectId) return;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (!selectedObject) return;

  setObjects((prevObjects) => [
    ...prevObjects,
    {
      ...selectedObject,
      id: Math.random().toString(36).slice(2, 11),
      position: {
        x: selectedObject.position.x + 40,
        y: selectedObject.position.y + 40,
      },
    },
  ]);
};
