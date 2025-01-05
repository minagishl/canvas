import { Pencil, ImageDown, Trash2 } from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";
import html2canvas from "html2canvas";

export function Menu() {
  const { selectedTool, setSelectedTool, setSelectedObjectId, setObjects } =
    useCanvasContext();

  const handleSaveImage = async () => {
    // Deselect the object
    setSelectedObjectId(null);

    setTimeout(async () => {
      try {
        // Get the canvas container
        const canvasContainer = document.querySelector(
          ".relative.w-full.h-full"
        );
        if (!canvasContainer) return;

        // Create a screenshot with html2canvas
        const canvas = await html2canvas(canvasContainer as HTMLElement, {
          backgroundColor: "#f9fafb",
          scale: window.devicePixelRatio,
          useCORS: true,
        });

        // Convert to Blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, "image/png");
        });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `canvas-${new Date().toISOString().slice(0, -5)}.png`;

        // Download the image
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the URL
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error saving image:", error);
      }
    }, 100);
  };

  const handleClearCanvas = () => {
    setObjects([]);
    setSelectedObjectId(null);
  };

  return (
    <div className="absolute bg-white rounded-md shadow-md flex items-center gap-2 justify-center left-1/2 -translate-x-1/2 top-2 animate-fade animate-once animate-duration-300 mt-2 p-2">
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
      <button
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          selectedTool === "save"
            ? "bg-indigo-100 text-indigo-600"
            : "hover:bg-gray-100"
        }`}
        onClick={handleSaveImage}
        title="Save as image"
      >
        <ImageDown className="w-5 h-5" />
      </button>
      <button
        className="p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-100"
        onClick={handleClearCanvas}
        title="Clear canvas"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
