import React, { useRef, useEffect } from 'react';
import { CanvasObject } from '~/types/canvas';
import { text } from '~/variants';
import { isMobile } from '~/utils/device';

interface TextObjectProps {
  selectedTool: string;
  selectedObjectIds: string[];
  scale: number;
  offset: { x: number; y: number };
  obj: CanvasObject & { type: 'text' };
  isResizing: boolean;
  isEditingId: string;
  isDragging: boolean;
  isMoving: boolean;
  onTextChange: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const TextObject = React.memo(
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
  }: TextObjectProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });

    const getFontSize = () => {
      return obj.fontSize === undefined ? 24 : obj.fontSize;
    };

    const getLineHeight = (scale: number): string => {
      switch (obj.fontSize) {
        case 12:
          return `${16 * scale}px`;
        case 14:
          return `${20 * scale}px`;
        case 16:
          return `${24 * scale}px`;
        case 18:
          return `${28 * scale}px`;
        case 20:
          return `${28 * scale}px`;
        case 24:
          return `${32 * scale}px`;
        case 30:
          return `${36 * scale}px`;
        case 36:
          return `${40 * scale}px`;
        default:
          return '1';
      }
    };

    useEffect(() => {
      positionRef.current = {
        x: obj.position.x * scale + offset.x,
        y: obj.position.y * scale + offset.y,
      };

      if (elementRef.current) {
        elementRef.current.style.transform = `translate(-50%, -50%) translate3d(${
          positionRef.current.x
        }px, ${positionRef.current.y}px, 0) rotate(${obj.rotation || 0}deg)`;
      }
    }, [
      obj.position.x,
      obj.position.y,
      scale,
      offset.x,
      offset.y,
      obj.rotation,
    ]);

    useEffect(() => {
      obj.text = elementRef.current?.textContent || '';
    }, [selectedObjectIds, obj]);

    const isSelected = selectedObjectIds.includes(obj.id);

    return (
      <div
        ref={elementRef}
        key={obj.id}
        data-object-id={obj.id}
        contentEditable={isEditingId === obj.id}
        suppressContentEditableWarning
        className={text({ isSelected })}
        style={{
          left: 0,
          top: 0,
          fontSize: `${getFontSize() * scale}px`,
          paddingRight: `${6 * scale}px`,
          paddingLeft: `${6 * scale}px`,
          color: obj.fill,
          willChange: 'transform',
          pointerEvents: isMobile
            ? 'none'
            : isDragging
              ? 'none'
              : isResizing
                ? 'none'
                : isMoving
                  ? 'none'
                  : 'auto',
          cursor: selectedTool === 'select' ? 'move' : 'default',
          fontWeight: obj.weight,
          lineHeight: getLineHeight(scale),
          whiteSpace: 'pre-wrap',
          maxWidth: 'fit-content',
          fontStyle: obj.italic ? 'italic' : 'normal',
        }}
        onMouseDown={onMouseDown}
        onInput={onTextChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
          }

          if (e.key === 'Escape') {
            e.preventDefault();
            elementRef.current?.blur();
          }
        }}
      >
        {obj.text === '' ? 'Select to edit' : obj.text}
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
      prevProps.selectedObjectIds === nextProps.selectedObjectIds &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.selectedTool === nextProps.selectedTool &&
      prevProps.obj.text === nextProps.obj.text &&
      prevProps.obj.weight === nextProps.obj.weight &&
      prevProps.isEditingId === nextProps.isEditingId &&
      prevProps.isResizing === nextProps.isResizing &&
      prevProps.isMoving === nextProps.isMoving &&
      prevProps.onMouseDown === nextProps.onMouseDown &&
      prevProps.obj.fill === nextProps.obj.fill &&
      prevProps.obj.fontSize === nextProps.obj.fontSize &&
      prevProps.obj.italic === nextProps.obj.italic &&
      prevProps.obj.rotation === nextProps.obj.rotation
    );
  }
);
