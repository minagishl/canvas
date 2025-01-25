import { CanvasObject, Point, ResizeHandle } from '../types/canvas';
import { snapToGrid, snapToGridSize } from './grid';

interface ResizeObjectParams {
  selectedObject: CanvasObject;
  startPoint: Point;
  currentPoint: Point;
  resizeHandle: ResizeHandle;
  isShiftPressed: boolean;
  snapToGridEnabled?: boolean;
}

export const handleObjectResize = ({
  selectedObject,
  startPoint,
  currentPoint,
  resizeHandle,
  isShiftPressed,
  snapToGridEnabled = false,
}: ResizeObjectParams): Partial<CanvasObject> => {
  const dx = currentPoint.x - startPoint.x;
  const dy = currentPoint.y - startPoint.y;

  const newPosition = { ...selectedObject.position };
  let newWidth = selectedObject.width;
  let newHeight = selectedObject.height;

  // Maintain aspect ratio when Shift key is pressed
  if (
    isShiftPressed ||
    selectedObject.type === 'image' ||
    selectedObject.type === 'embed'
  ) {
    const aspectRatio = selectedObject.width / selectedObject.height;

    // Processing changes according to the position of the resizing handle
    switch (resizeHandle) {
      case 'bottom-right': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        newWidth = selectedObject.width + maxDelta * Math.sign(dx);
        newHeight = newWidth / aspectRatio;
        break;
      }
      case 'bottom-left': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        newWidth = selectedObject.width - maxDelta * Math.sign(dx);
        newHeight = newWidth / aspectRatio;
        newPosition.x =
          selectedObject.position.x + (selectedObject.width - newWidth);
        break;
      }
      case 'top-right': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        newWidth = selectedObject.width + maxDelta * Math.sign(dx);
        newHeight = newWidth / aspectRatio;
        newPosition.y =
          selectedObject.position.y + (selectedObject.height - newHeight);
        break;
      }
      case 'top-left': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        newWidth = selectedObject.width - maxDelta * Math.sign(dx);
        newHeight = newWidth / aspectRatio;
        newPosition.x =
          selectedObject.position.x + (selectedObject.width - newWidth);
        newPosition.y =
          selectedObject.position.y + (selectedObject.height - newHeight);
        break;
      }
    }
  } else {
    // Normal resizing process
    switch (resizeHandle) {
      case 'top-left':
        newPosition.x = selectedObject.position.x + dx;
        newPosition.y = selectedObject.position.y + dy;
        newWidth = selectedObject.width - dx;
        newHeight = selectedObject.height - dy;
        break;
      case 'top-right':
        newPosition.y = selectedObject.position.y + dy;
        newWidth = selectedObject.width + dx;
        newHeight = selectedObject.height - dy;
        break;
      case 'bottom-left':
        newPosition.x = selectedObject.position.x + dx;
        newWidth = selectedObject.width - dx;
        newHeight = selectedObject.height + dy;
        break;
      case 'bottom-right':
        newWidth = selectedObject.width + dx;
        newHeight = selectedObject.height + dy;
        break;
    }
  }

  // Minimum Size Limit
  const minSize = 20;
  if (newWidth >= minSize && newHeight >= minSize) {
    // If grid snap is enabled, snap the position and size
    if (
      import.meta.env.VITE_RESIZE_SNAP_ENABLED === 'true' &&
      snapToGridEnabled
    ) {
      newPosition.x = snapToGrid(newPosition).x;
      newPosition.y = snapToGrid(newPosition).y;
      newWidth = snapToGridSize(newWidth);
      newHeight = snapToGridSize(newHeight);
    }
  }

  return {
    position: newPosition,
    width: newWidth,
    height: newHeight,
  };
};
