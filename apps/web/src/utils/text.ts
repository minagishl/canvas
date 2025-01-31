import { CanvasObject, fontWeight } from '~/types/canvas';

export const textEdit = (
  selectedObjectId: string | null,
  objects: CanvasObject[],
  setIsEditingId: (id: string) => void
): void => {
  if (!selectedObjectId) return;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (!selectedObject || selectedObject.type !== 'text') return;

  const textElement = document.querySelector(
    `[data-object-id="${selectedObjectId}"]`
  ) as HTMLElement;

  if (textElement) {
    setIsEditingId(selectedObjectId);
    textElement.contentEditable = 'true';
    textElement.focus();
  }
};

export const textToggleBold = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void => {
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (selectedObject && selectedObject.type === 'text') {
    const newObjects = objects.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            weight: selectedObject.weight === 400 ? 600 : (400 as fontWeight),
          }
        : obj
    );
    setObjects(newObjects);
  }
};

export const textToggleItalic = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void => {
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (selectedObject && selectedObject.type === 'text') {
    const newObjects = objects.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            italic: !selectedObject.italic,
          }
        : obj
    );
    setObjects(newObjects);
  }
};
