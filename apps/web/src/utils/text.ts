import { CanvasObject } from '../types/canvas';

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
