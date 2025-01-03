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
  } = useCanvasContext();
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewObject, setPreviewObject] = useState<CanvasObject | null>(null);

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

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw existing objects
    objects.forEach((object) => drawObject(ctx, object, scale));

    // Draw preview object
    if (previewObject && selectedTool !== "select") {
      ctx.globalAlpha = 0.6;
      drawObject(ctx, previewObject, scale);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, offset, objects, previewObject, selectedTool]);

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
      setStartPoint({ x: e.clientX, y: e.clientY });
      setIsDragging(true);
    } else {
      setStartPoint(point);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    if (selectedTool === "select" && startPoint) {
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setStartPoint({ x: e.clientX, y: e.clientY });
    } else if (startPoint) {
      const currentPoint = getCanvasPoint(e);
      const preview = createPreviewObject(
        selectedTool,
        startPoint,
        currentPoint
      );
      setPreviewObject(preview);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    if (selectedTool === "select") {
      setIsDragging(false);
      setStartPoint(null);
    } else {
      if (!startPoint) {
        setIsDragging(false);
        setStartPoint(null);
        setPreviewObject(null);
        return;
      }

      const endPoint = getCanvasPoint(e);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);

      if (width < 5 || height < 5) {
        setIsDragging(false);
        setStartPoint(null);
        setPreviewObject(null);
        return;
      }

      const newObject = createPreviewObject(selectedTool, startPoint, endPoint);
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
      setScale((prev) => Math.min(Math.max(prev + delta, 0.7), 2));
    },
    [setScale]
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
      }}
    />
  );
};
