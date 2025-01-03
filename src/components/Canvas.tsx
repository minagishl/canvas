import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { drawObject } from "../utils/canvas";
import { Point, CanvasObject } from "../types/canvas";
import { createPreviewObject } from "../utils/preview";

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
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
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
      .filter((obj) => obj.type !== "text" && obj.type !== "image")
      .forEach((object) => {
        drawObject(ctx, object, scale);
        if (object.id === selectedObjectId) {
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
        // Start panning
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imagePosition) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;

      // Get image size
      const img = new Image();
      img.onload = () => {
        // Calculate appropriate size while preserving aspect ratio
        const maxSize = 300;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        const imageObject: CanvasObject = {
          id: Math.random().toString(36).substr(2, 9),
          type: "image",
          position: imagePosition,
          width,
          height,
          fill: "transparent",
          imageData,
        };

        addObject(imageObject);
        setImagePosition(null);
        setSelectedTool("select");
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  };

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
          setIsPanning(false);
          setPanStart(null);
        }}
      />

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
          if (obj.type === "text") {
            return (
              <div
                key={obj.id}
                contentEditable
                suppressContentEditableWarning
                className={`absolute hover:border hover:border-dashed hover:border-gray-300 rounded-md ${
                  obj.id === selectedObjectId ? "border-blue-500" : ""
                }`}
                style={{
                  top: obj.position.y * scale + offset.y,
                  left: obj.position.x * scale + offset.x,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${16 * scale}px`,
                  paddingRight: `${2 * scale}px`,
                  paddingLeft: `${2 * scale}px`,
                  color: obj.fill,
                  pointerEvents: isDragging ? "none" : "auto",
                }}
                onBlur={(e) => {
                  const updatedText = e.currentTarget.textContent || "";
                  const updatedObjects = objects.map((o) =>
                    o.id === obj.id ? { ...o, text: updatedText } : o
                  );
                  setObjects(updatedObjects);
                }}
              >
                {obj.text}
              </div>
            );
          } else if (obj.type === "image" && obj.imageData) {
            return (
              <div
                key={obj.id}
                className={`absolute ${
                  obj.id === selectedObjectId ? "border-2 border-blue-500" : ""
                }`}
                style={{
                  top: obj.position.y * scale + offset.y,
                  left: obj.position.x * scale + offset.x,
                  width: obj.width * scale,
                  height: obj.height * scale,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: isDragging ? "none" : "auto",
                }}
              >
                <img
                  src={obj.imageData}
                  alt="canvas object"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            );
          }
          return null;
        })}
    </div>
  );
};
