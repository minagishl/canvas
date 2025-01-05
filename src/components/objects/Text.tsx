import React, { useRef, useEffect } from 'react';
import { CanvasObject } from '../../types/canvas';

interface TextObjectProps {
  obj: CanvasObject & { type: 'text' };
  scale: number;
  offset: { x: number; y: number };
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  selectedTool: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export const TextObject = React.memo(
  ({
    obj,
    scale,
    offset,
    isSelected,
    isDragging,
    isResizing,
    selectedTool,
    onMouseDown,
    onBlur,
    isEditing,
    onEditStart,
    onEditEnd,
  }: TextObjectProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });

    const getFontSize = () => {
      return obj.fontSize === undefined ? 24 : obj.fontSize;
    };

    const getLineHeight = () => {
      switch (obj.fontSize) {
        case 12:
          return 16;
        case 14:
          return 20;
        case 16:
          return 24;
        case 18:
          return 28;
        case 20:
          return 28;
        case 24:
          return 32;
        case 30:
          return 36;
        case 36:
          return 40;
        default:
          return 32; // Because the default font size is 24px
      }
    };

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
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={`absolute outline-none hover:border-2 hover:border-indigo-600 ${
          isSelected ? 'border-2 border-indigo-600' : ''
        }`}
        style={{
          left: 0,
          top: 0,
          fontSize: `${getFontSize() * scale}px`,
          paddingRight: `${6 * scale}px`,
          paddingLeft: `${6 * scale}px`,
          color: obj.fill,
          willChange: 'transform',
          pointerEvents: isDragging ? 'none' : isResizing ? 'none' : 'auto',
          cursor: selectedTool === 'select' ? 'move' : 'default',
          fontWeight: obj.weight,
          lineHeight: `${getLineHeight() * scale}px`,
        }}
        onMouseDown={onMouseDown}
        onBlur={(e) => {
          onBlur(e);
          onEditEnd();
        }}
        onFocus={() => onEditStart()}
      >
        {obj.text}
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
      prevProps.selectedTool === nextProps.selectedTool &&
      prevProps.obj.text === nextProps.obj.text &&
      prevProps.obj.weight === nextProps.obj.weight &&
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.isResizing === nextProps.isResizing &&
      prevProps.onMouseDown === nextProps.onMouseDown &&
      prevProps.onBlur === nextProps.onBlur &&
      prevProps.onEditStart === nextProps.onEditStart &&
      prevProps.onEditEnd === nextProps.onEditEnd &&
      prevProps.obj.fill === nextProps.obj.fill &&
      prevProps.obj.fontSize === nextProps.obj.fontSize
    );
  }
);
