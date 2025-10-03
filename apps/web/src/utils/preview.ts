import { CanvasObject, Point, ToolType } from '~/types/canvas';
import { MIN_OBJECT_SIZE, NOTE_COLORS } from './constants';
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

  const defaultStickyColor = NOTE_COLORS[0];

  let computedWidth = Math.max(MIN_OBJECT_SIZE, width);
  let computedHeight = Math.max(MIN_OBJECT_SIZE, height);

  if (tool === 'sticky' && width === 0 && height === 0) {
    computedWidth = 200;
    computedHeight = 200;
  }

  const resolvedType = (() => {
    if (tool === 'text') return 'text';
    if (tool === 'circle') return 'circle';
    if (tool === 'sticky') return isPreview ? 'rectangle' : 'sticky';
    return 'rectangle';
  })();

  return {
    id: isPreview ? 'preview-' + tool : generateRandomId(),
    type: resolvedType,
    position: {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y),
    },
    width: computedWidth,
    height: computedHeight,
    fill: tool === 'sticky' ? defaultStickyColor : '#4f46e5',
    text: tool === 'text' || tool === 'sticky' ? '' : undefined,
    weight: tool === 'sticky' ? 500 : 400,
    textColor: tool === 'sticky' ? '#1f2937' : undefined,
    fontSize: tool === 'sticky' ? 18 : undefined,
  };
};
