import React, { useRef, useEffect, useState } from 'react';
import { CanvasObject } from '~/types/canvas';
import { isMobile } from '~/utils/device';
interface ImageObjectProps {
  selectedObjectIds: string[];
  scale: number;
  offset: { x: number; y: number };
  obj: CanvasObject & { type: 'image' };
  isResizing: boolean;
  isDragging: boolean;
  isMoving: boolean;
  imageCache: Record<string, string>;
  handleMouseDown: (e: React.MouseEvent, handle?: string) => void;
}

export const ImageObject = React.memo(
  ({
    selectedObjectIds,
    scale,
    offset,
    obj,
    isResizing,
    isDragging,
    imageCache,
    isMoving,
    handleMouseDown,
  }: ImageObjectProps) => {
    const [isSpoiler, setIsSpoiler] = useState(true);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (obj.spoiler) {
        setIsSpoiler(true);
      }
    }, [obj.spoiler]);

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
    const isOriginal = obj.originalUrl !== undefined;

    if (isOriginal) {
      const url = new URL(obj.originalUrl ?? '');
      // Only allow images from tenor
      if (url.hostname !== 'media.tenor.com') {
        obj.originalUrl = '';
      }
    }

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
            : isDragging
              ? 'none'
              : isResizing
                ? 'none'
                : isMoving
                  ? 'none'
                  : 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={
            obj.originalUrl
              ? obj.originalUrl
              : imageCache[obj.id] || obj.imageData
          }
          alt="canvas object"
          className="pointer-events-none h-full w-full object-contain"
          draggable={false}
          loading="lazy"
          style={{
            borderRadius: obj.circle === true ? '100%' : '0',
            opacity: obj.spoiler && isSpoiler ? 0 : 1,
          }}
        />

        {obj.spoiler && (
          <div
            className="absolute top-0 left-0 flex size-full items-center justify-center"
            style={{
              pointerEvents: isSpoiler ? 'auto' : 'none',
            }}
          >
            {isSpoiler && (
              <>
                <div
                  className="absolute inset-0 bg-indigo-600"
                  style={{ zIndex: 1 }}
                />
                <button
                  className="relative flex w-fit cursor-pointer flex-col items-center justify-center rounded-sm bg-white p-2 px-4 font-sans whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSpoiler(false);
                  }}
                  style={{ zIndex: 2 }}
                  aria-label="Show image"
                >
                  <div className="flex h-5 items-center justify-center text-center">
                    Show image
                  </div>
                </button>
              </>
            )}
          </div>
        )}

        {/* Selection border */}
        {isSelected && (
          <>
            <div className="pointer-events-none absolute -inset-2.5 border-2 border-indigo-600" />
            {(
              ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const
            ).map((pos) => {
              const posClasses: Record<string, string> = {
                'top-left': 'absolute -top-3 -left-3',
                'top-right': 'absolute -top-3 -right-3',
                'bottom-left': 'absolute -bottom-3 -left-3',
                'bottom-right': 'absolute -bottom-3 -right-3',
              };
              return (
                <div
                  key={pos}
                  className={`${posClasses[pos]} size-2.5 rounded-full border-[1.5px] border-indigo-600 bg-white`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, pos);
                  }}
                />
              );
            })}
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
      prevProps.imageCache === nextProps.imageCache &&
      prevProps.obj.rotation === nextProps.obj.rotation &&
      prevProps.obj.circle === nextProps.obj.circle &&
      prevProps.obj.originalUrl === nextProps.obj.originalUrl &&
      prevProps.obj.spoiler === nextProps.obj.spoiler
    );
  }
);
