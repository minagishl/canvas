import { CanvasObject, Point } from '../types/canvas';
export const drawObject = (
  ctx: CanvasRenderingContext2D,
  object: CanvasObject,
  selectedObjectId: string | null,
  scale: number
) => {
  // Save the current context state
  ctx.save();

  // Move to the center of the object and rotate
  ctx.translate(
    object.position.x + object.width / 2,
    object.position.y + object.height / 2
  );
  const DEGREES_TO_RADIANS = Math.PI / 180;
  ctx.rotate((object.rotation || 0) * DEGREES_TO_RADIANS);
  ctx.translate(
    -(object.position.x + object.width / 2),
    -(object.position.y + object.height / 2)
  );

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
    case 'arrow':
      if (object.points && object.points.length === 2) {
        const start = object.points[0];
        const end = object.points[1];

        // Drawing arrow lines
        ctx.beginPath();
        ctx.lineWidth = object.lineWidth || 2 / scale;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Drawing arrow heads
        const headLength = 40 / scale;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
      break;
  }

  // Draw selection border if selected
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

    // Draw resize handles
    if (object.type !== 'line') {
      const handleSize = 8 / scale;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 1 / scale;

      const corners = [
        { x: object.position.x - padding, y: object.position.y - padding },
        {
          x: object.position.x + object.width + padding,
          y: object.position.y - padding,
        },
        {
          x: object.position.x - padding,
          y: object.position.y + object.height + padding,
        },
        {
          x: object.position.x + object.width + padding,
          y: object.position.y + object.height + padding,
        },
      ];

      corners.forEach((corner) => {
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  }

  // Restore the context state
  ctx.restore();
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

export const drawRotationHandle = (
  ctx: CanvasRenderingContext2D,
  object: CanvasObject,
  scale: number
) => {
  const padding = 20 / scale;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 1 / scale;

  // Rotation handle drawn (top center of object)
  ctx.beginPath();
  ctx.arc(
    object.position.x + object.width / 2,
    object.position.y - padding,
    4 / scale,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // Draw a line up to the handle
  ctx.beginPath();
  ctx.moveTo(object.position.x + object.width / 2, object.position.y);
  ctx.lineTo(object.position.x + object.width / 2, object.position.y - padding);
  ctx.stroke();
};
