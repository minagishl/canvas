import { Pencil } from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";

export function Menu() {
  const { selectedTool, setSelectedTool } = useCanvasContext();

  return (
    <div className="absolute bg-white rounded-md shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 top-2 animate-fade animate-once animate-duration-300 mt-2 p-2">
      <button
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          selectedTool === "pen"
            ? "bg-indigo-100 text-indigo-600"
            : "hover:bg-gray-100"
        }`}
        onClick={() => {
          setSelectedTool("pen");
        }}
      >
        <Pencil className="w-5 h-5" />
      </button>
    </div>
  );
}
