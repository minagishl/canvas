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
} from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { Popover } from './Popover';
import { tv } from 'tailwind-variants';
import {
  copyObject,
  deleteObject,
  lockObject,
  rotateObject,
} from '../utils/object';
import { fontSize } from '../types/canvas';
import { textEdit, textToggleItalic } from '../utils/text';
import { imageToggleCircle } from '../utils/image';

const popup = tv({
  base: 'absolute hidden group-hover:block left-1/2 -translate-x-1/2',
  variants: {
    isTextObject: {
      true: 'bottom-full mb-2',
      false: 'top-full mt-2',
    },
  },
});

const fontSizeArray: fontSize[] = [
  12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128,
];

interface TooltipProps {
  position: { x: number; y: number } | null;
  isDragging: boolean;
  setIsEditingId: React.Dispatch<React.SetStateAction<string>>;
}

const colors = ['#4f46e5', '#dc2626', '#16a34a', '#f59e0b', '#06b6d4'];

export function Tooltip({
  position,
  isDragging,
  setIsEditingId,
}: TooltipProps): React.ReactElement | null {
  const { objects, setObjects, selectedObjectId, setSelectedObjectId } =
    useCanvasContext();
  const [isRotating, setIsRotating] = React.useState(false);

  const handleColorChange = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectId
      );
      if (!selectedObject) return prevObjects;

      const availableColors =
        selectedObject.type === 'text' ? [...colors, '#fafafa'] : colors;

      const currentColorIndex = availableColors.indexOf(selectedObject.fill);
      const nextColorIndex = (currentColorIndex + 1) % availableColors.length;

      return prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, fill: availableColors[nextColorIndex] }
          : obj
      );
    });
  };

  const handleItalicChange = () => {
    if (!selectedObjectId) return;
    textToggleItalic(objects, selectedObjectId, setObjects);
  };

  const handleWeightChange = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectId
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
        obj.id === selectedObjectId ? { ...obj, weight: nextWeight } : obj
      );
    });
  };

  const handleTextEdit = () => {
    textEdit(selectedObjectId, objects, setIsEditingId);
  };

  const handleMoveDown = () => {
    if (!selectedObjectId) return;

    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObject) return;

    const selectedObjectIndex = objects.findIndex(
      (obj) => obj.id === selectedObjectId
    );

    setObjects((prevObjects) => {
      const nextObjects = [...prevObjects];
      nextObjects.splice(selectedObjectIndex, 1);
      nextObjects.splice(selectedObjectIndex - 1, 0, selectedObject);

      return nextObjects;
    });
  };

  const handleChangeFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedObjectId) return;

    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObject || selectedObject.type !== 'text') return;

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, fontSize: parseInt(e.target.value, 10) as fontSize }
          : obj
      )
    );
  };

  const handleChangeLocked = () => {
    if (!selectedObjectId) return;
    lockObject(selectedObjectId, setObjects);
  };

  const handleLineWidthChange = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectId
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
        obj.id === selectedObjectId ? { ...obj, lineWidth: nextWidth } : obj
      );
    });
  };

  const handleRotate = () => {
    rotateObject(
      selectedObjectId,
      objects,
      setObjects,
      isRotating,
      setIsRotating
    );
  };

  const handleDuplicateObject = () => {
    copyObject(objects, selectedObjectId, setObjects, setSelectedObjectId);
  };

  const handleDeleteObject = () => {
    deleteObject(selectedObjectId, setObjects, setSelectedObjectId);
  };

  const handleToggleCircle = () => {
    if (!selectedObjectId) return;
    imageToggleCircle(objects, selectedObjectId, setObjects);
  };

  if (!position) return null;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const isTextObject = selectedObject?.type === 'text';
  const isImageObject = selectedObject?.type === 'image';

  return (
    <div
      className="absolute z-10 flex select-none items-center gap-2 rounded-xl bg-white p-2 shadow-lg"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      {!isImageObject && (
        <>
          <button
            className="rounded-md p-2 transition-colors hover:bg-gray-100"
            onClick={handleColorChange}
          >
            <Circle
              className="h-5 w-5"
              fill={
                objects.find((obj) => obj.id === selectedObjectId)?.fill ||
                colors[0]
              }
              stroke="none"
            />
          </button>
          {(selectedObject?.type === 'line' ||
            selectedObject?.type === 'arrow') && (
            <>
              <div className="group relative">
                <button
                  className="flex size-9 items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-100"
                  onClick={handleLineWidthChange}
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
          <div className="group relative">
            <button
              className="rounded-md p-2 transition-colors hover:bg-gray-100"
              onClick={handleMoveDown}
            >
              <Layers2 className="h-5 w-5 rotate-180 scale-x-[-1]" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Move object down" upper={isTextObject} />
            </div>
          </div>
        </>
      )}
      {isTextObject && (
        <>
          <div className="group relative">
            <button
              className="rounded-md p-2 transition-colors hover:bg-gray-100"
              onClick={handleWeightChange}
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
              className="rounded-md p-2 transition-colors hover:bg-gray-100"
              onClick={handleItalicChange}
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
            className="rounded-md p-2 transition-colors hover:bg-gray-100"
            onClick={handleTextEdit}
          >
            <TextCursorInput className="h-5 w-5" />
          </button>
          <select
            className="h-9 appearance-none rounded-md p-2 text-center leading-tight transition-colors hover:bg-gray-100"
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
      {isImageObject && (
        <div className="group relative">
          <button
            className="rounded-md p-2 transition-colors hover:bg-gray-100"
            onClick={handleToggleCircle}
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
      )}
      <div className="group relative">
        <button
          className="rounded-md p-2 transition-colors hover:bg-gray-100"
          onClick={handleRotate}
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
          className="rounded-md p-2 transition-colors hover:bg-gray-100"
          onClick={handleChangeLocked}
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
      <div className="group relative">
        <button
          className="rounded-md p-2 transition-colors hover:bg-gray-100"
          onClick={handleDuplicateObject}
        >
          <Copy className="h-5 w-5" />
        </button>
        <div className={popup({ isTextObject })}>
          <Popover text="Duplicate object" upper={isTextObject} command="D" />
        </div>
      </div>
      <div className="group relative">
        <button
          className="rounded-md p-2 transition-colors hover:bg-gray-100"
          onClick={handleDeleteObject}
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
