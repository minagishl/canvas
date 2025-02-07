import { CanvasObject } from '~/types/canvas';
import { HistoryState } from '~/types/history';

export const copyObject = (
  objects: CanvasObject[],
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
): void => {
  if (selectedObjectIds.length === 0) return;

  for (const id of selectedObjectIds) {
    const selectedObject = objects.find((obj) => (obj.id === id ? obj : null));

    if (!selectedObject) return;

    const newId = Math.random().toString(36).slice(2, 11);
    let offsetX = 40;
    let offsetY = 40;

    while (
      selectedObjectIds.length === 1 &&
      objects.some(
        (obj) =>
          obj.position.x === selectedObject.position.x + offsetX &&
          obj.position.y === selectedObject.position.y + offsetY
      )
    ) {
      offsetX += offsetX;
      offsetY += offsetY;
    }

    const newObject = {
      ...selectedObject,
      id: newId,
      position: {
        x: selectedObject.position.x + offsetX,
        y: selectedObject.position.y + offsetY,
      },
    };

    setObjects((prevObjects) => [...prevObjects, newObject]);

    // Add to history if history management is enabled
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      return [
        ...newHistory,
        {
          type: 'copy',
          objects: [...objects, newObject],
          selectedObjectId: id,
        },
      ];
    });
    setCurrentHistoryIndex(currentHistoryIndex + 1);

    setSelectedObjectIds([newId]);
  }
};

export const deleteObject = (
  objects: CanvasObject[],
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
): void => {
  if (selectedObjectIds.length === 0) return;

  const newObjects = objects.filter(
    (obj) => !selectedObjectIds.includes(obj.id)
  );

  setObjects(newObjects);

  // Add to history if history management is enabled
  if (
    setHistory &&
    setCurrentHistoryIndex &&
    currentHistoryIndex !== undefined
  ) {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      return [
        ...newHistory,
        {
          type: 'delete',
          objects: newObjects,
          selectedObjectId: null,
        },
      ];
    });
    setCurrentHistoryIndex(currentHistoryIndex + 1);
  }

  setSelectedObjectIds([]);
};

export const lockObject = (
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void => {
  if (!selectedObjectId) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      obj.id === selectedObjectId ? { ...obj, locked: !obj.locked } : obj
    )
  );
};

export const rotateObject = (
  selectedObjectId: string | null,
  objects: CanvasObject[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  isRotating: boolean,
  setIsRotating: React.Dispatch<React.SetStateAction<boolean>>
): void => {
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

export function upObject(
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void {
  if (selectedObjectIds.length === 0) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      selectedObjectIds.includes(obj.id)
        ? {
            ...obj,
            position: {
              ...obj.position,
              y: obj.position.y - 10,
            },
          }
        : obj
    )
  );
}

export function downObject(
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void {
  if (selectedObjectIds.length === 0) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      selectedObjectIds.includes(obj.id)
        ? {
            ...obj,
            position: {
              ...obj.position,
              y: obj.position.y + 10,
            },
          }
        : obj
    )
  );
}

export function leftObject(
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void {
  if (selectedObjectIds.length === 0) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      selectedObjectIds.includes(obj.id)
        ? {
            ...obj,
            position: {
              ...obj.position,
              x: obj.position.x - 10,
            },
          }
        : obj
    )
  );
}

export function rightObject(
  selectedObjectIds: string[],
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void {
  if (selectedObjectIds.length === 0) return;

  setObjects((prevObjects) =>
    prevObjects.map((obj) =>
      selectedObjectIds.includes(obj.id)
        ? {
            ...obj,
            position: {
              ...obj.position,
              x: obj.position.x + 10,
            },
          }
        : obj
    )
  );
}
