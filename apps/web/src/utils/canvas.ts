import { CanvasObject, Point } from '~/types/canvas';
import { toPng } from 'html-to-image';
import { showTemporaryAlert } from './alert';
import { GRID_SIZE } from './constants';
import { handleCopy } from './clipboard';
import { COLORS } from './constants';

export const setupAndRenderCanvas = (
  canvas: HTMLCanvasElement,
  objects: CanvasObject[],
  selectedObjectIds: string[],
  previewObject: CanvasObject | null,
  selectedTool: string,
  offset: { x: number; y: number },
  scale: number,
  width: number,
  height: number
) => {
  // Get device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Set the logical size of the canvas
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Scale canvas buffer size to device pixel ratio
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Scaling to device pixel ratio
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);

  drawGrid(ctx, width, height, offset, scale);

  // Drawing objects other than text
  objects
    .filter(
      (obj) =>
        obj.type !== 'text' && obj.type !== 'image' && obj.type !== 'embed'
    )
    .forEach((object) => {
      drawObject(ctx, object, selectedObjectIds, scale);
    });

  // Draw preview object
  if (previewObject && selectedTool !== 'select') {
    ctx.globalAlpha = 0.6;
    drawObject(ctx, previewObject, [], scale);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
};

export const drawObject = (
  ctx: CanvasRenderingContext2D,
  object: CanvasObject,
  selectedObjectIds: string[],
  scale: number
): void => {
  // Save the current context state
  ctx.save();

  const isSelected = selectedObjectIds.includes(object.id);

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

  ctx.fillStyle = object.fill ?? COLORS[0];
  ctx.strokeStyle = object.fill ?? COLORS[0];
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
        if (isSelected) {
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
  if (isSelected) {
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
    if (object.type !== 'line' && object.type !== 'arrow') {
      const handleSize = 8 / scale;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 1.5 / scale;

      const space = -1 / scale;

      const corners = [
        {
          x: object.position.x - padding - space,
          y: object.position.y - padding - space,
        },
        {
          x: object.position.x + object.width + padding + space,
          y: object.position.y - padding - space,
        },
        {
          x: object.position.x - padding - space,
          y: object.position.y + object.height + padding + space,
        },
        {
          x: object.position.x + object.width + padding + space,
          y: object.position.y + object.height + padding + space,
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
): void => {
  // Calculate grid boundaries with buffer
  const scaledGridSize = GRID_SIZE * scale;
  const startX = Math.floor(-offset.x / scaledGridSize) * GRID_SIZE;
  const startY = Math.floor(-offset.y / scaledGridSize) * GRID_SIZE;
  const endX =
    Math.ceil((width / scale - offset.x / scale) / GRID_SIZE) * GRID_SIZE;
  const endY =
    Math.ceil((height / scale - offset.y / scale) / GRID_SIZE) * GRID_SIZE;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;

  // Draw vertical lines
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
};

export const getCanvasPoint = (
  e: React.MouseEvent,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
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
): void => {
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

export const exportCanvasAsImage = (
  objects: CanvasObject[],
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>,
  setAlert: React.Dispatch<React.SetStateAction<string>>
): void => {
  // Deselect the object
  setSelectedObjectIds([]);

  if (objects.length === 0) {
    showTemporaryAlert('Canvas is empty!', setAlert);
    return;
  }

  setTimeout(async () => {
    try {
      // Get the canvas container
      const canvasContainer = document.querySelector(
        '#root > div > div:first-child'
      );

      if (!canvasContainer) {
        throw new Error('Canvas container not found');
      }

      if (window.gtag) {
        window.gtag('event', 'save_image', {
          event_category: 'canvas',
        });
      }

      toPng(canvasContainer as HTMLElement, {
        backgroundColor: '#f9fafb',
      })
        .then(function (dataUrl) {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `canvas-${new Date().toISOString().slice(0, -5)}.png`;

          // Download the image
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(function (error) {
          console.error('Error exporting image:', error);
        });
    } catch (error) {
      showTemporaryAlert('Error saving image!', setAlert);
      console.error('Error saving image:', error);
    }
  }, 100);
};

export const shareCanvasAsURL = async (
  objects: CanvasObject[],
  setIsLoading: (loading: boolean) => void,
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>,
  setAlert: React.Dispatch<React.SetStateAction<string>>
): Promise<void> => {
  setIsLoading(true);

  try {
    // Check if canvas is empty
    if (objects.length === 0) {
      showTemporaryAlert('Canvas is empty!', setAlert);
      return;
    }

    // Check for internet connection
    if (!navigator.onLine) {
      showTemporaryAlert(
        'You are offline. Please check your internet connection.',
        setAlert
      );
      return;
    }

    setSelectedObjectIds([]);

    const apiUrl = new URL(import.meta.env.VITE_API_URL);
    const response = await fetch(`${apiUrl.href}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objects),
    });

    if (!response.ok) {
      throw new Error('Error sharing canvas');
    }

    const data = await response.json();

    if (window.gtag) {
      window.gtag('event', 'share_canvas', {
        id: data.id,
        event_category: 'canvas',
      });
    }

    const url = new URL(window.location.href);
    url.searchParams.set('id', data.id);
    await handleCopy(url.toString());

    showTemporaryAlert('Canvas shared! URL copied to clipboard', setAlert);
  } catch (error) {
    console.error('Error sharing canvas:', error);
    showTemporaryAlert('Error sharing canvas', setAlert);
  } finally {
    setIsLoading(false);
  }
};

export const handleZoomToPoint = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  scale: number,
  e: WheelEvent,
  offset: Point
): {
  newScale: number;
  newOffset: Point;
} | void => {
  // Pinch zoom
  const delta = -e.deltaY / 500;
  const newScale = Math.min(Math.max(scale + delta, 0.7), 2);

  const rect = canvasRef.current?.getBoundingClientRect();
  if (!rect) return;

  // Zoom in on the cursor position
  const centerX = e.clientX;
  const centerY = e.clientY;

  const worldX = (centerX - offset.x) / scale;
  const worldY = (centerY - offset.y) / scale;

  const newOffsetX = centerX - worldX * newScale;
  const newOffsetY = centerY - worldY * newScale;

  return {
    newScale,
    newOffset: {
      x: newOffsetX,
      y: newOffsetY,
    },
  };
};
