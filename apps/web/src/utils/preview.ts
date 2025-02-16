import { CanvasObject, Point, ToolType } from '~/types/canvas';
import { MIN_OBJECT_SIZE } from './constants';
import { generateRandomId } from './generate';

export const createObject = (
  tool: ToolType,
  startPoint: Point,
  endPoint: Point,
  isShiftPressed: boolean
): CanvasObject => {
  return createPreviewObject(tool, startPoint, endPoint, isShiftPressed, false);
};

export const createPreviewObject = (
  tool: ToolType,
  startPoint: Point,
  endPoint: Point,
  isShiftPressed: boolean,
  isPreview: boolean = true
): CanvasObject => {
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;

  let width = Math.abs(deltaX);
  let height = Math.abs(deltaY);

  if (isShiftPressed && (tool === 'rectangle' || tool === 'circle')) {
    width = height = Math.min(width, height);
  }

  const type =
    tool === 'text' ? 'text' : tool === 'circle' ? 'circle' : 'rectangle';

  return {
    id: isPreview ? 'preview-' + tool : generateRandomId(),
    type,
    position: {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y),
    },
    width: Math.max(MIN_OBJECT_SIZE, width),
    height: Math.max(MIN_OBJECT_SIZE, height),
    fill: '#4f46e5',
    text: tool === 'text' ? '' : undefined,
    weight: 400,
  };
};
