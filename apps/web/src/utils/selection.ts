import { CanvasObject, Point, LinePoint } from '../types/canvas';

export const isPointNearLine = (
  point: Point,
  linePoints: LinePoint[],
  threshold: number = 5
): boolean => {
  for (let i = 1; i < linePoints.length; i++) {
    const start = linePoints[i - 1];
    const end = linePoints[i];

    // Calculate the distance between the line segment and the point
    const a = end.y - start.y;
    const b = start.x - end.x;
    const c = end.x * start.y - start.x * end.y;

    const distance =
      Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);

    // Check if the point is within the range of the line segment
    const minX = Math.min(start.x, end.x) - threshold;
    const maxX = Math.max(start.x, end.x) + threshold;
    const minY = Math.min(start.y, end.y) - threshold;
    const maxY = Math.max(start.y, end.y) + threshold;

    if (
      distance <= threshold &&
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    ) {
      return true;
    }
  }
  return false;
};

export const findClickedObject = (point: Point, objects: CanvasObject[]) => {
  const reverseObjects = [...objects].reverse();
  return reverseObjects.find((obj) => {
    if (obj.type === 'line' || obj.type === 'arrow') {
      return obj.points && isPointNearLine(point, obj.points);
    }

    // Images and text do nothing.
    if (obj.type === 'image' || obj.type === 'text') {
      return null;
    }

    return (
      point.x >= obj.position.x &&
      point.x <= obj.position.x + obj.width &&
      point.y >= obj.position.y &&
      point.y <= obj.position.y + obj.height
    );
  });
};
