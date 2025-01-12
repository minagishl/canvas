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
  // Calculate base position with scale and offset
  const object = selectedObject;
  const baseX = object.position.x * scale + offset.x;
  const baseY = object.position.y * scale + offset.y;

  let x: number;
  let y: number;

  // Determine position based on object type
  switch (object.type) {
    case 'text': {
      const textElement = document.querySelector(
        `[data-object-id="${selectedObjectId}"]`
      ) as HTMLElement;

      if (textElement) {
        const textHeight = textElement.offsetHeight;
        x = baseX;
        y = baseY - textHeight / 2;
      } else {
        x = baseX;
        y = baseY;
      }
      break;
    }

    case 'image': {
      x = baseX;
      y = (object.position.y - object.height / 2) * scale + offset.y - 8;
      break;
    }

    default: {
      x = (object.position.x + object.width / 2) * scale + offset.x;
      y = baseY - 8;
      break;
    }
  }

  return { x, y };
};
