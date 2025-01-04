import React, { useRef, useEffect } from "react";
import { CanvasObject } from "../../types/canvas";

interface ImageObjectProps {
  obj: CanvasObject & { type: "image" };
  scale: number;
  offset: { x: number; y: number };
  isSelected: boolean;
  isDragging: boolean;
  selectedTool: string;
  imageCache: Record<string, string>;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const ImageObject = React.memo(
  ({
    obj,
    scale,
    offset,
    isSelected,
    isDragging,
    selectedTool,
    imageCache,
    handleMouseDown,
  }: ImageObjectProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
      positionRef.current = {
        x: obj.position.x * scale + offset.x,
        y: obj.position.y * scale + offset.y,
      };

      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${-50}%, ${-50}%) translate3d(${
          positionRef.current.x
        }px, ${positionRef.current.y}px, 0)`;
      }
    }, [obj.position.x, obj.position.y, scale, offset.x, offset.y]);

    return (
      <div
        ref={elementRef}
        data-object-id={obj.id}
        className={`absolute select-none ${
          isSelected ? "border-2 border-blue-500" : ""
        }`}
        style={{
          left: 0,
          top: 0,
          width: obj.width * scale,
          height: obj.height * scale,
          willChange: "transform",
          cursor: selectedTool === "select" ? "move" : "default",
          pointerEvents: isDragging ? "none" : "auto",
        }}
        onMouseDown={(e) => {
          if (selectedTool === "select") {
            handleMouseDown(e);
          }
        }}
      >
        <img
          src={imageCache[obj.id] || obj.imageData}
          alt="canvas object"
          className="w-full h-full object-contain"
          draggable={false}
          loading="lazy"
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.obj.position.x === nextProps.obj.position.x &&
      prevProps.obj.position.y === nextProps.obj.position.y &&
      prevProps.scale === nextProps.scale &&
      prevProps.offset.x === nextProps.offset.x &&
      prevProps.offset.y === nextProps.offset.y &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.selectedTool === nextProps.selectedTool
    );
  }
);
