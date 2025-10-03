import React, { useEffect, useRef } from 'react';
import { CanvasObject, ResizeHandle } from '~/types/canvas';
import { isMobile } from '~/utils/device';

interface StickyNoteObjectProps {
  selectedTool: string;
  selectedObjectIds: string[];
  scale: number;
  offset: { x: number; y: number };
  obj: CanvasObject & { type: 'sticky' };
  isResizing: boolean;
  isEditingId: string;
  isDragging: boolean;
  isMoving: boolean;
  onTextChange: () => void;
  onMouseDown: (e: React.MouseEvent, handle?: ResizeHandle) => void;
}

export const StickyNoteObject = React.memo(
  ({
    selectedTool,
    selectedObjectIds,
    scale,
    offset,
    obj,
    isResizing,
    isEditingId,
    isDragging,
    isMoving,
    onTextChange,
    onMouseDown,
  }: StickyNoteObjectProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!elementRef.current) return;

      const position = {
        x: obj.position.x * scale + offset.x,
        y: obj.position.y * scale + offset.y,
      };

      elementRef.current.style.transform = `
        translate(-50%, -50%)
        translate3d(${position.x}px, ${position.y}px, 0)
        rotate(${obj.rotation || 0}deg)
      `;
    }, [
      obj.position.x,
      obj.position.y,
      obj.rotation,
      scale,
      offset.x,
      offset.y,
    ]);

    useEffect(() => {
      if (!contentRef.current) return;
      const currentContent = contentRef.current.textContent ?? '';
      const objectContent = obj.text ?? '';
      if (currentContent !== objectContent) {
        contentRef.current.textContent = objectContent;
      }
    }, [obj.text]);

    useEffect(() => {
      if (!contentRef.current) return;
      obj.text = contentRef.current.textContent ?? '';
    }, [selectedObjectIds, obj]);

    const isSelected = selectedObjectIds.includes(obj.id);
    const isEditing = isEditingId === obj.id;

    const handleMouseDownWrapper = (
      e: React.MouseEvent,
      handle?: ResizeHandle
    ) => {
      if (isEditing) {
        e.stopPropagation();
        return;
      }
      onMouseDown(e, handle);
    };

    const handleInput = () => {
      if (!contentRef.current) return;
      obj.text = contentRef.current.textContent ?? '';
      onTextChange();
    };

    const pointerEvents = isMobile
      ? 'none'
      : isDragging || isResizing || isMoving
        ? 'none'
        : 'auto';

    const fontSize = (obj.fontSize ?? 18) * scale;
    const lineHeight = fontSize * 1.4;
    const padding = 12 * scale;

    return (
      <div
        ref={elementRef}
        className="absolute select-none"
        style={{
          left: 0,
          top: 0,
          width: obj.width * scale,
          height: obj.height * scale,
          willChange: 'transform',
          pointerEvents,
        }}
        onMouseDown={handleMouseDownWrapper}
      >
        <div className="relative size-full">
          <div
            ref={contentRef}
            data-object-id={obj.id}
            contentEditable={isEditing}
            suppressContentEditableWarning
            className="shadow-base h-full w-full rounded-md transition-shadow outline-none focus:ring-0 focus:outline-none"
            style={{
              backgroundColor: obj.fill || '#fde68a',
              color: obj.textColor || '#1f2937',
              padding: `${padding}px`,
              fontSize,
              lineHeight: `${lineHeight}px`,
              fontWeight: obj.weight ?? 500,
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              cursor:
                selectedTool === 'select'
                  ? isEditing
                    ? 'text'
                    : 'move'
                  : 'text',
              userSelect: isEditing ? 'text' : 'none',
            }}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
              }

              if (e.key === 'Escape') {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).blur();
              }
            }}
          />

          {!obj.text && !isEditing && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              Write a note
            </span>
          )}
        </div>

        {isSelected && (
          <>
            <div className="pointer-events-none absolute -inset-2.5 rounded-md border-2 border-indigo-600" />
            {(
              ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Array<
                NonNullable<ResizeHandle>
              >
            ).map((pos) => {
              const posClasses: Record<NonNullable<ResizeHandle>, string> = {
                'top-left': 'absolute -top-3 -left-3',
                'top-right': 'absolute -top-3 -right-3',
                'bottom-left': 'absolute -bottom-3 -left-3',
                'bottom-right': 'absolute -bottom-3 -right-3',
              };
              return (
                <div
                  key={pos}
                  className={`${posClasses[pos]} size-2.5 cursor-pointer rounded-full border-[1.5px] border-indigo-600 bg-white`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDownWrapper(e, pos);
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
      prevProps.obj.fill === nextProps.obj.fill &&
      prevProps.obj.text === nextProps.obj.text &&
      prevProps.obj.rotation === nextProps.obj.rotation &&
      prevProps.obj.fontSize === nextProps.obj.fontSize &&
      prevProps.obj.textColor === nextProps.obj.textColor &&
      prevProps.scale === nextProps.scale &&
      prevProps.offset.x === nextProps.offset.x &&
      prevProps.offset.y === nextProps.offset.y &&
      prevProps.selectedObjectIds === nextProps.selectedObjectIds &&
      prevProps.isResizing === nextProps.isResizing &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.isMoving === nextProps.isMoving &&
      prevProps.selectedTool === nextProps.selectedTool &&
      prevProps.isEditingId === nextProps.isEditingId &&
      prevProps.onMouseDown === nextProps.onMouseDown &&
      prevProps.onTextChange === nextProps.onTextChange
    );
  }
);
