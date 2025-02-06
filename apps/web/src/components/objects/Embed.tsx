import React, { useRef, useEffect } from 'react';
import { CanvasObject } from '~/types/canvas';
import { isMobile } from 'react-device-detect';

interface EmbedObjectProps {
  selectedObjectIds: string[];
  scale: number;
  offset: { x: number; y: number };
  obj: CanvasObject & { type: 'embed' };
  isResizing: boolean;
  isDragging: boolean;
  isMoving: boolean;
  handleMouseDown: (e: React.MouseEvent, handle?: string) => void;
}

export const EmbedObject = React.memo(
  ({
    selectedObjectIds,
    scale,
    offset,
    obj,
    isResizing,
    isDragging,
    isMoving,
    handleMouseDown,
  }: EmbedObjectProps) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Calculate the current position
      const newPosition = {
        x: obj.position.x * scale + offset.x,
        y: obj.position.y * scale + offset.y,
      };

      if (elementRef.current) {
        elementRef.current.style.transform = `
            translate(-50%, -50%)
            translate3d(${newPosition.x}px, ${newPosition.y}px, 0)
            rotate(${obj.rotation || 0}deg)
          `;
      }
    }, [
      obj.position.x,
      obj.position.y,
      obj.rotation,
      scale,
      offset.x,
      offset.y,
    ]);

    const isSelected = selectedObjectIds.includes(obj.id);

    return (
      <div
        ref={elementRef}
        data-object-id={obj.id}
        className="absolute select-none"
        style={{
          left: 0,
          top: 0,
          width: obj.width * scale,
          height: obj.height * scale,
          willChange: 'transform',
          cursor: 'default',
          pointerEvents: isMobile
            ? 'none'
            : isSelected
              ? isDragging
                ? 'none'
                : isResizing
                  ? 'none'
                  : isMoving
                    ? 'none'
                    : 'auto'
              : 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        <iframe
          src={obj.embedUrl}
          title="embed"
          className="h-full w-full"
          style={{
            pointerEvents: isMobile
              ? 'none'
              : isSelected
                ? isDragging
                  ? 'none'
                  : isResizing
                    ? 'none'
                    : 'auto'
                : 'none',
          }}
        />

        {isSelected && (
          <>
            <div className="pointer-events-none absolute -inset-2.5 border-2 border-indigo-600" />
            <div
              className="absolute -top-3 -left-3 size-2.5 rounded-full border-[1.5px] border-indigo-600 bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'top-left');
              }}
            />
            <div
              className="absolute -top-3 -right-3 size-2.5 rounded-full border-[1.5px] border-indigo-600 bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'top-right');
              }}
            />
            <div
              className="absolute -bottom-3 -left-3 size-2.5 rounded-full border-[1.5px] border-indigo-600 bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'bottom-left');
              }}
            />
            <div
              className="absolute -right-3 -bottom-3 size-2.5 rounded-full border-[1.5px] border-indigo-600 bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'bottom-right');
              }}
            />
          </>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.obj.position.x === nextProps.obj.position.x &&
      prevProps.obj.position.y === nextProps.obj.position.y &&
      prevProps.obj.width === nextProps.obj.width &&
      prevProps.obj.height === nextProps.obj.height &&
      prevProps.scale === nextProps.scale &&
      prevProps.offset.x === nextProps.offset.x &&
      prevProps.offset.y === nextProps.offset.y &&
      prevProps.selectedObjectIds === nextProps.selectedObjectIds &&
      prevProps.isResizing === nextProps.isResizing &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.isMoving === nextProps.isMoving &&
      prevProps.obj.rotation === nextProps.obj.rotation &&
      prevProps.obj.embedUrl === nextProps.obj.embedUrl
    );
  }
);
