import React from "react";
import {
  Circle,
  TextCursorInput,
  Bold,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";

interface TooltipProps {
  position: { x: number; y: number } | null;
  isDragging: boolean;
}

const colors = ["#4f46e5", "#dc2626", "#16a34a", "#f59e0b", "#06b6d4"];

export function Tooltip({
  position,
  isDragging,
}: TooltipProps): React.ReactElement | null {
  const { objects, setObjects, selectedObjectId } = useCanvasContext();

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
      nextObjects.splice(selectedObjectIndex + 1, 0, selectedObject);

      return nextObjects;
    });
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

  if (!position) return null;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const isTextObject = selectedObject?.type === "text";

  if (selectedObject?.type === "image") return null;

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
      <button
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        onClick={handleMoveUp}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
      <button
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        onClick={handleMoveDown}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      {isTextObject && (
        <>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={handleWeightChange}
          >
            <Bold className="w-5 h-5" />
          </button>
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
    </div>
  );
}
