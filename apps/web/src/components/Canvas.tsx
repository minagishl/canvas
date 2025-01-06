import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { drawObject, drawGrid, getCanvasPoint } from '../utils/canvas';
import { Point, CanvasObject, ResizeHandle, LinePoint } from '../types/canvas';
import { createPreviewObject } from '../utils/preview';
import { TextObject } from './objects/Text';
import { ImageObject } from './objects/Image';
import { Tooltip } from './Tooltip';
import { handleCopyObject } from '../utils/copy';
import { handleDeleteObject, handleDeleteParms } from '../utils/delete';
import { handleRestoreObjects } from '../utils/restore';
import { calculateTooltipPosition } from '../utils/tooltip';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    scale,
    setScale,
    offset,
    setOffset,
    objects,
    addObject,
    selectedTool,
    setSelectedTool,
    setObjects,
    selectedObjectId,
    setSelectedObjectId,
  } = useCanvasContext();
  const [imagePosition, setImagePosition] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [resizing, setResizing] = useState<ResizeHandle>(null);
  const [previewObject, setPreviewObject] = useState<CanvasObject | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [currentLine, setCurrentLine] = useState<LinePoint[]>([]);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    drawGrid(ctx, canvas.width, canvas.height, offset, scale);

    // Drawing objects other than text
    objects
      .filter((obj) => obj.type !== 'text' && obj.type !== 'image')
      .forEach((object) => {
        drawObject(ctx, object, selectedObjectId, scale);
        if (object.id === selectedObjectId) {
          // Added selection border padding
          const padding = 8 / scale;
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 2 / scale;

          // Drawing borders considering padding
          ctx.strokeRect(
            object.position.x - padding,
            object.position.y - padding,
            object.width + padding * 2,
            object.height + padding * 2
          );

          const handleSize = 8 / scale;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 1 / scale;

          if (object.type === 'line') return;

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
      });

    // Draw preview object
    if (previewObject && selectedTool !== 'select') {
      ctx.globalAlpha = 0.6;
      drawObject(ctx, previewObject, null, scale);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [scale, offset, objects, previewObject, selectedTool, selectedObjectId]);

  const handleMouseDown = (
    e: React.MouseEvent,
    resizeHandle?: ResizeHandle
  ) => {
    // Prevent the context menu from appearing
    if (e.button === 2) {
      e.preventDefault();
    }

    const point = getCanvasPoint(e, canvasRef, offset, scale);

    if (resizeHandle && selectedObjectId) {
      // If the resize handle is clicked
      setResizing(resizeHandle);
      setStartPoint(point);
      return;
    }

    if (selectedTool === 'pen') {
      const point = getCanvasPoint(e, canvasRef, offset, scale);
      setCurrentLine([point]);
      setIsDragging(true);
      return;
    }

    if (selectedTool === 'select' && selectedObjectId) {
      // Resize handle detection
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
      if (selectedObject && selectedObject.type !== 'line') {
        const handleSize = 8 / scale;
        const padding = 8 / scale;

        const handles = {
          'top-left': {
            x: selectedObject.position.x - padding,
            y: selectedObject.position.y - padding,
          },
          'top-right': {
            x: selectedObject.position.x + selectedObject.width + padding,
            y: selectedObject.position.y - padding,
          },
          'bottom-left': {
            x: selectedObject.position.x - padding,
            y: selectedObject.position.y + selectedObject.height + padding,
          },
          'bottom-right': {
            x: selectedObject.position.x + selectedObject.width + padding,
            y: selectedObject.position.y + selectedObject.height + padding,
          },
        };

        // Check the distance to each handle
        for (const [handle, pos] of Object.entries(handles) as [
          ResizeHandle,
          Point,
        ][]) {
          const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
          if (distance <= handleSize) {
            setResizing(handle);
            setStartPoint(point);
            return;
          }
        }
      }
    }

    if (selectedTool === 'select') {
      setIsEditing(false);
      // Clicking on a text or image object
      const clickedHTMLObject = e.target as HTMLElement;
      const isHTMLObject =
        clickedHTMLObject.tagName === 'DIV' ||
        clickedHTMLObject.tagName === 'IMG';

      if (isHTMLObject) {
        // When an HTML element (text or image) is clicked
        const objectId = clickedHTMLObject
          .closest('[data-object-id]')
          ?.getAttribute('data-object-id');
        if (objectId) {
          e.preventDefault(); // Prevent text selection
          e.stopPropagation(); // Prevent event propagation to canvas
          setSelectedObjectId(objectId);
          setIsDragging(true);
          setStartPoint(point);

          const clickedObject = objects.find((obj) => obj.id === objectId);
          if (clickedObject) {
            setDragOffset({
              x: point.x - clickedObject.position.x,
              y: point.y - clickedObject.position.y,
            });
          }
          return;
        }
      }

      // When an object on the canvas is clicked
      const clickedCanvasObject = findClickedObject(point);

      if (clickedCanvasObject) {
        setSelectedObjectId(clickedCanvasObject.id);
        setIsDragging(true);
        setStartPoint(point);
        setDragOffset({
          x: point.x - clickedCanvasObject.position.x,
          y: point.y - clickedCanvasObject.position.y,
        });
      } else {
        setSelectedObjectId(null);
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    } else {
      setStartPoint(point);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart && (e.buttons === 2 || e.buttons === 4)) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      });

      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && selectedTool === 'pen') {
      const point = getCanvasPoint(e, canvasRef, offset, scale);
      setCurrentLine((prev) => [...prev, point]);

      setPreviewObject({
        id: 'preview',
        type: 'line',
        position: { x: 0, y: 0 },
        width: 0,
        height: 0,
        fill: '#4f46e5',
        points: [...currentLine, point],
      });
      return;
    }

    if (resizing && selectedObjectId && startPoint) {
      const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

      // Prevent resizing of locked objects
      if (selectedObject?.locked) return;

      if (selectedObject) {
        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;

        const newPosition = { ...selectedObject.position };
        let newWidth = selectedObject.width;
        let newHeight = selectedObject.height;

        // Maintain aspect ratio when Shift key is pressed
        if (e.shiftKey || selectedObject.type === 'image') {
          const aspectRatio = selectedObject.width / selectedObject.height;

          // Processing changes according to the position of the resizing handle
          switch (resizing) {
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
          switch (resizing) {
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
          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObjectId
              ? {
                  ...obj,
                  position: newPosition,
                  width: newWidth,
                  height: newHeight,
                }
              : obj
          );
          setObjects(updatedObjects);
          setStartPoint(currentPoint);
        }
      }
      return;
    }

    if (isDragging) {
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

      // Prevent movement of locked objects
      if (selectedObject?.locked) return;

      if (
        selectedTool === 'select' &&
        selectedObjectId &&
        startPoint &&
        e.buttons === 1
      ) {
        const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);

        // Special processing for line objects
        if (selectedObject?.type === 'line' && selectedObject.points) {
          // Calculate the amount of movement
          const dx = currentPoint.x - dragOffset.x - selectedObject.position.x;
          const dy = currentPoint.y - dragOffset.y - selectedObject.position.y;

          const updatedObjects = objects.map((obj) => {
            if (obj.id === selectedObjectId) {
              // Move all points
              const newPoints = obj.points!.map((point) => ({
                x: point.x + dx,
                y: point.y + dy,
              }));

              // Calculate the new bounding box
              const minX = Math.min(...newPoints.map((p) => p.x));
              const maxX = Math.max(...newPoints.map((p) => p.x));
              const minY = Math.min(...newPoints.map((p) => p.y));
              const maxY = Math.max(...newPoints.map((p) => p.y));

              return {
                ...obj,
                position: { x: minX, y: minY },
                width: maxX - minX,
                height: maxY - minY,
                points: newPoints,
              };
            }
            return obj;
          });

          setObjects(updatedObjects);
          // Update the reference point for the next movement
          setStartPoint(currentPoint);
        } else {
          // Normal object movement process (existing code)
          const newX = currentPoint.x - dragOffset.x;
          const newY = currentPoint.y - dragOffset.y;

          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObjectId
              ? { ...obj, position: { x: newX, y: newY } }
              : obj
          );
          setObjects(updatedObjects);
        }
      } else if (startPoint && selectedTool !== 'image') {
        const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);
        const preview = createPreviewObject(
          selectedTool,
          startPoint,
          currentPoint,
          e.shiftKey
        );
        setPreviewObject(preview);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (selectedTool === 'pen' && currentLine.length > 0) {
      // Calculate the bounding box from the line coordinates
      const minX = Math.min(...currentLine.map((point) => point.x));
      const maxX = Math.max(...currentLine.map((point) => point.x));
      const minY = Math.min(...currentLine.map((point) => point.y));
      const maxY = Math.max(...currentLine.map((point) => point.y));

      // Create a line object
      const newLine: CanvasObject = {
        id: Math.random().toString(36).slice(2, 11),
        type: 'line',
        position: { x: minX, y: minY },
        width: maxX - minX,
        height: maxY - minY,
        fill: '#4f46e5',
        points: currentLine,
      };

      addObject(newLine);
      setCurrentLine([]);
      setPreviewObject(null);
      setIsDragging(false);
      return;
    }

    if (resizing) {
      setResizing(null);
      setStartPoint(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setStartPoint(null);
      setDragOffset({ x: 0, y: 0 });
    }

    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      canvasRef.current!.style.cursor = 'default';
      return;
    }

    const isShiftPressed = e.shiftKey; // Get Shift key status

    if (selectedTool !== 'select' && !isPanning) {
      if (!startPoint) {
        setIsDragging(false);
        setStartPoint(null);
        setPreviewObject(null);
        return;
      }

      if (selectedTool === 'image') {
        e.preventDefault();
        e.stopPropagation();
        const point = getCanvasPoint(e, canvasRef, offset, scale);
        setImagePosition(point);
        fileInputRef.current?.click();
        setSelectedTool('select');
        return;
      }

      const endPoint = getCanvasPoint(e, canvasRef, offset, scale);
      const newObject = createPreviewObject(
        selectedTool,
        startPoint,
        endPoint,
        isShiftPressed
      );
      addObject(newObject);
      setSelectedTool('select');
      setIsDragging(false);
      setStartPoint(null);
      setPreviewObject(null);
    }
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

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

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });

      if (e.shiftKey) {
        // Pan operation with two fingers
        setOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [scale, offset, setScale, setOffset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imagePosition) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        // Image resizing process
        const canvas = document.createElement('canvas');
        const maxSize = 500;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const resizedImageData = canvas.toDataURL('image/jpeg', 0.8);

        // Save to cache
        const id = Math.random().toString(36).substr(2, 9);
        setImageCache((prev) => ({ ...prev, [id]: resizedImageData }));

        const imageObject: CanvasObject = {
          id,
          type: 'image',
          position: imagePosition,
          width,
          height,
          fill: 'transparent',
          imageData: resizedImageData,
        };

        addObject(imageObject);
        setImagePosition(null);
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

  // Add touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartTime(Date.now());

    if (e.touches.length === 2) {
      // Start pinch gesture
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      const point = getTouchPoint(touch);
      if (selectedTool === 'select') {
        const clickedObject = findClickedObject(point);

        if (clickedObject) {
          setSelectedObjectId(clickedObject.id);
          setIsDragging(true);
          setStartPoint(point);
          setDragOffset({
            x: point.x - clickedObject.position.x,
            y: point.y - clickedObject.position.y,
          });
        } else {
          setSelectedObjectId(null);
          setIsPanning(true);
          setPanStart({ x: touch.clientX, y: touch.clientY });
        }
      } else {
        setStartPoint(point);
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch zoom processing
      const distance = getTouchDistance(e.touches);
      const delta = (distance - lastTouchDistance) * 0.01;
      const newScale = Math.min(Math.max(scale + delta, 0.7), 2);

      const center = getTouchCenter(e.touches);
      const worldX = (center.x - offset.x) / scale;
      const worldY = (center.y - offset.y) / scale;

      const newOffsetX = center.x - worldX * newScale;
      const newOffsetY = center.y - worldY * newScale;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isDragging) {
        if (selectedTool === 'select' && selectedObjectId && startPoint) {
          const currentPoint = getTouchPoint(touch);
          const newX = currentPoint.x - dragOffset.x;
          const newY = currentPoint.y - dragOffset.y;

          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObjectId
              ? { ...obj, position: { x: newX, y: newY } }
              : obj
          );
          setObjects(updatedObjects);
        } else if (startPoint) {
          const currentPoint = getTouchPoint(touch);
          const preview = createPreviewObject(
            selectedTool,
            startPoint,
            currentPoint,
            false
          );
          setPreviewObject(preview);
        }
      } else if (isPanning) {
        if (panStart) {
          const deltaX = touch.clientX - panStart.x;
          const deltaY = touch.clientY - panStart.y;
          setOffset({
            x: offset.x + deltaX,
            y: offset.y + deltaY,
          });
        }
        setPanStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchDuration = Date.now() - touchStartTime;

    if (isDragging) {
      setIsDragging(false);
      setStartPoint(null);
      setDragOffset({ x: 0, y: 0 });
    }

    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }

    if (touchDuration < 200 && !isDragging && selectedTool === 'image') {
      const touch = e.changedTouches[0];
      const point = getTouchPoint(touch);
      setImagePosition(point);
      fileInputRef.current?.click();
    }

    setLastTouchDistance(0);
  };

  // Utility functions
  const getTouchPoint = (touch: React.Touch): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left - offset.x) / scale,
      y: (touch.clientY - rect.top - offset.y) / scale,
    };
  };

  const getTouchDistance = (touches: React.TouchList): number => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList): Point => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // Delete an object with the Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteObject(selectedObjectId, setObjects, setSelectedObjectId);
      }

      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        handleCopyObject(objects, selectedObjectId, setObjects);
      }

      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        handleRestoreObjects(objects, setObjects, setSelectedObjectId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, objects, selectedObjectId, setObjects, setSelectedObjectId]);

  useEffect(() => {
    if (selectedObjectId) {
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
      if (selectedObject) {
        const position = calculateTooltipPosition({
          selectedObject,
          selectedObjectId,
          scale,
          offset,
        });
        setTooltipPosition(position);
      }
    } else {
      setTooltipPosition(null);
    }
  }, [selectedObjectId, objects, scale, offset]);

  const isPointNearLine = (
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

  const findClickedObject = (point: Point) => {
    // Check line objects first
    const lineObject = objects.find((obj) => {
      if (obj.type === 'line' && obj.points) {
        return isPointNearLine(point, obj.points);
      }
      return false;
    });

    if (lineObject) {
      return lineObject;
    }

    // Check other objects
    return objects.find(
      (obj) =>
        obj.type !== 'line' &&
        point.x >= obj.position.x &&
        point.x <= obj.position.x + obj.width &&
        point.y >= obj.position.y &&
        point.y <= obj.position.y + obj.height
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      const apiUrl = new URL(import.meta.env.VITE_API_URL);
      fetch(`${apiUrl.href}${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.content) {
            setObjects(objects.concat(data.content));
          }
        })
        .catch((error) => {
          console.error('Error fetching canvas data:', error);
        });
      // Delete the id parameter from the URL without reloading the page
      handleDeleteParms(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${
          selectedTool === 'select'
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab active:cursor-grabbing'
            : selectedTool === 'text' || selectedTool === 'image'
              ? 'cursor-pointer'
              : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setStartPoint(null);
          setPreviewObject(null);
          setIsPanning(false);
          setPanStart(null);
          canvasRef.current!.style.cursor = 'default';
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {selectedObjectId && (
        <Tooltip position={tooltipPosition} isDragging={isDragging} />
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {objects
        .filter((obj) => obj.type === 'text' || obj.type === 'image')
        .map((obj) => {
          if (obj.type === 'image') {
            return (
              <ImageObject
                key={obj.id}
                obj={obj as CanvasObject & { type: 'image' }}
                isSelected={obj.id === selectedObjectId}
                isDragging={isDragging}
                isResizing={resizing !== null}
                scale={scale}
                offset={offset}
                imageCache={imageCache}
                handleMouseDown={(e, handle) =>
                  handleMouseDown(e, handle as ResizeHandle)
                }
              />
            );
          }

          if (obj.type === 'text') {
            return (
              <TextObject
                key={obj.id}
                obj={obj as CanvasObject & { type: 'text' }}
                scale={scale}
                offset={offset}
                isSelected={obj.id === selectedObjectId}
                isDragging={isDragging}
                isResizing={resizing !== null}
                isEditing={isEditing && obj.id === selectedObjectId}
                selectedTool={selectedTool}
                onMouseDown={(e) => {
                  if (selectedTool === 'select') {
                    handleMouseDown(e);
                  }
                }}
                onEditStart={() => setIsEditing(true)}
              />
            );
          }

          return null;
        })}
    </div>
  );
};
