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
import { COLORS } from '~/utils/constants';
import { useHistoryContext } from '~/contexts/HistoryContext';
import { button, frame } from '~/variants';

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

  // Do not display if not a single selection
  if (selectedObjectIds.length !== 1) return null;
  const selectedId = selectedObjectIds[0];

  const handleColorChange = () => {
    setObjects((prevObjects) => {
      const obj = prevObjects.find((item) => item.id === selectedId);
      if (!obj) return prevObjects;
      const availableColors =
        obj.type === 'text' ? [...COLORS, '#fafafa'] : COLORS;
      const currentIndex = availableColors.indexOf(obj.fill || COLORS[0]);
      const nextColor =
        availableColors[(currentIndex + 1) % availableColors.length];
      return prevObjects.map((item) =>
        item.id === selectedId ? { ...item, fill: nextColor } : item
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
        item.id === selectedId && item.type === 'text'
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
  const isTextObject = selectedObject?.type === 'text';
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
                aria-label="Color"
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
                  ariaLabel="Line width"
                  extraButtonClassName="flex size-9 items-center justify-center"
                  isTextObject={!!isTextObject}
                  popoverText="Change line width"
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
              ariaLabel="Move"
              isTextObject={!!isTextObject}
              popoverText="Move object down"
            >
              <Layers2 className="h-5 w-5 rotate-180" />
            </PopoverButton>
          )}
          {isArrowObject && (
            <PopoverButton
              onClick={handleArrowHeadChange}
              ariaLabel="Arrow head"
              isTextObject={!!isTextObject}
              popoverText="Toggle arrow head"
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
                ariaLabel="Weight"
                isTextObject={!!isTextObject}
                popoverText="Change font weight"
                command="B"
              >
                <Bold className="h-5 w-5" />
              </PopoverButton>
              <PopoverButton
                onClick={handleItalicChange}
                ariaLabel="Italic"
                isTextObject={!!isTextObject}
                popoverText="Change font style"
                command="I"
              >
                <Italic className="h-5 w-5" />
              </PopoverButton>
              <button
                className={button()}
                onClick={handleTextEdit}
                aria-label="Edit"
              >
                <TextCursorInput className="h-5 w-5" />
              </button>
            </>
          )}
          {isImageObject && !isOriginalUrl && (
            <>
              <PopoverButton
                onClick={handleToggleCircle}
                ariaLabel="Circle"
                isTextObject={!!isTextObject}
                popoverText="Toggle circle"
              >
                {selectedObject?.circle ? (
                  <CircleOff className="h-5 w-5 scale-x-[-1]" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </PopoverButton>
              <PopoverButton
                onClick={handleToggleSpoiler}
                ariaLabel="Spoiler"
                isTextObject={!!isTextObject}
                popoverText="Toggle spoiler"
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
              ariaLabel="Rotate"
              isTextObject={!!isTextObject}
              popoverText="Rotate object"
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
            ariaLabel="Lock"
            isTextObject={!!isTextObject}
            popoverText="Lock object"
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
        ariaLabel="Duplicate"
        isTextObject={!!isTextObject}
        popoverText="Duplicate object"
        command="D"
      >
        <Copy className="h-5 w-5" />
      </PopoverButton>
      <PopoverButton
        onClick={handleDeleteObject}
        ariaLabel="Delete"
        isTextObject={!!isTextObject}
        popoverText="Delete object"
      >
        <Trash2 className="h-5 w-5" />
      </PopoverButton>
    </div>
  );
}
