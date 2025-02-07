import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, CanvasObject, ResizeHandle, LinePoint } from '~/types/canvas';
import { CanvasDataSchema } from '~/schema';
import { parseAsync } from 'valibot';

// Utility functions
import { showTemporaryAlert } from '~/utils/alert';
import { findClickedObject } from '~/utils/selection';
import {
  setupAndRenderCanvas,
  getCanvasPoint,
  exportCanvasAsImage,
  shareCanvasAsURL,
  handleZoomToPoint,
} from '~/utils/canvas';
import {
  copyObject,
  deleteObject,
  lockObject,
  upObject,
  downObject,
  leftObject,
  rightObject,
} from '~/utils/object';
import { createPreviewObject } from '~/utils/preview';
import { calculateTooltipPosition } from '~/utils/tooltip';
import { fetchRandomGif, handleFileChange } from '~/utils/image';
import { textToggleBold, textToggleItalic } from '~/utils/text';
import { snapToGrid } from '~/utils/grid';
import { handlePaste } from '~/utils/clipboard';
import { handleObjectResize } from '~/utils/resize';
import { getTouchPoint, getTouchDistance, getTouchCenter } from '~/utils/touch';
import { handleAddObject } from '~/utils/history';
import { aIGenerate } from '~/utils/generate';
import { isMobile } from '~/utils/device';

// Contexts
import { useCanvasContext } from '~/contexts/CanvasContext';
import { useAlertContext } from '~/contexts/AlertContext';
import { useHistoryContext } from '~/contexts/HistoryContext';
import { useAIContext } from '~/contexts/AIContext';

// Objects
import { EmbedObject } from './objects/Embed';
import { TextObject } from './objects/Text';
import { ImageObject } from './objects/Image';

// Components
import { Tooltip } from './Tooltip';
import { Alert } from './Alert';
import { Modal, MobileModal, TextModal, ModalInput } from './Modal';
import { Loading } from './Loading';
import { Drag } from './Drag';

// Hooks
import { useWindowSize } from '~/hooks/window';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setSelectedTool,
    selectedTool,
    setSelectedObjectIds,
    selectedObjectIds,
    setScale,
    scale,
    setOffset,
    offset,
    setObjects,
    objects,
    addObject,
  } = useCanvasContext();
  const { history, setHistory, currentHistoryIndex, setCurrentHistoryIndex } =
    useHistoryContext();
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
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [currentLine, setCurrentLine] = useState<LinePoint[]>([]);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const [copyObjectIds, setCopyObjectIds] = useState<string[]>([]);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [remoteObjects, setRemoteObjects] = useState<CanvasObject[] | null>(
    null
  );
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [showTextModal, setShowTextModal] = useState<boolean>(false);
  const [textModalContent, setTextModalContent] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Object Position
  const [initialPositions, setInitialPositions] = useState<{
    [id: string]: Point;
  }>({});
  const [initialLinePoints, setInitialLinePoints] = useState<{
    [id: string]: LinePoint[];
  }>({});

  // AI
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiInputText, setAIInputText] = useState('');
  const [aiInputIsOver, setAIInputIsOver] = useState(false);
  const { showAIInput, setShowAIInput } = useAIContext();

  // Moving
  const movingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Event listener for the container element
    const container = document.querySelector(
      '.relative.h-screen.w-screen'
    ) as HTMLElement;
    const preventZoom = (e: WheelEvent) => {
      // Cancel only if the ctrl key (cmd key on Mac) is pressed
      if (e.ctrlKey || e.metaKey) {
        // Prevent zoom if not on the canvas element
        if (!(e.target instanceof HTMLCanvasElement)) {
          e.preventDefault();
        }
      }
    };

    if (container) {
      container.addEventListener('wheel', preventZoom, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', preventZoom);
      }
    };
  }, []);

  const handleUndo = useCallback(() => {
    setSelectedObjectIds([]);
    if (currentHistoryIndex >= 0) {
      const targetIndex = currentHistoryIndex - 1;

      if (targetIndex >= 0) {
        // If there is a history, return to the previous state
        const previousState = history[targetIndex];
        setObjects(previousState.objects);

        // If the selected object is not in the previous state, clear the selection
        if (!previousState.selectedObjectId) return;

        setSelectedObjectIds([previousState.selectedObjectId]);
      } else {
        // If the index is less than 0, return to the initial state
        setObjects([]);
        setSelectedObjectIds([]);
      }

      setCurrentHistoryIndex(targetIndex);
    }
  }, [
    currentHistoryIndex,
    history,
    setCurrentHistoryIndex,
    setObjects,
    setSelectedObjectIds,
  ]);

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
        selectedObjectIds,
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
    selectedObjectIds,
    width,
    height,
  ]);

  const initDragPositions = useCallback(
    (selectedIds: string[]) => {
      const newInitialPositions: { [id: string]: Point } = {};
      const newInitialLinePoints: { [id: string]: LinePoint[] } = {};
      selectedIds.forEach((id) => {
        const obj = objects.find((o) => o.id === id);
        if (obj) {
          newInitialPositions[id] = { ...obj.position };
          if ((obj.type === 'line' || obj.type === 'arrow') && obj.points) {
            newInitialLinePoints[id] = obj.points.map((p) => ({ ...p }));
          }
        }
      });
      setInitialPositions(newInitialPositions);
      setInitialLinePoints(newInitialLinePoints);
    },
    [objects, setInitialPositions, setInitialLinePoints]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, resizeHandle?: ResizeHandle) => {
      // Prevent the context menu from appearing
      if (e.button === 2) {
        e.preventDefault();
      }

      const point = getCanvasPoint(e, canvasRef, offset, scale);

      if (resizeHandle && selectedObjectIds.length > 0) {
        // If the resize handle is clicked
        setResizing(resizeHandle);
        setStartPoint(point);
        return;
      }

      // Detect resize handle on the canvas (if there is one selected object and it is resizable)
      if (
        (selectedTool === 'select' || selectedTool === 'presentation') &&
        selectedObjectIds.length === 1
      ) {
        const selectedObject = objects.find(
          (obj) => obj.id === selectedObjectIds[0]
        );
        if (
          selectedObject &&
          selectedObject.type !== 'line' &&
          selectedObject.type !== 'arrow'
        ) {
          const handleSize = 8 / scale;
          const padding = 8 / scale;
          const handles: { [key in NonNullable<ResizeHandle>]: Point } = {
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

      // Normal click processing for each tool
      if (selectedTool === 'gif') {
        e.preventDefault();
        e.stopPropagation();
        const point = getCanvasPoint(e, canvasRef, offset, scale);
        setImagePosition(point);
        fetchRandomGif(
          point,
          setAlert,
          setImagePosition,
          setSelectedTool,
          setObjects,
          setHistory,
          setCurrentHistoryIndex
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

      if (selectedTool === 'select' || selectedTool === 'presentation') {
        setIsEditingId('');
        // If the clicked element is an HTML element (text or image)
        const clickedHTMLObject = e.target as HTMLElement;
        const isHTMLObject =
          clickedHTMLObject.tagName === 'DIV' ||
          clickedHTMLObject.tagName === 'IMG';
        if (isHTMLObject) {
          const objectId = clickedHTMLObject
            .closest('[data-object-id]')
            ?.getAttribute('data-object-id');
          if (objectId && !isMobile) {
            e.preventDefault(); // Prevent text selection
            e.stopPropagation(); // Prevent event propagation to canvas
            const newSelectedIds = e.shiftKey
              ? selectedObjectIds.includes(objectId)
                ? selectedObjectIds
                : [...selectedObjectIds, objectId]
              : [objectId];
            setSelectedObjectIds(newSelectedIds);
            initDragPositions(newSelectedIds);
            setIsDragging(true);
            setStartPoint(point);
            return;
          }
        }

        // If an object on the canvas is clicked
        const clickedCanvasObject = findClickedObject(point, objects);
        if (clickedCanvasObject) {
          const newSelectedIds = e.shiftKey
            ? selectedObjectIds.includes(clickedCanvasObject.id)
              ? selectedObjectIds
              : [...selectedObjectIds, clickedCanvasObject.id]
            : [clickedCanvasObject.id];
          setSelectedObjectIds(newSelectedIds);
          initDragPositions(newSelectedIds);
          setIsDragging(true);
          setStartPoint(point);
          return;
        } else {
          setSelectedObjectIds([]);

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
      selectedObjectIds,
      selectedTool,
      objects,
      setAlert,
      setSelectedTool,
      setObjects,
      setHistory,
      setCurrentHistoryIndex,
      setSelectedObjectIds,
      initDragPositions,
      isDragging,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Resize processing
      if (resizing && selectedObjectIds.length === 1 && startPoint) {
        const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);
        const selectedObject = objects.find(
          (obj) => obj.id === selectedObjectIds[0]
        );
        if (selectedObject?.locked) return;
        if (selectedObject) {
          const resizedObject = handleObjectResize({
            selectedObject,
            startPoint,
            currentPoint,
            resizeHandle: resizing,
            isShiftPressed: e.shiftKey,
            snapToGridEnabled,
          });
          const updatedObjects = objects.map((obj) =>
            obj.id === selectedObject.id ? { ...obj, ...resizedObject } : obj
          );
          setObjects(updatedObjects);
          setStartPoint(currentPoint);
        }
        return;
      }

      // Panning processing
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

      // Pen / arrow drawing process
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
          lineWidth: 6,
          arrowHead: !isPen,
        });
        return;
      }

      // Drag movement processing
      if (
        (selectedTool === 'select' || selectedTool === 'presentation') &&
        selectedObjectIds.length > 0 &&
        startPoint
      ) {
        const currentPoint = getCanvasPoint(e, canvasRef, offset, scale);
        const deltaX = currentPoint.x - startPoint.x;
        const deltaY = currentPoint.y - startPoint.y;
        const updatedObjects = objects.map((obj) => {
          if (selectedObjectIds.includes(obj.id) && initialPositions[obj.id]) {
            if (obj.locked) return obj;
            if ((obj.type === 'line' || obj.type === 'arrow') && obj.points) {
              const initPoints = initialLinePoints[obj.id] || obj.points;
              const newPoints = initPoints.map((p) => ({
                x: p.x + deltaX,
                y: p.y + deltaY,
              }));
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
            } else {
              let newPos = {
                x: initialPositions[obj.id].x + deltaX,
                y: initialPositions[obj.id].y + deltaY,
              };
              if (snapToGridEnabled) {
                newPos = snapToGrid(newPos);
              }
              return { ...obj, position: newPos };
            }
          }
          return obj;
        });
        setObjects(updatedObjects);
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
    },
    [
      resizing,
      selectedObjectIds,
      startPoint,
      isPanning,
      panStart,
      selectedTool,
      isDragging,
      offset,
      scale,
      objects,
      snapToGridEnabled,
      setObjects,
      setOffset,
      currentLine,
      initialPositions,
      initialLinePoints,
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
          lineWidth: 6,
          arrowHead: true,
        };

        setCurrentLine([]);
        setPreviewObject(null);
        setIsDragging(false);
        setSelectedTool('select');
        handleAddObject(
          newArrow,
          setObjects,
          setHistory,
          setCurrentHistoryIndex
        );
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
        lineWidth: 6,
      };

      setCurrentLine([]);
      setPreviewObject(null);
      setIsDragging(false);
      handleAddObject(newLine, setObjects, setHistory, setCurrentHistoryIndex);
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
      setInitialPositions({});
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

      setSelectedTool('select');
      setIsDragging(false);
      setStartPoint(null);
      setPreviewObject(null);
      handleAddObject(
        newObject,
        setObjects,
        setHistory,
        setCurrentHistoryIndex
      );
    }
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Processing related to movement
      if (movingTimeoutRef.current !== null) {
        clearTimeout(movingTimeoutRef.current);
      }

      setIsMoving(true);

      movingTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 100);

      if (!e.ctrlKey) {
        setOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
        return;
      }

      // Zoom processing
      const result = handleZoomToPoint(canvasRef, scale, e, offset);

      if (result) {
        const { newScale, newOffset } = result;
        setScale(newScale);
        setOffset(newOffset);
      }

      if (e.shiftKey) {
        // Pan operation with two fingers
        setOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [offset, scale, setOffset, setScale]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setTouchStartTime(Date.now());

      if (e.touches.length === 2) {
        // Start pinch gesture
        const distance = getTouchDistance(e.touches);
        setLastTouchDistance(distance);
      } else if (e.touches.length === 1) {
        const point = getTouchPoint(touch, canvasRef, offset, scale);
        if (selectedTool === 'select' || selectedTool === 'presentation') {
          const clickedObject = findClickedObject(point, objects);

          if (clickedObject && !isMobile) {
            setSelectedObjectIds([clickedObject.id]);
            setIsDragging(true);
            setStartPoint(point);
            const newInitialPositions: { [id: string]: Point } = {};
            [clickedObject.id].forEach((id) => {
              const obj = objects.find((o) => o.id === id);
              if (obj) newInitialPositions[id] = { ...obj.position };
            });
            setInitialPositions(newInitialPositions);
          } else {
            setSelectedObjectIds([]);
            setIsPanning(true);
            setPanStart({ x: touch.clientX, y: touch.clientY });
          }
        } else {
          setStartPoint(point);
          setIsDragging(true);
        }
      }
    },
    [objects, offset, scale, selectedTool, setSelectedObjectIds]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
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
          const isSelect = selectedTool === 'select';
          const isPresentation = selectedTool === 'presentation';

          if (
            (isSelect || isPresentation) &&
            selectedObjectIds.length > 0 &&
            startPoint
          ) {
            const currentPoint = getTouchPoint(touch, canvasRef, offset, scale);
            const deltaX = currentPoint.x - startPoint.x;
            const deltaY = currentPoint.y - startPoint.y;
            const updatedObjects = objects.map((obj) => {
              if (
                selectedObjectIds.includes(obj.id) &&
                initialPositions[obj.id]
              ) {
                if (
                  (obj.type === 'line' || obj.type === 'arrow') &&
                  obj.points
                ) {
                  const newPoints = obj.points.map((p) => ({
                    x: p.x + deltaX,
                    y: p.y + deltaY,
                  }));
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
                } else {
                  let newPos = {
                    x: initialPositions[obj.id].x + deltaX,
                    y: initialPositions[obj.id].y + deltaY,
                  };
                  if (snapToGridEnabled) {
                    newPos = snapToGrid(newPos);
                  }
                  return { ...obj, position: newPos };
                }
              }
              return obj;
            });
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
    },
    [
      initialPositions,
      isDragging,
      isPanning,
      lastTouchDistance,
      objects,
      offset,
      panStart,
      scale,
      selectedObjectIds,
      selectedTool,
      setObjects,
      setOffset,
      setScale,
      startPoint,
      snapToGridEnabled,
    ]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;

      if (isDragging) {
        setIsDragging(false);
        setStartPoint(null);
        setInitialPositions({});
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
    },
    [isDragging, isPanning, offset, scale, selectedTool, touchStartTime]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const touchStartHandler = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchStart(e as unknown as React.TouchEvent<Element>);
    };

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchMove(e as unknown as React.TouchEvent<Element>);
    };

    const touchEndHandler = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchEnd(e as unknown as React.TouchEvent<Element>);
    };

    canvas.addEventListener('touchstart', touchStartHandler, {
      passive: false,
    });
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
    canvas.addEventListener('touchend', touchEndHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', touchStartHandler);
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('touchend', touchEndHandler);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart, handleWheel]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange({
      file,
      imagePosition,
      setImageCache,
      setImagePosition,
      setSelectedTool,
      setAlert,
      setObjects,
      setHistory,
      setCurrentHistoryIndex,
    });
    fileInputRef.current!.value = '';
  };

  // Delete an object with the Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingId !== '') return;

      const isSelected = selectedObjectIds.length > 0;
      const isOneSelected = selectedObjectIds.length === 1;

      if (e.key === 'Escape' && selectedTool !== 'select') {
        setSelectedTool('select');
        return;
      }

      if ((e.key === '=' || e.key === '-') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }

      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        setCopyObjectIds(selectedObjectIds);
        // Clear the clipboard
        navigator.clipboard.writeText('').catch((error) => {
          console.error('Error clearing clipboard:', error);
        });
      }

      const keys = ['s', 'l', 'e', 'd', 'g', '/'];
      if (keys.includes(e.key) && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }

      // Disabled while displaying input elements
      if (showAIInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteObject(
          objects,
          selectedObjectIds,
          setObjects,
          setSelectedObjectIds,
          setHistory,
          setCurrentHistoryIndex,
          currentHistoryIndex
        );
      }

      // Undo with Cmd/Ctrl + Z
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleUndo();
      }

      // Italicize text with Cmd/Ctrl + I
      if (e.key === 'i' && (e.metaKey || e.ctrlKey) && isOneSelected) {
        textToggleItalic(objects, selectedObjectIds[0], setObjects);
      }

      // Bold text with Cmd/Ctrl + B
      if (e.key === 'b' && (e.metaKey || e.ctrlKey) && isOneSelected) {
        textToggleBold(objects, selectedObjectIds[0], setObjects);
      }

      // Paste object with Cmd/Ctrl + V
      if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        handlePaste(
          width,
          height,
          canvasRef,
          offset,
          scale,
          addObject,
          setSelectedObjectIds,
          objects,
          copyObjectIds,
          setObjects,
          setHistory,
          setCurrentHistoryIndex,
          currentHistoryIndex
        );
      }

      // Lock object with Cmd/Ctrl + Shift + L
      if (
        e.key === 'l' &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        isSelected
      ) {
        lockObject(selectedObjectIds[0], setObjects);
      }

      // Export canvas as image with Cmd/Ctrl + E
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        exportCanvasAsImage(objects, setSelectedObjectIds, setAlert);
      }

      // Duplicate object with Cmd/Ctrl + D
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        copyObject(
          objects,
          selectedObjectIds,
          setObjects,
          setSelectedObjectIds,
          setHistory,
          setCurrentHistoryIndex,
          currentHistoryIndex
        );
      }

      // Grid snap toggle with Cmd/Ctrl + G
      if (e.key === 'g' && (e.metaKey || e.ctrlKey)) {
        setSnapToGridEnabled((prev) => !prev);
        showTemporaryAlert(
          `Grid snap ${snapToGridEnabled ? 'disabled' : 'enabled'}`,
          setAlert
        );
      }

      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        setIsModalOpen(!isModalOpen);
        setSelectedTool('select');
      }

      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        shareCanvasAsURL(objects, setIsLoading, setSelectedObjectIds, setAlert);
      }

      if (e.key === 'ArrowUp' && isSelected) {
        e.preventDefault();
        upObject(selectedObjectIds, setObjects);
      }

      if (e.key === 'ArrowDown' && isSelected) {
        e.preventDefault();
        downObject(selectedObjectIds, setObjects);
      }

      if (e.key === 'ArrowLeft' && isSelected) {
        e.preventDefault();
        leftObject(selectedObjectIds, setObjects);
      }

      if (e.key === 'ArrowRight' && isSelected) {
        e.preventDefault();
        rightObject(selectedObjectIds, setObjects);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isEditingId,
    objects,
    setObjects,
    addObject,
    copyObjectIds,
    width,
    height,
    offset,
    scale,
    setAlert,
    setSelectedTool,
    snapToGridEnabled,
    setIsModalOpen,
    isModalOpen,
    handleUndo,
    setHistory,
    setCurrentHistoryIndex,
    currentHistoryIndex,
    selectedTool,
    showAIInput,
    selectedObjectIds,
    setSelectedObjectIds,
  ]);

  useEffect(() => {
    if (selectedObjectIds.length === 1) {
      const selectedObject = objects.find(
        (obj) => obj.id === selectedObjectIds[0]
      );
      if (selectedObject) {
        const position = calculateTooltipPosition({
          selectedObject,
          selectedObjectId: selectedObjectIds[0],
          scale,
          offset,
        });
        setTooltipPosition(position);
      }
    } else {
      setTooltipPosition(null);
    }
  }, [selectedObjectIds, objects, scale, offset]);

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

            // Close the mobile modal if the canvas data is loaded
            setShowMobileModal(false);
          }
        })
        .catch((error) => {
          console.error('Error fetching canvas data:', error);
        });
      // Delete the id parameter from the URL without reloading the page
      handleDeleteParms(params);
    } else if (isMobile && !id && objects.length === 0) {
      setShowMobileModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTextChange = () => {
    if (selectedObjectIds.length !== 1) return;

    const selectedObject = objects.find(
      (obj) => obj.id === selectedObjectIds[0]
    );
    if (selectedObject && selectedObject.type === 'text') {
      const position = calculateTooltipPosition({
        selectedObject,
        selectedObjectId: selectedObjectIds[0],
        scale,
        offset,
      });
      setTooltipPosition(position);
    }
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_STATUS_API_URL;
    if (apiUrl) {
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const isAvailable = data.modal.isAvailable;
          if (isAvailable === false) {
            const content = {
              title: data.modal.title,
              body: data.modal.body,
            };
            setTextModalContent(content);
            setShowTextModal(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching status data:', error);
        });
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFileDragging(true);
    },
    [setIsFileDragging]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFileDragging(false);
    },
    [setIsFileDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFileDragging(false);

      // Convert the mouse position to canvas coordinates
      const point = getCanvasPoint(e, canvasRef, offset, scale);
      setImagePosition(point);

      const file = e.dataTransfer.files[0];
      handleFileChange({
        file,
        imagePosition: point,
        setImageCache,
        setImagePosition,
        setSelectedTool,
        setAlert,
        setObjects,
        setHistory,
        setCurrentHistoryIndex,
      });
    },
    [
      setIsFileDragging,
      offset,
      scale,
      setSelectedTool,
      setAlert,
      setObjects,
      setHistory,
      setCurrentHistoryIndex,
    ]
  );

  const handleAIGenerate = async () => {
    aIGenerate(
      aiInputText,
      setShowAIInput,
      setAlert,
      setIsAIGenerating,
      setObjects,
      setHistory,
      setCurrentHistoryIndex
    );
  };

  const handleModalInputChange = (text: string) => {
    // Limit the number of characters to 128
    if (text.length > 128) {
      setAIInputIsOver(true);
      return;
    }

    setAIInputText(text);
    setAIInputIsOver(false);
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      role="main"
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 top-0 left-0 ${
          selectedTool === 'select' || selectedTool === 'presentation'
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
          setIsMoving(false);
          setPanStart(null);
        }}
      />

      {selectedObjectIds && !isMobile && (
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
                selectedObjectIds={selectedObjectIds}
                isResizing={resizing !== null}
                isDragging={isDragging}
                isMoving={isMoving}
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
                selectedObjectIds={selectedObjectIds}
                isResizing={resizing !== null}
                isEditingId={isEditingId}
                isDragging={isDragging}
                isMoving={isMoving}
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
                selectedObjectIds={selectedObjectIds}
                isResizing={resizing !== null}
                isMoving={isMoving}
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
      {showMobileModal && <MobileModal />}

      {showTextModal && textModalContent && (
        <TextModal
          title={textModalContent.title}
          body={textModalContent.body}
        />
      )}

      {showAIInput && (
        <ModalInput
          placeholder="Describe what you want to create..."
          close={() => setShowAIInput(false)}
          onChange={handleModalInputChange}
          send={handleAIGenerate}
          isLoading={isAIGenerating}
          isOver={aiInputIsOver}
        />
      )}

      {isFileDragging && <Drag />}
    </div>
  );
};
