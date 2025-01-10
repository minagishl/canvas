import { CanvasObject } from '../types/canvas';

export const copyObject = (
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

export const deleteObject = (
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

export const lockObject = (
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
) => {
  if (!selectedObjectId) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      obj.id === selectedObjectId ? { ...obj, locked: !obj.locked } : obj
    )
  );
};

export const restoreObject = (
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

export const rotateObject = (
  selectedObjectId: string | null,
  objects: CanvasObject[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  isRotating: boolean,
  setIsRotating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!selectedObjectId || isRotating) return;

  setIsRotating(true);

  const startTime = performance.now();
  const startRotation =
    objects.find((obj) => obj.id === selectedObjectId)?.rotation || 0;
  const duration = 300;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? {
              ...obj,
              rotation: startRotation + ((progress * 30) % 360),
            }
          : obj
      )
    );

    if (progress < 1) {
      requestAnimationFrame(animate);
    }

    if (progress >= 1) {
      setIsRotating(false);
    }
  };

  requestAnimationFrame(animate);
};
