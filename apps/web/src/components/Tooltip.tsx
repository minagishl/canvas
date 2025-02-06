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

  const handleColorChange = () => {
    if (selectedObjectIds.length !== 1) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectIds[0]
      );

      if (!selectedObject) return prevObjects;

      const availableColors =
        selectedObject.type === 'text' ? [...COLORS, '#fafafa'] : COLORS;

      const currentColorIndex = availableColors.indexOf(
        selectedObject.fill || COLORS[0]
      );
      const nextColorIndex = (currentColorIndex + 1) % availableColors.length;

      return prevObjects.map((obj) =>
        obj.id === selectedObjectIds[0]
          ? { ...obj, fill: availableColors[nextColorIndex] }
          : obj
      );
    });
  };

  const handleItalicChange = () => {
    if (selectedObjectIds.length !== 1) return;
    textToggleItalic(objects, selectedObjectIds[0], setObjects);
  };

  const handleWeightChange = () => {
    if (selectedObjectIds.length === 0) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find((obj) =>
        selectedObjectIds.includes(obj.id)
      );

      if (!selectedObject) return prevObjects;

      const currentWeight = selectedObject.weight || 100;
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

      return prevObjects.map((obj) =>
        selectedObjectIds.includes(obj.id)
          ? { ...obj, weight: nextWeight }
          : obj
      );
    });
  };

  const handleTextEdit = () => {
    if (selectedObjectIds.length !== 1) return;
    textEdit(selectedObjectIds[0], objects, setIsEditingId);
  };

  const handleMoveDown = () => {
    if (selectedObjectIds.length !== 1) return;

    const selectedObject = objects.find(
      (obj) => obj.id === selectedObjectIds[0]
    );
    if (!selectedObject) return;

    const selectedObjectIndex = objects.findIndex(
      (obj) => obj.id === selectedObjectIds[0]
    );

    setObjects((prevObjects) => {
      const nextObjects = [...prevObjects];
      nextObjects.splice(selectedObjectIndex, 1);
      nextObjects.splice(selectedObjectIndex - 1, 0, selectedObject);

      return nextObjects;
    });
  };

  const handleChangeFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedObjectIds.length) return;

    const selectedObject = objects.find(
      (obj) => obj.id === selectedObjectIds[0]
    );
    if (!selectedObject || selectedObject.type !== 'text') return;

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === selectedObjectIds[0]
          ? { ...obj, fontSize: parseInt(e.target.value, 10) as fontSize }
          : obj
      )
    );
  };

  const handleChangeLocked = () => {
    if (!selectedObjectIds.length) return;
    lockObject(selectedObjectIds[0], setObjects);
  };

  const handleLineWidthChange = () => {
    if (selectedObjectIds.length !== 1) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectIds[0]
      );
      if (
        !selectedObject ||
        (selectedObject.type !== 'line' && selectedObject.type !== 'arrow')
      )
        return prevObjects;

      const widths = [2, 4, 6, 8, 10];
      const currentWidth = selectedObject.lineWidth || 2;
      const currentIndex = widths.indexOf(currentWidth);
      const nextWidth = widths[(currentIndex + 1) % widths.length];

      return prevObjects.map((obj) =>
        obj.id === selectedObjectIds[0] ? { ...obj, lineWidth: nextWidth } : obj
      );
    });
  };

  const handleRotate = () => {
    if (selectedObjectIds.length !== 1) return;

    const object = objects.find((obj) => obj.id === selectedObjectIds[0]);
    if (object?.locked === true) return;
    rotateObject(
      selectedObjectIds[0],
      objects,
      setObjects,
      isRotating,
      setIsRotating
    );
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
    if (selectedObjectIds.length !== 1) return;

    imageToggleCircle(objects, selectedObjectIds[0], setObjects);
  };

  const handleToggleSpoiler = () => {
    if (selectedObjectIds.length !== 1) return;

    imageToggleSpoiler(objects, selectedObjectIds[0], setObjects);
  };

  if (!position) return null;

  const selectedObject = objects.find((obj) =>
    selectedObjectIds.includes(obj.id)
  );
  const isTextObject = selectedObject?.type === 'text';
  const isImageObject = selectedObject?.type === 'image';
  const isOriginalUrl = selectedObject?.originalUrl;
  const isEmbedObject = selectedObject?.type === 'embed';
  const isMultipleSelection = selectedObjectIds.length > 1;

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
                  fill={
                    objects.find((obj) => obj.id === selectedObjectIds[0])
                      ?.fill || COLORS[0]
                  }
                  stroke="none"
                />
              </button>
              {(selectedObject?.type === 'line' ||
                selectedObject?.type === 'arrow') && (
                <>
                  <div className="group relative">
                    <button
                      className={button({
                        className: 'flex size-9 items-center justify-center',
                      })}
                      onClick={handleLineWidthChange}
                      aria-label="Line width"
                    >
                      <div
                        className="flex w-5 items-center justify-center"
                        style={{
                          height: selectedObject.lineWidth || 2,
                          backgroundColor: selectedObject.fill,
                          minHeight: '2px',
                        }}
                      />
                    </button>
                    <div className={popup({ isTextObject })}>
                      <Popover text="Change line width" upper={isTextObject} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          <div className="group relative">
            <button
              className={button()}
              onClick={handleMoveDown}
              aria-label="Move"
            >
              <Layers2 className="h-5 w-5 rotate-180" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Move object down" upper={isTextObject} />
            </div>
          </div>
          {isTextObject && (
            <>
              <div className="group relative">
                <button
                  className={button()}
                  onClick={handleWeightChange}
                  aria-label="Weight"
                >
                  <Bold className="h-5 w-5" />
                </button>
                <div className={popup({ isTextObject })}>
                  <Popover
                    text="Change font weight"
                    upper={isTextObject}
                    command="B"
                  />
                </div>
              </div>
              <div className="group relative">
                <button
                  className={button()}
                  onClick={handleItalicChange}
                  aria-label="Italic"
                >
                  <Italic className="h-5 w-5" />
                </button>
                <div className={popup({ isTextObject })}>
                  <Popover
                    text="Change font style"
                    upper={isTextObject}
                    command="I"
                  />
                </div>
              </div>
              <button
                className={button()}
                onClick={handleTextEdit}
                aria-label="Edit"
              >
                <TextCursorInput className="h-5 w-5" />
              </button>
              <select
                className="h-9 appearance-none rounded-sm p-2 text-center leading-tight transition-colors hover:bg-gray-100"
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
          {isImageObject && !isOriginalUrl && (
            <>
              <div className="group relative">
                <button
                  className={button()}
                  onClick={handleToggleCircle}
                  aria-label="Circle"
                >
                  {selectedObject?.circle ? (
                    <CircleOff className="h-5 w-5 scale-x-[-1]" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className={popup({ isTextObject })}>
                  <Popover text="Toggle circle" upper={isTextObject} />
                </div>
              </div>
              <div className="group relative">
                <button
                  className={button()}
                  onClick={handleToggleSpoiler}
                  aria-label="Spoiler"
                >
                  {selectedObject?.spoiler ? (
                    <EyeOff className="h-5 w-5 scale-x-[-1]" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <div className={popup({ isTextObject })}>
                  <Popover text="Toggle spoiler" upper={isTextObject} />
                </div>
              </div>
            </>
          )}
          <div className="group relative">
            <button
              className={button()}
              onClick={handleRotate}
              aria-label="Rotate"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Rotate object" upper={isTextObject} />
            </div>
          </div>
          <div className="mx-2 h-6 w-px bg-gray-200" />
          <div className="group relative">
            <button
              className={button()}
              onClick={handleChangeLocked}
              aria-label="Lock"
            >
              {selectedObject?.locked ? (
                <LockKeyhole className="h-5 w-5" />
              ) : (
                <UnlockKeyhole className="h-5 w-5" />
              )}
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Lock object" upper={isTextObject} />
            </div>
          </div>
        </>
      )}
      <div className="group relative">
        <button
          className={button()}
          onClick={handleDuplicateObject}
          aria-label="Duplicate"
        >
          <Copy className="h-5 w-5" />
        </button>
        <div className={popup({ isTextObject })}>
          <Popover text="Duplicate object" upper={isTextObject} command="D" />
        </div>
      </div>
      <div className="group relative">
        <button
          className={button()}
          onClick={handleDeleteObject}
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <div className={popup({ isTextObject })}>
          <Popover text="Delete object" upper={isTextObject} />
        </div>
      </div>
    </div>
  );
}
