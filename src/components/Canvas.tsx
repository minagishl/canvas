import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { drawObject } from "../utils/canvas";
import { Point, CanvasObject } from "../types/canvas";
import { createPreviewObject } from "../utils/preview";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    scale,
    setScale,
    offset,
    setOffset,
    objects,
    addObject,
    selectedTool,
    setObjects,
    selectedObjectId,
    setSelectedObjectId,
  } = useCanvasContext();
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewObject, setPreviewObject] = useState<CanvasObject | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

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
      .filter((obj) => obj.type !== "text")
      .forEach((object) => {
        drawObject(ctx, object, scale);
        if (object.id === selectedObjectId) {
          // Highlight selected objects
          ctx.strokeStyle = "blue";
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
      drawObject(ctx, previewObject, scale);
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
      // Get the clicked object
      const clickedObject = objects.find(
        (obj) =>
          obj.type !== "text" &&
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
      }
    } else {
      setStartPoint(point);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const isShiftPressed = e.shiftKey; // Get Shift key status

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
    } else if (startPoint) {
      const currentPoint = getCanvasPoint(e);
      const preview = createPreviewObject(
        selectedTool,
        startPoint,
        currentPoint,
        isShiftPressed
      );
      setPreviewObject(preview);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const isShiftPressed = e.shiftKey; // Get Shift key status

    if (selectedTool === "select") {
      setIsDragging(false);
      setStartPoint(null);
      setDragOffset({ x: 0, y: 0 });
    } else {
      if (!startPoint) {
        setIsDragging(false);
        setStartPoint(null);
        setPreviewObject(null);
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
      setIsDragging(false);
      setStartPoint(null);
      setPreviewObject(null);
    }
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY / 500;
      const newScale = Math.min(Math.max(scale + delta, 0.7), 2);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const worldX = (centerX - offset.x) / scale;
      const worldY = (centerY - offset.y) / scale;

      const newOffsetX = centerX - worldX * newScale;
      const newOffsetY = centerY - worldY * newScale;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
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

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${
          selectedTool === "select"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setStartPoint(null);
          setPreviewObject(null);
          setDragOffset({ x: 0, y: 0 });
        }}
      />

      {objects
        .filter((obj) => obj.type === "text")
        .map((textObj) => (
          <div
            key={textObj.id}
            contentEditable
            suppressContentEditableWarning
            className={`absolute hover:border hover:border-dashed hover:border-gray-300 rounded-md ${
              textObj.id === selectedObjectId ? "border-blue-500" : ""
            }`}
            style={{
              top: textObj.position.y * scale + offset.y,
              left: textObj.position.x * scale + offset.x,
              transform: "translate(-50%, -50%)",
              fontSize: `${16 * scale}px`,
              paddingRight: `${2 * scale}px`,
              paddingLeft: `${2 * scale}px`,
              color: textObj.fill,
              pointerEvents: "auto",
            }}
            onBlur={(e) => {
              const updatedText = e.currentTarget.textContent || "";
              const updatedObjects = objects.map((obj) =>
                obj.id === textObj.id ? { ...obj, text: updatedText } : obj
              );
              setObjects(updatedObjects);
            }}
          >
            {textObj.text}
          </div>
        ))}
    </div>
  );
};
