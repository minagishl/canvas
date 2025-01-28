import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, CanvasObject, ResizeHandle, LinePoint } from '../types/canvas';
import { CanvasDataSchema } from '../schema';
import { parseAsync } from 'valibot';

// Utility functions
import { showTemporaryAlert } from '../utils/alert';
import { findClickedObject } from '../utils/selection';
import {
  setupAndRenderCanvas,
  getCanvasPoint,
  exportCanvasAsImage,
  shareCanvasAsURL,
} from '../utils/canvas';
import {
  copyObject,
  deleteObject,
  lockObject,
  restoreObject,
  upObject,
  downObject,
} from '../utils/object';
import { createPreviewObject } from '../utils/preview';
import { calculateTooltipPosition } from '../utils/tooltip';
import { fetchRandomGif, handleFileChange } from '../utils/image';
import { textToggleBold, textToggleItalic } from '../utils/text';
import { snapToGrid } from '../utils/grid';
import { handlePaste } from '../utils/clipboard';
import { handleObjectResize } from '../utils/resize';
import {
  getTouchPoint,
  getTouchDistance,
  getTouchCenter,
} from '../utils/touch';

// Contexts
import { useCanvasContext } from '../contexts/CanvasContext';
import { useAlertContext } from '../contexts/AlertContext';

// Objects
import { EmbedObject } from './objects/Embed';
import { TextObject } from './objects/Text';
import { ImageObject } from './objects/Image';

// Components
import { Tooltip } from './Tooltip';
import { Alert } from './Alert';
import { Modal } from './Modal';
import { Loading } from './Loading';

// Hooks
import { useWindowSize } from '../hooks/window';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setSelectedTool,
    selectedTool,
    setSelectedObjectId,
    selectedObjectId,
    setScale,
    scale,
    setOffset,
    offset,
    setObjects,
    objects,
    addObject,
  } = useCanvasContext();
  const { alert, setAlert } = useAlertContext();
  const [width, height] = useWindowSize();
  const [imagePosition, setImagePosition] = useState<Point | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [resizing, setResizing] = useState<ResizeHandle>(null);
  const [previewObject, setPreviewObject] = useState<CanvasObject | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [currentLine, setCurrentLine] = useState<LinePoint[]>([]);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const [copyObjectId, setCopyObjectId] = useState<string | null>(null);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [remoteObjects, setRemoteObjects] = useState<CanvasObject[] | null>(
    null
  );

  // Confirm reload / tab deletion.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If there are no objects, no need to confirm
      if (objects.length === 0) return;

      if (JSON.stringify(remoteObjects) !== JSON.stringify(objects))
        e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [objects, remoteObjects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas)
      setupAndRenderCanvas(
        canvas,
        objects,
        selectedObjectId,
        previewObject,
        selectedTool,
        offset,
        scale,
        width,
        height
      );
  }, [
    scale,
    offset,
    objects,
    previewObject,
    selectedTool,
    selectedObjectId,
    width,
    height,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, resizeHandle?: ResizeHandle) => {
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

      if (selectedTool === 'gif') {
        e.preventDefault();
        e.stopPropagation();
        const point = getCanvasPoint(e, canvasRef, offset, scale);
        setImagePosition(point);
        fetchRandomGif(
          imagePosition,
          setAlert,
          addObject,
          setImagePosition,
          setSelectedTool
        );
        return;
      }

      if (selectedTool === 'arrow') {
        setCurrentLine([point]);
        setIsDragging(true);
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
        const selectedObject = objects.find(
          (obj) => obj.id === selectedObjectId
        );
        if (
          selectedObject &&
          selectedObject.type !== 'line' &&
          selectedObject.type !== 'arrow'
        ) {
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
        setIsEditingId('');
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
        const clickedCanvasObject = findClickedObject(point, objects);

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

          // Left click does nothing (current status)
          if (!isDragging && e.buttons === 1) {
            return;
          }

          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
        }
      } else {
        setStartPoint(point);
        setIsDragging(true);
      }
    },
    [
      offset,
      scale,
      selectedObjectId,
      selectedTool,
      imagePosition,
      setAlert,
      addObject,
      setSelectedTool,
      objects,
      setSelectedObjectId,
      isDragging,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
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

      const isPen = selectedTool === 'pen';
      if (isDragging && (isPen || selectedTool === 'arrow')) {
        const point = getCanvasPoint(e, canvasRef, offset, scale);

        // Add points to the line object
        if (isPen) {
          setCurrentLine((prev) => [...prev, point]);
        }

        setPreviewObject({
          id: 'preview',
          type: isPen ? 'line' : 'arrow',
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
        const selectedObject = objects.find(
          (obj) => obj.id === selectedObjectId
        );

        // Prevent resizing of locked objects
        if (selectedObject?.locked) return;

        if (selectedObject) {
          const resizedObject = handleObjectResize({
            selectedObject,
            startPoint,
            currentPoint,
            resizeHandle: resizing,
            isShiftPressed: e.shiftKey,
            snapToGridEnabled:
              import.meta.env.VITE_RESIZE_SNAP_ENABLED === 'true' &&
              snapToGridEnabled,
          });

          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObjectId ? { ...obj, ...resizedObject } : obj
          );

          setObjects(updatedObjects);
          setStartPoint(currentPoint);
        }
      }

      if (isDragging) {
        const selectedObject = objects.find(
          (obj) => obj.id === selectedObjectId
        );

        // Prevent movement of locked objects
        if (selectedObject?.locked) return;

        if (
          selectedTool === 'select' &&
          selectedObjectId &&
          startPoint &&
          e.buttons === 1
        ) {
          const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);

          // Special processing for line and arrow objects
          if (
            (selectedObject?.type === 'line' ||
              selectedObject?.type === 'arrow') &&
            selectedObject.points
          ) {
            // Calculate the amount of movement
            const dx =
              currentPoint.x - dragOffset.x - selectedObject.position.x;
            const dy =
              currentPoint.y - dragOffset.y - selectedObject.position.y;

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
            if (snapToGridEnabled) {
              // Calculate the new position of the object
              const newPosition = {
                x: currentPoint.x - dragOffset.x,
                y: currentPoint.y - dragOffset.y,
              };

              // nap the position to the grid
              const snappedPosition = snapToGrid(newPosition);

              const updatedObjects = objects.map((obj) =>
                obj.id === selectedObjectId
                  ? { ...obj, position: snappedPosition }
                  : obj
              );

              setObjects(updatedObjects);
            } else {
              // If grid snap is disabled, process as usual
              const newX = currentPoint.x - dragOffset.x;
              const newY = currentPoint.y - dragOffset.y;

              const updatedObjects = objects.map((obj) =>
                obj.id === selectedObjectId
                  ? { ...obj, position: { x: newX, y: newY } }
                  : obj
              );

              setObjects(updatedObjects);
            }
          }
        } else if (startPoint && selectedTool !== 'image') {
          const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);

          const snappedPoint = snapToGridEnabled
            ? snapToGrid(currentPoint)
            : currentPoint;

          const preview = createPreviewObject(
            selectedTool,
            snapToGridEnabled ? snapToGrid(startPoint) : startPoint,
            snappedPoint,
            e.shiftKey
          );
          setPreviewObject(preview);
        }
      }
    },
    [
      currentLine,
      dragOffset.x,
      dragOffset.y,
      isDragging,
      isPanning,
      objects,
      offset,
      panStart,
      resizing,
      scale,
      selectedObjectId,
      selectedTool,
      setObjects,
      setOffset,
      snapToGridEnabled,
      startPoint,
    ]
  );

  const handleMouseUp = (e: React.MouseEvent) => {
    if (selectedTool === 'arrow' && currentLine.length > 0) {
      const point = getCanvasPoint(e, canvasRef, offset, scale);

      if (currentLine.length === 1) {
        // alculate the bounding box using the start and end points
        const [start] = currentLine;
        const minX = Math.min(start.x, point.x);
        const maxX = Math.max(start.x, point.x);
        const minY = Math.min(start.y, point.y);
        const maxY = Math.max(start.y, point.y);

        const newArrow: CanvasObject = {
          id: Math.random().toString(36).slice(2, 11),
          type: 'arrow',
          position: { x: minX, y: minY },
          width: maxX - minX,
          height: maxY - minY,
          fill: '#4f46e5',
          points: [...currentLine, point],
        };

        addObject(newArrow);
        setCurrentLine([]);
        setPreviewObject(null);
        setIsDragging(false);
        setSelectedTool('select');
      } else {
        setCurrentLine([point]);
      }
      return;
    }

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
      return;
    }

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
      const snappedStartPoint = snapToGridEnabled
        ? snapToGrid(startPoint)
        : startPoint;
      const snappedEndPoint = snapToGridEnabled
        ? snapToGrid(endPoint)
        : endPoint;

      const newObject = createPreviewObject(
        selectedTool,
        snappedStartPoint,
        snappedEndPoint,
        e.shiftKey
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

      if (!e.ctrlKey) {
        setOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
        return;
      }

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange({
      file,
      imagePosition,
      setImageCache,
      addObject,
      setImagePosition,
      setSelectedTool,
      setAlert,
    });
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
      const point = getTouchPoint(touch, canvasRef, offset, scale);
      if (selectedTool === 'select') {
        const clickedObject = findClickedObject(point, objects);

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
          const currentPoint = getTouchPoint(touch, canvasRef, offset, scale);
          const newX = currentPoint.x - dragOffset.x;
          const newY = currentPoint.y - dragOffset.y;

          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObjectId
              ? { ...obj, position: { x: newX, y: newY } }
              : obj
          );
          setObjects(updatedObjects);
        } else if (startPoint) {
          const currentPoint = getTouchPoint(touch, canvasRef, offset, scale);
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
      const point = getTouchPoint(touch, canvasRef, offset, scale);
      setImagePosition(point);
      fileInputRef.current?.click();
    }

    setLastTouchDistance(0);
  };

  // Delete an object with the Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingId !== '') return;

      if ((e.key === '=' || e.key === '-') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteObject(selectedObjectId, setObjects, setSelectedObjectId);
      }

      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        setCopyObjectId(selectedObjectId);
        // Clear the clipboard
        navigator.clipboard.writeText('').catch((error) => {
          console.error('Error clearing clipboard:', error);
        });
      }

      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        restoreObject(objects, setObjects, setSelectedObjectId);
      }

      // Italicize text with Cmd/Ctrl + I
      if (e.key === 'i' && (e.metaKey || e.ctrlKey) && selectedObjectId) {
        textToggleItalic(objects, selectedObjectId, setObjects);
      }

      // Bold text with Cmd/Ctrl + B
      if (e.key === 'b' && (e.metaKey || e.ctrlKey) && selectedObjectId) {
        textToggleBold(objects, selectedObjectId, setObjects);
      }

      if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        handlePaste(
          width,
          height,
          canvasRef,
          offset,
          scale,
          addObject,
          setSelectedObjectId,
          objects,
          copyObjectId,
          setObjects
        );
      }
      // Lock object with Cmd/Ctrl + Shift + L
      if (e.key === 'l' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        lockObject(selectedObjectId, setObjects);
      }

      // Export canvas as image with Cmd/Ctrl + E
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        exportCanvasAsImage(objects, setSelectedObjectId, setAlert);
      }

      // Duplicate object with Cmd/Ctrl + D
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        copyObject(objects, selectedObjectId, setObjects, setSelectedObjectId);
      }

      // Grid snap toggle with Cmd/Ctrl + G
      if (e.key === 'g' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSnapToGridEnabled((prev) => !prev);
        showTemporaryAlert(
          `Grid snap ${snapToGridEnabled ? 'disabled' : 'enabled'}`,
          setAlert
        );
      }

      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsModalOpen(!isModalOpen);
        setSelectedTool('select');
      }

      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        shareCanvasAsURL(objects, {
          setIsLoading,
          setSelectedObjectId,
          setAlert,
        });
      }

      if (e.key === 'ArrowUp' && selectedObjectId) {
        e.preventDefault();
        upObject(objects, selectedObjectId, setObjects);
      }

      if (e.key === 'ArrowDown' && selectedObjectId) {
        e.preventDefault();
        downObject(objects, selectedObjectId, setObjects);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isEditingId,
    objects,
    selectedObjectId,
    setObjects,
    setSelectedObjectId,
    addObject,
    copyObjectId,
    width,
    height,
    offset,
    scale,
    setAlert,
    setSelectedTool,
    snapToGridEnabled,
    setIsModalOpen,
    isModalOpen,
  ]);

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

  const handleDeleteParms = (params: URLSearchParams) => {
    // Remove the id parameter from URL without page reload
    params.delete('id');
    const newUrl =
      window.location.pathname +
      (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (window.gtag) {
      window.gtag('event', 'view_item', {
        items: id,
        event_category: 'canvas',
      });
    }

    if (id) {
      const apiUrl = new URL(import.meta.env.VITE_API_URL);
      fetch(`${apiUrl.href}${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          if (data.content) {
            try {
              const result = await parseAsync(CanvasDataSchema, data);
              setObjects(objects.concat(result.content as CanvasObject[]));
              showTemporaryAlert('Canvas data loaded', setAlert);
              setRemoteObjects(result.content as CanvasObject[]);
            } catch (error) {
              console.error('Invalid canvas data:', error);
              showTemporaryAlert('Invalid canvas data format', setAlert);
            }
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

  const onTextChange = () => {
    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (selectedObject && selectedObjectId && selectedObject.type === 'text') {
      const position = calculateTooltipPosition({
        selectedObject,
        selectedObjectId,
        scale,
        offset,
      });
      setTooltipPosition(position);
    }
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 left-0 top-0 ${
          selectedTool === 'select'
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-default'
            : selectedTool === 'text' ||
                selectedTool === 'image' ||
                selectedTool === 'gif'
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
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {selectedObjectId && (
        <Tooltip
          position={tooltipPosition}
          isDragging={isDragging}
          setIsEditingId={setIsEditingId}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileInputChange}
      />

      <Alert message={alert} />
      <Loading hidden={!isLoading} />

      {objects
        .filter(
          (obj) =>
            obj.type === 'text' || obj.type === 'image' || obj.type === 'embed'
        )
        .map((obj) => {
          if (obj.type === 'image') {
            return (
              <ImageObject
                scale={scale}
                offset={offset}
                obj={obj as CanvasObject & { type: 'image' }}
                key={obj.id}
                selectedObjectId={selectedObjectId}
                isResizing={resizing !== null}
                isDragging={isDragging}
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
                selectedTool={selectedTool}
                scale={scale}
                offset={offset}
                obj={obj as CanvasObject & { type: 'text' }}
                key={obj.id}
                selectedObjectId={selectedObjectId}
                isResizing={resizing !== null}
                isEditingId={isEditingId}
                isDragging={isDragging}
                onTextChange={onTextChange}
                onMouseDown={(e) => {
                  if (selectedTool === 'select') {
                    handleMouseDown(e);
                  }
                }}
              />
            );
          }

          if (obj.type === 'embed') {
            return (
              <EmbedObject
                scale={scale}
                offset={offset}
                obj={obj as CanvasObject & { type: 'embed' }}
                key={obj.id}
                selectedObjectId={selectedObjectId}
                isResizing={resizing !== null}
                isDragging={isDragging}
                handleMouseDown={(e, handle) =>
                  handleMouseDown(e, handle as ResizeHandle)
                }
              />
            );
          }

          return null;
        })}

      {isModalOpen && <Modal close={() => setIsModalOpen(false)} />}
    </div>
  );
};
