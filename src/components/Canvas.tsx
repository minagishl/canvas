import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { drawObject } from "../utils/canvas";
import { Point, CanvasObject } from "../types/canvas";
import { createPreviewObject } from "../utils/preview";
import { TextObject } from "./objects/Text";
import { ImageObject } from "./objects/Image";
import { Tooltip } from "./Tooltip";

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
  const [previewObject, setPreviewObject] = useState<CanvasObject | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    drawGrid(ctx, canvas.width, canvas.height);

    // Drawing objects other than text
    objects
      .filter((obj) => obj.type !== "text" && obj.type !== "image")
      .forEach((object) => {
        drawObject(ctx, object);
        if (object.id === selectedObjectId) {
          ctx.strokeStyle = "#4f46e5";
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            object.position.x,
            object.position.y,
            object.width,
            object.height
          );
        }
      });

    // Draw preview object
    if (previewObject && selectedTool !== "select") {
      ctx.globalAlpha = 0.6;
      drawObject(ctx, previewObject);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, offset, objects, previewObject, selectedTool, selectedObjectId]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const gridSize = 40;

    // Calculate grid boundaries with buffer
    const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
    const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
    const endX =
      Math.ceil((width / scale - offset.x / scale) / gridSize) * gridSize;
    const endY =
      Math.ceil((height / scale - offset.y / scale) / gridSize) * gridSize;

    ctx.strokeStyle = "#e5e7eb";
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

  const getCanvasPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    if (selectedTool === "select") {
      // Clicking on a text or image object
      const clickedHTMLObject = e.target as HTMLElement;
      const isHTMLObject =
        clickedHTMLObject.tagName === "DIV" ||
        clickedHTMLObject.tagName === "IMG";

      if (isHTMLObject) {
        // When an HTML element (text or image) is clicked
        const objectId = clickedHTMLObject
          .closest("[data-object-id]")
          ?.getAttribute("data-object-id");
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
      const clickedCanvasObject = objects.find(
        (obj) =>
          obj.type !== "text" &&
          obj.type !== "image" &&
          point.x >= obj.position.x &&
          point.x <= obj.position.x + obj.width &&
          point.y >= obj.position.y &&
          point.y <= obj.position.y + obj.height
      );

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
    if (isDragging) {
      if (selectedTool === "select" && selectedObjectId && startPoint) {
        const currentPoint = getCanvasPoint(e);
        const newX = currentPoint.x - dragOffset.x;
        const newY = currentPoint.y - dragOffset.y;

        const updatedObjects = objects.map((obj) =>
          obj.id === selectedObjectId
            ? { ...obj, position: { x: newX, y: newY } }
            : obj
        );
        setObjects(updatedObjects);
      } else if (startPoint && selectedTool !== "image") {
        const isShiftPressed = e.shiftKey; // Get Shift key status
        const currentPoint = getCanvasPoint(e);
        const preview = createPreviewObject(
          selectedTool,
          startPoint,
          currentPoint,
          isShiftPressed
        );
        setPreviewObject(preview);
      }
    } else if (isPanning && panStart) {
      // Panning
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setStartPoint(null);
      setDragOffset({ x: 0, y: 0 });
    }

    if (isPanning) {
      // Stop panning
      setIsPanning(false);
      setPanStart(null);
    }

    const isShiftPressed = e.shiftKey; // Get Shift key status

    if (selectedTool !== "select" && !isPanning) {
      if (!startPoint) {
        setIsDragging(false);
        setStartPoint(null);
        setPreviewObject(null);
        return;
      }

      if (selectedTool === "image") {
        e.preventDefault();
        e.stopPropagation();
        const point = getCanvasPoint(e);
        setImagePosition(point);
        fileInputRef.current?.click();
        setSelectedTool("select");
        return;
      }

      const endPoint = getCanvasPoint(e);
      const newObject = createPreviewObject(
        selectedTool,
        startPoint,
        endPoint,
        isShiftPressed
      );
      addObject(newObject);
      setSelectedTool("select");
      setIsDragging(false);
      setStartPoint(null);
      setPreviewObject(null);
    }
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Detect two-finger operation on MacBook touchpad
      if (e.ctrlKey) {
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
      } else {
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

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
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
        const canvas = document.createElement("canvas");
        const maxSize = 500;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const resizedImageData = canvas.toDataURL("image/jpeg", 0.8);

        // Save to cache
        const id = Math.random().toString(36).substr(2, 9);
        setImageCache((prev) => ({ ...prev, [id]: resizedImageData }));

        const imageObject: CanvasObject = {
          id,
          type: "image",
          position: imagePosition,
          width,
          height,
          fill: "transparent",
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
      if (selectedTool === "select") {
        const clickedObject = objects.find(
          (obj) =>
            point.x >= obj.position.x &&
            point.x <= obj.position.x + obj.width &&
            point.y >= obj.position.y &&
            point.y <= obj.position.y + obj.height
        );

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
        if (selectedTool === "select" && selectedObjectId && startPoint) {
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

    if (touchDuration < 200 && !isDragging && selectedTool === "image") {
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

  const deleteSelectedObject = useCallback(() => {
    if (!selectedObjectId) return;
    const updatedObjects = objects.filter((obj) => obj.id !== selectedObjectId);
    setObjects(updatedObjects);
    setSelectedObjectId(null);
  }, [selectedObjectId, objects, setObjects, setSelectedObjectId]);

  // Delete an object with the Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedObject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, deleteSelectedObject]);

  useEffect(() => {
    if (selectedObjectId) {
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
      if (selectedObject) {
        let x, y;

        // Calculate the position of the tooltip (Specified by tailwindcss standard)
        if (selectedObject.type === "text") {
          x = selectedObject.position.x * scale + offset.x;
          y = selectedObject.position.y * scale + offset.y - 16; // 1rem
        } else {
          x =
            (selectedObject.position.x + selectedObject.width / 2) * scale +
            offset.x;
          y = selectedObject.position.y * scale + offset.y - 8; // 0.5rem
        }

        setTooltipPosition({ x, y });
      }
    } else {
      setTooltipPosition(null);
    }
  }, [selectedObjectId, objects, scale, offset]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${
          selectedTool === "select"
            ? "cursor-default active:cursor-grabbing"
            : selectedTool === "text" || selectedTool === "image"
            ? "cursor-pointer"
            : "cursor-crosshair"
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
        <Tooltip position={tooltipPosition} isDragging={isDragging} />
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {objects
        .filter((obj) => obj.type === "text" || obj.type === "image")
        .map((obj) => {
          if (obj.type === "image") {
            return (
              <ImageObject
                key={obj.id}
                obj={obj as CanvasObject & { type: "image" }}
                isSelected={obj.id === selectedObjectId}
                isDragging={isDragging}
                scale={scale}
                offset={offset}
                selectedTool={selectedTool}
                imageCache={imageCache}
                handleMouseDown={handleMouseDown}
              />
            );
          }

          if (obj.type === "text") {
            return (
              <TextObject
                key={obj.id}
                obj={obj as CanvasObject & { type: "text" }}
                scale={scale}
                offset={offset}
                isSelected={obj.id === selectedObjectId}
                isDragging={isDragging}
                isEditing={isEditing && obj.id === selectedObjectId}
                selectedTool={selectedTool}
                onMouseDown={(e) => {
                  if (selectedTool === "select") {
                    handleMouseDown(e);
                  }
                }}
                onBlur={(e) => {
                  if (selectedTool !== "select") {
                    const updatedText = e.currentTarget.textContent || "";
                    const updatedObjects = objects.map((o) =>
                      o.id === obj.id ? { ...o, text: updatedText } : o
                    );
                    setObjects(updatedObjects);
                  }
                }}
                onEditStart={() => setIsEditing(true)}
                onEditEnd={() => setIsEditing(false)}
              />
            );
          }

          return null;
        })}
    </div>
  );
};
