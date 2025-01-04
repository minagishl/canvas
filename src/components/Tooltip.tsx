import React from "react";
import { Circle, TextCursorInput, Bold } from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";

interface TooltipProps {
  position: { x: number; y: number } | null;
  isDragging: boolean;
}

const colors = ["#4f46e5", "#ef4444", "#22c55e", "#f59e0b", "#06b6d4"];

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

      const currentColorIndex = colors.indexOf(selectedObject.fill);
      const nextColorIndex = (currentColorIndex + 1) % colors.length;

      return prevObjects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, fill: colors[nextColorIndex] }
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

  if (!position) return null;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const isTextObject = selectedObject?.type === "text";

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
        </>
      )}
    </div>
  );
}
