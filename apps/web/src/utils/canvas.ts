import { CanvasObject, Point } from '../types/canvas';

export const drawObject = (
  ctx: CanvasRenderingContext2D,
  object: CanvasObject,
  selectedObjectId: string | null,
  scale: number
) => {
  ctx.fillStyle = object.fill;
  ctx.strokeStyle = object.fill;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (object.type) {
    case 'rectangle':
      ctx.fillRect(
        object.position.x,
        object.position.y,
        object.width,
        object.height
      );
      break;
    case 'circle':
      ctx.beginPath();
      ctx.ellipse(
        object.position.x + object.width / 2,
        object.position.y + object.height / 2,
        object.width / 2,
        object.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    case 'line':
      if (object.points && object.points.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = object.lineWidth || 2 / scale;
        ctx.moveTo(object.points[0].x, object.points[0].y);
        for (let i = 1; i < object.points.length; i++) {
          ctx.lineTo(object.points[i].x, object.points[i].y);
        }
        ctx.stroke();

        // Display the boundary box when selected
        if (object.id === selectedObjectId) {
          const padding = 8 / scale;
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            object.position.x - padding,
            object.position.y - padding,
            object.width + padding * 2,
            object.height + padding * 2
          );
        }
      }
      break;
    case 'image':
      if (object.imageData) {
        const img = new Image();
        img.src = object.imageData;
        img.onload = () => {
          ctx.drawImage(
            img,
            object.position.x,
            object.position.y,
            object.width,
            object.height
          );
        };
      }
  }
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: { x: number; y: number },
  scale: number
) => {
  const gridSize = 40;

  // Calculate grid boundaries with buffer
  const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
  const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
  const endX =
    Math.ceil((width / scale - offset.x / scale) / gridSize) * gridSize;
  const endY =
    Math.ceil((height / scale - offset.y / scale) / gridSize) * gridSize;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;

  // Draw vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
};

export const getCanvasPoint = (
  e: React.MouseEvent,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  offset: Point,
  scale: number
): Point => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - offset.x) / scale,
    y: (e.clientY - rect.top - offset.y) / scale,
  };
};
