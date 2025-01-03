import React from "react";
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { ToolType } from "../types/canvas";

const tools: { icon: typeof MousePointer2; name: ToolType }[] = [
  { icon: MousePointer2, name: "select" },
  { icon: Square, name: "rectangle" },
  { icon: Circle, name: "circle" },
  { icon: Type, name: "text" },
  { icon: ImageIcon, name: "image" },
];

export function Toolbar(): React.ReactElement {
  const { setScale, selectedTool, setSelectedTool } = useCanvasContext();

  function handleZoomIn(): void {
    setScale((prev) => Math.min(prev + 0.1, 2));
  }

  function handleZoomOut(): void {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
      {tools.map((Tool) => (
        <button
          key={Tool.name}
          className={`p-2 rounded-md transition-colors ${
            selectedTool === Tool.name
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100"
          }`}
          title={Tool.name}
          onClick={() => setSelectedTool(Tool.name)}
        >
          <Tool.icon className="w-5 h-5" />
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200 mx-2" />
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
    </div>
  );
}
