import React from "react";
import {
  Circle,
  TextCursorInput,
  Bold,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  UnlockKeyhole,
  Trash2,
} from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { Popover } from "./Popover";
import { tv } from "tailwind-variants";

const popup = tv({
  base: "absolute hidden group-hover:block left-1/2 -translate-x-1/2",
  variants: {
    isTextObject: {
      true: "bottom-full mb-2",
      false: "top-full mt-2",
    },
  },
});

interface TooltipProps {
  position: { x: number; y: number } | null;
  isDragging: boolean;
}

const colors = ["#4f46e5", "#dc2626", "#16a34a", "#f59e0b", "#06b6d4"];

export function Tooltip({
  position,
  isDragging,
}: TooltipProps): React.ReactElement | null {
  const { objects, setObjects, selectedObjectId, setSelectedObjectId } =
    useCanvasContext();

  const handleColorChange = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectId
      );
      if (!selectedObject) return prevObjects;

      const availableColors =
        selectedObject.type === "text" ? [...colors, "#fafafa"] : colors;

      const currentColorIndex = availableColors.indexOf(selectedObject.fill);
      const nextColorIndex = (currentColorIndex + 1) % availableColors.length;

      return prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, fill: availableColors[nextColorIndex] }
          : obj
      );
    });
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
    if (!selectedObjectId) return;

    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObject || selectedObject.type !== "text") return;

    // Find and focus text elements
    const textElement = document.querySelector(
      `[data-object-id="${selectedObjectId}"]`
    ) as HTMLElement;

    if (textElement) {
      textElement.contentEditable = "true";
      textElement.focus();
    }
  };

  const handleMoveUp = () => {
    if (!selectedObjectId) return;

    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObject) return;

    const selectedObjectIndex = objects.findIndex(
      (obj) => obj.id === selectedObjectId
    );

    setObjects((prevObjects) => {
      const nextObjects = [...prevObjects];
      nextObjects.splice(selectedObjectIndex, 1);
      nextObjects.splice(selectedObjectIndex + 1, 0, selectedObject);

      return nextObjects;
    });
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
    if (!selectedObject || selectedObject.type !== "text") return;

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, fontSize: parseInt(e.target.value, 10) }
          : obj
      )
    );
  };

  const handleChangeLocked = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === selectedObjectId ? { ...obj, locked: !obj.locked } : obj
      )
    );
  };

  const handleLineWidthChange = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) => {
      const selectedObject = prevObjects.find(
        (obj) => obj.id === selectedObjectId
      );
      if (!selectedObject || selectedObject.type !== "line") return prevObjects;

      const widths = [2, 4, 6, 8, 10];
      const currentWidth = selectedObject.lineWidth || 2;
      const currentIndex = widths.indexOf(currentWidth);
      const nextWidth = widths[(currentIndex + 1) % widths.length];

      return prevObjects.map((obj) =>
        obj.id === selectedObjectId ? { ...obj, lineWidth: nextWidth } : obj
      );
    });
  };

  const handleDelete = () => {
    if (!selectedObjectId) return;

    setObjects((prevObjects) =>
      prevObjects.filter((obj) => obj.id !== selectedObjectId)
    );
    setSelectedObjectId(null);
  };

  if (!position) return null;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const isTextObject = selectedObject?.type === "text";
  const isImageObject = selectedObject?.type === "image";

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 select-none absolute z-10"
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -100%)",
        marginTop: "-8px",
        pointerEvents: isDragging ? "none" : "auto",
      }}
    >
      {!isImageObject && (
        <>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={handleColorChange}
          >
            <Circle
              className="w-5 h-5"
              fill={
                objects.find((obj) => obj.id === selectedObjectId)?.fill ||
                colors[0]
              }
              stroke="none"
            />
          </button>
          {selectedObject?.type === "line" && (
            <>
              <div className="relative group">
                <button
                  className="p-2 size-9 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
                  onClick={handleLineWidthChange}
                >
                  <div
                    className="w-5 flex items-center justify-center"
                    style={{
                      height: selectedObject.lineWidth || 2,
                      backgroundColor: selectedObject.fill,
                      minHeight: "2px",
                    }}
                  />
                </button>
                <div className={popup({ isTextObject })}>
                  <Popover text="Change line width" upper={isTextObject} />
                </div>
              </div>
            </>
          )}
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleMoveDown}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Move object down" upper={isTextObject} />
            </div>
          </div>
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleMoveUp}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Move object up" upper={isTextObject} />
            </div>
          </div>
        </>
      )}
      {isTextObject && (
        <>
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleWeightChange}
            >
              <Bold className="w-5 h-5" />
            </button>
            <div className={popup({ isTextObject })}>
              <Popover text="Change font weight" upper={isTextObject} />
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={handleTextEdit}
          >
            <TextCursorInput className="w-5 h-5" />
          </button>
          <select
            className="p-2 hover:bg-gray-100 rounded-md transition-colors appearance-none h-9 text-center leading-tight"
            value={selectedObject?.fontSize || 24}
            onChange={handleChangeFontSize}
          >
            {[12, 14, 16, 18, 20, 24, 30, 36].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </>
      )}
      {!isImageObject && <div className="w-px h-6 bg-gray-200 mx-2" />}
      <div className="relative group">
        <button
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={handleChangeLocked}
        >
          {selectedObject?.locked ? (
            <LockKeyhole className="w-5 h-5" />
          ) : (
            <UnlockKeyhole className="w-5 h-5" />
          )}
        </button>
        <div className={popup({ isTextObject })}>
          <Popover text="Lock object" upper={isTextObject} />
        </div>
      </div>
      <div className="relative group">
        <button
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={handleDelete}
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className={popup({ isTextObject })}>
          <Popover text="Delete object" upper={isTextObject} />
        </div>
      </div>
    </div>
  );
}
