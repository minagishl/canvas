import React from 'react';
import {
  Circle,
  CircleOff,
  TextCursorInput,
  Bold,
  LockKeyhole,
  UnlockKeyhole,
  Trash2,
  Copy,
  Italic,
  RefreshCw,
  Layers2,
  Eye,
  EyeOff,
  ArrowRight,
  Ban,
} from 'lucide-react';
import { useCanvasContext } from '~/contexts/CanvasContext';
import { Popover } from './Popover';
import { popup } from '~/variants';
import {
  copyObject,
  deleteObject,
  lockObject,
  rotateObject,
} from '~/utils/object';
import { fontSize } from '~/types/canvas';
import { textEdit, textToggleItalic } from '~/utils/text';
import { imageToggleCircle, imageToggleSpoiler } from '~/utils/image';
import { COLORS, NOTE_COLORS } from '~/utils/constants';
import { useHistoryContext } from '~/contexts/HistoryContext';
import { button, frame } from '~/variants';
import { useState } from 'react';
import { getInitialLanguage, translate } from '~/store/language';
import type { Language } from '~/store/language';

const fontSizeArray: fontSize[] = [
  12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128,
];

interface TooltipProps {
  position: { x: number; y: number } | null;
  isDragging: boolean;
  setIsEditingId: React.Dispatch<React.SetStateAction<string>>;
}

interface PopoverButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  popoverText: string;
  command?: string;
  extraButtonClassName?: string;
  isTextObject: boolean;
}

const PopoverButton: React.FC<PopoverButtonProps> = ({
  onClick,
  ariaLabel,
  children,
  popoverText,
  command,
  extraButtonClassName,
  isTextObject,
}) => (
  <div className="group relative">
    <button
      className={button({ className: extraButtonClassName })}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
    <div className={popup({ isTextObject })}>
      <Popover text={popoverText} upper={isTextObject} command={command} />
    </div>
  </div>
);

export function Tooltip({
  position,
  isDragging,
  setIsEditingId,
}: TooltipProps): React.ReactElement | null {
  const { objects, setObjects, selectedObjectIds, setSelectedObjectIds } =
    useCanvasContext();
  const { setHistory, setCurrentHistoryIndex, currentHistoryIndex } =
    useHistoryContext();
  const [isRotating, setIsRotating] = React.useState(false);
  const [currentLang] = useState<Language>(getInitialLanguage());

  const getStickyTextColor = (hexColor: string): string => {
    const normalized = hexColor.replace('#', '');
    if (normalized.length !== 6) return '#1f2937';
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1f2937' : '#f9fafb';
  };

  // Do not display if not a single selection
  if (selectedObjectIds.length !== 1) return null;
  const selectedId = selectedObjectIds[0];

  const handleColorChange = () => {
    setObjects((prevObjects) => {
      const obj = prevObjects.find((item) => item.id === selectedId);
      if (!obj) return prevObjects;
      const availableColors =
        obj.type === 'text'
          ? [...COLORS, '#fafafa']
          : obj.type === 'sticky'
            ? NOTE_COLORS
            : COLORS;
      const currentIndex = availableColors.indexOf(obj.fill || COLORS[0]);
      const nextColor =
        availableColors[(currentIndex + 1) % availableColors.length];
      return prevObjects.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              fill: nextColor,
              ...(item.type === 'sticky'
                ? { textColor: getStickyTextColor(nextColor) }
                : {}),
            }
          : item
      );
    });
  };

  const handleItalicChange = () => {
    textToggleItalic(objects, selectedId, setObjects);
  };

  const handleWeightChange = () => {
    setObjects((prevObjects) => {
      const obj = prevObjects.find((item) => item.id === selectedId);
      if (!obj) return prevObjects;
      const currentWeight = obj.weight || 100;
      const nextWeight =
        currentWeight >= 900
          ? 100
          : ((currentWeight + 100) as
              | 100
              | 200
              | 300
              | 400
              | 500
              | 600
              | 700
              | 800
              | 900);
      return prevObjects.map((item) =>
        item.id === selectedId ? { ...item, weight: nextWeight } : item
      );
    });
  };

  const handleTextEdit = () => {
    textEdit(selectedId, objects, setIsEditingId);
  };

  const handleMoveDown = () => {
    setObjects((prevObjects) => {
      const index = prevObjects.findIndex((item) => item.id === selectedId);
      if (index <= 0) return prevObjects;
      const newObjects = [...prevObjects];
      const [movedItem] = newObjects.splice(index, 1);
      newObjects.splice(index - 1, 0, movedItem);
      return newObjects;
    });
  };

  const handleChangeFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10) as fontSize;
    setObjects((prevObjects) =>
      prevObjects.map((item) =>
        item.id === selectedId &&
        (item.type === 'text' || item.type === 'sticky')
          ? { ...item, fontSize: newSize }
          : item
      )
    );
  };

  const handleChangeLocked = () => {
    lockObject(selectedId, setObjects);
  };

  const handleLineWidthChange = () => {
    setObjects((prevObjects) => {
      const obj = prevObjects.find((item) => item.id === selectedId);
      if (!obj || (obj.type !== 'line' && obj.type !== 'arrow'))
        return prevObjects;
      const widths = [2, 4, 6, 8, 10];
      const currentWidth = obj.lineWidth || 2;
      const currentIndex = widths.indexOf(currentWidth);
      const nextWidth = widths[(currentIndex + 1) % widths.length];
      return prevObjects.map((item) =>
        item.id === selectedId ? { ...item, lineWidth: nextWidth } : item
      );
    });
  };

  const handleArrowHeadChange = () => {
    setObjects((prevObjects) => {
      const obj = prevObjects.find((item) => item.id === selectedId);
      if (!obj || obj.type !== 'arrow') return prevObjects;
      return prevObjects.map((item) =>
        item.id === selectedId ? { ...item, arrowHead: !obj.arrowHead } : item
      );
    });
  };

  const handleRotate = () => {
    const obj = objects.find((item) => item.id === selectedId);
    if (obj?.locked) return;
    rotateObject(selectedId, objects, setObjects, isRotating, setIsRotating);
  };

  const handleDuplicateObject = () => {
    copyObject(
      objects,
      selectedObjectIds,
      setObjects,
      setSelectedObjectIds,
      setHistory,
      setCurrentHistoryIndex,
      currentHistoryIndex
    );
  };

  const handleDeleteObject = () => {
    deleteObject(
      objects,
      selectedObjectIds,
      setObjects,
      setSelectedObjectIds,
      setHistory,
      setCurrentHistoryIndex,
      currentHistoryIndex
    );
  };

  const handleToggleCircle = () => {
    imageToggleCircle(objects, selectedId, setObjects);
  };

  const handleToggleSpoiler = () => {
    imageToggleSpoiler(objects, selectedId, setObjects);
  };

  if (!position) return null;

  const selectedObject = objects.find((item) => item.id === selectedId);
  const isTextObject =
    selectedObject?.type === 'text' || selectedObject?.type === 'sticky';
  const isImageObject = selectedObject?.type === 'image';
  const isOriginalUrl = selectedObject?.originalUrl;
  const isEmbedObject = selectedObject?.type === 'embed';
  const isCircleObject = selectedObject?.type === 'circle';
  const isMultipleSelection = selectedObjectIds.length > 1;
  const isArrowObject = selectedObject?.type === 'arrow';

  return (
    <div
      className={frame({ className: 'absolute z-10 select-none' })}
      id="tooltip"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      {!isMultipleSelection && (
        <>
          {!isImageObject && !isEmbedObject && (
            <>
              <button
                className={button()}
                onClick={handleColorChange}
                aria-label={String(translate('color', currentLang))}
              >
                <Circle
                  className="h-5 w-5"
                  fill={selectedObject?.fill || COLORS[0]}
                  stroke="none"
                />
              </button>
              {(selectedObject?.type === 'line' ||
                selectedObject?.type === 'arrow') && (
                <PopoverButton
                  onClick={handleLineWidthChange}
                  ariaLabel={String(translate('lineWidth', currentLang))}
                  extraButtonClassName="flex size-9 items-center justify-center"
                  isTextObject={!!isTextObject}
                  popoverText={String(translate('lineWidth', currentLang))}
                >
                  <div
                    className="flex w-5 items-center justify-center"
                    style={{
                      height: selectedObject.lineWidth || 2,
                      backgroundColor: selectedObject.fill,
                      minHeight: '2px',
                    }}
                  />
                </PopoverButton>
              )}
            </>
          )}
          {!isTextObject && (
            <PopoverButton
              onClick={handleMoveDown}
              ariaLabel={String(translate('moveDown', currentLang))}
              isTextObject={!!isTextObject}
              popoverText={String(translate('moveDown', currentLang))}
            >
              <Layers2 className="h-5 w-5 rotate-180" />
            </PopoverButton>
          )}
          {isArrowObject && (
            <PopoverButton
              onClick={handleArrowHeadChange}
              ariaLabel={String(translate('toggleArrowHead', currentLang))}
              isTextObject={!!isTextObject}
              popoverText={String(translate('toggleArrowHead', currentLang))}
            >
              {selectedObject?.arrowHead ? (
                <ArrowRight className="h-5 w-5" />
              ) : (
                <Ban className="h-5 w-5" />
              )}
            </PopoverButton>
          )}
          {isTextObject && (
            <>
              <PopoverButton
                onClick={handleWeightChange}
                ariaLabel={String(translate('fontWeight', currentLang))}
                isTextObject={!!isTextObject}
                popoverText={String(translate('fontWeight', currentLang))}
                command="B"
              >
                <Bold className="h-5 w-5" />
              </PopoverButton>
              <PopoverButton
                onClick={handleItalicChange}
                ariaLabel={String(translate('fontStyle', currentLang))}
                isTextObject={!!isTextObject}
                popoverText={String(translate('fontStyle', currentLang))}
                command="I"
              >
                <Italic className="h-5 w-5" />
              </PopoverButton>
              <button
                className={button()}
                onClick={handleTextEdit}
                aria-label={String(translate('editText', currentLang))}
              >
                <TextCursorInput className="h-5 w-5" />
              </button>
            </>
          )}
          {isImageObject && !isOriginalUrl && (
            <>
              <PopoverButton
                onClick={handleToggleCircle}
                ariaLabel={String(translate('toggleCircle', currentLang))}
                isTextObject={!!isTextObject}
                popoverText={String(translate('toggleCircle', currentLang))}
              >
                {selectedObject?.circle ? (
                  <CircleOff className="h-5 w-5 scale-x-[-1]" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </PopoverButton>
              <PopoverButton
                onClick={handleToggleSpoiler}
                ariaLabel={String(translate('toggleSpoiler', currentLang))}
                isTextObject={!!isTextObject}
                popoverText={String(translate('toggleSpoiler', currentLang))}
              >
                {selectedObject?.spoiler ? (
                  <EyeOff className="h-5 w-5 scale-x-[-1]" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </PopoverButton>
            </>
          )}
          {!isCircleObject && (
            <PopoverButton
              onClick={handleRotate}
              ariaLabel={String(translate('rotateObject', currentLang))}
              isTextObject={!!isTextObject}
              popoverText={String(translate('rotateObject', currentLang))}
            >
              <RefreshCw className="h-5 w-5" />
            </PopoverButton>
          )}
          {isTextObject && (
            <>
              <div className="mx-2 h-6 w-px bg-gray-200" />
              <select
                className="flex h-10 max-w-11 min-w-11 appearance-none rounded-sm py-2 text-center leading-tight transition-colors hover:bg-gray-100"
                value={selectedObject?.fontSize || 24}
                onChange={handleChangeFontSize}
              >
                {fontSizeArray.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="mx-2 h-6 w-px bg-gray-200" />
          <PopoverButton
            onClick={handleChangeLocked}
            ariaLabel={String(translate('lockObject', currentLang))}
            isTextObject={!!isTextObject}
            popoverText={String(translate('lockObject', currentLang))}
          >
            {selectedObject?.locked ? (
              <LockKeyhole className="h-5 w-5" />
            ) : (
              <UnlockKeyhole className="h-5 w-5" />
            )}
          </PopoverButton>
        </>
      )}
      <PopoverButton
        onClick={handleDuplicateObject}
        ariaLabel={String(translate('duplicateObject', currentLang))}
        isTextObject={!!isTextObject}
        popoverText={String(translate('duplicateObject', currentLang))}
        command="D"
      >
        <Copy className="h-5 w-5" />
      </PopoverButton>
      <PopoverButton
        onClick={handleDeleteObject}
        ariaLabel={String(translate('deleteObject', currentLang))}
        isTextObject={!!isTextObject}
        popoverText={String(translate('deleteObject', currentLang))}
      >
        <Trash2 className="h-5 w-5" />
      </PopoverButton>
    </div>
  );
}
