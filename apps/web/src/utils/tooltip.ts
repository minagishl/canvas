import { type Point, type CanvasObject } from '../types/canvas';

interface CalculateTooltipPositionProps {
  selectedObject: CanvasObject;
  selectedObjectId: string;
  scale: number;
  offset: Point;
}

export const calculateTooltipPosition = ({
  selectedObject,
  selectedObjectId,
  scale,
  offset,
}: CalculateTooltipPositionProps): Point => {
  let x: number, y: number;

  if (selectedObject.type === 'text') {
    const textElement = document.querySelector(
      `[data-object-id="${selectedObjectId}"]`
    ) as HTMLElement;

    if (textElement) {
      const textHeight = textElement.offsetHeight;
      x = selectedObject.position.x * scale + offset.x;
      y = selectedObject.position.y * scale + offset.y - textHeight / 2;
    } else {
      x = selectedObject.position.x * scale + offset.x;
      y = selectedObject.position.y * scale + offset.y;
    }
  } else if (selectedObject.type === 'image') {
    x = selectedObject.position.x * scale + offset.x;
    y =
      (selectedObject.position.y - selectedObject.height / 2) * scale +
      offset.y -
      8;
  } else {
    x =
      (selectedObject.position.x + selectedObject.width / 2) * scale + offset.x;
    y = selectedObject.position.y * scale + offset.y - 8;
  }

  return { x, y };
};
