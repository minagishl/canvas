import React, { useRef, useEffect, useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { drawObject } from "../utils/canvas";
import { Point, CanvasObject } from "../types/canvas";
import { createPreviewObject } from "../utils/preview";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scale, offset, objects, addObject, selectedTool } =
    useCanvasContext();
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
    if (previewObject) {
      ctx.globalAlpha = 0.6;
      drawObject(ctx, previewObject, scale);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [scale, offset, objects, previewObject]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const gridSize = 20;
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
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
    setStartPoint(point);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint) return;

    const currentPoint = getCanvasPoint(e);
    const preview = createPreviewObject(selectedTool, startPoint, currentPoint);
    setPreviewObject(preview);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startPoint || selectedTool === "select") {
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
  };

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
