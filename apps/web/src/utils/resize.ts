import { CanvasObject, Point, ResizeHandle } from '../types/canvas';
import { snapToGrid, snapToGridSize } from './grid';
import { MIN_OBJECT_SIZE } from './constants';

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
        const sign = Math.sign(dx + dy);
        newWidth = selectedObject.width + maxDelta * sign;
        newHeight = newWidth / aspectRatio;
        break;
      }
      case 'bottom-left': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        const sign = Math.sign(-dx + dy);
        newWidth = selectedObject.width + maxDelta * sign;
        newHeight = newWidth / aspectRatio;
        break;
      }
      case 'top-right': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        const sign = Math.sign(dx - dy);
        newWidth = selectedObject.width + maxDelta * sign;
        newHeight = newWidth / aspectRatio;
        break;
      }
      case 'top-left': {
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        const sign = -Math.sign(dx + dy);
        newWidth = selectedObject.width + maxDelta * sign;
        newHeight = newWidth / aspectRatio;
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
  if (newWidth >= MIN_OBJECT_SIZE && newHeight >= MIN_OBJECT_SIZE) {
    // If grid snap is enabled, snap the position and size
    if (snapToGridEnabled) {
      newPosition.x = snapToGrid(newPosition).x;
      newPosition.y = snapToGrid(newPosition).y;
      newWidth = snapToGridSize(newWidth);
      newHeight = snapToGridSize(newHeight);
    }
  }

  // Apply minimum size limit
  if (newWidth < MIN_OBJECT_SIZE) {
    newWidth = MIN_OBJECT_SIZE;
    if (resizeHandle && resizeHandle.includes('left')) {
      newPosition.x =
        selectedObject.position.x + selectedObject.width - MIN_OBJECT_SIZE;
    }
  }
  if (newHeight < MIN_OBJECT_SIZE) {
    newHeight = MIN_OBJECT_SIZE;
    if (resizeHandle && resizeHandle.includes('top')) {
      newPosition.y =
        selectedObject.position.y + selectedObject.height - MIN_OBJECT_SIZE;
    }
  }

  return {
    position: newPosition,
    width: newWidth,
    height: newHeight,
  };
};
