import React, { useRef } from "react";
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
} from "lucide-react";
import { useCanvasContext } from "../contexts/CanvasContext";
import { ToolType } from "../types/canvas";

const tools: {
  icon: typeof MousePointer2;
  name: ToolType;
  disabled: boolean;
}[] = [
  { icon: MousePointer2, name: "select", disabled: false },
  { icon: Square, name: "rectangle", disabled: false },
  { icon: Circle, name: "circle", disabled: false },
  { icon: Type, name: "text", disabled: false },
  { icon: ImageIcon, name: "image", disabled: true },
];

export function Toolbar(): React.ReactElement {
  const { offset, setOffset, scale, setScale, selectedTool, setSelectedTool } =
    useCanvasContext();

  const [isZooming, setIsZooming] = React.useState(false);
  const animationRef = useRef<number | null>(null);

  const handleZoom = (
    zoomFactor: number,
    minScale: number,
    maxScale: number
  ) => {
    if (isZooming) return; // If it's already zooming, it does nothing.

    const newScale = Math.min(Math.max(scale + zoomFactor, minScale), maxScale);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const worldX = (centerX - offset.x) / scale;
    const worldY = (centerY - offset.y) / scale;

    const newOffsetX = centerX - worldX * newScale;
    const newOffsetY = centerY - worldY * newScale;

    const startScale = scale;
    const startOffset = { ...offset };
    const scaleDiff = newScale - startScale;
    const offsetDiff = {
      x: newOffsetX - startOffset.x,
      y: newOffsetY - startOffset.y,
    };

    const duration = 300;
    const startTime = performance.now();

    setIsZooming(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      const animatedScale = startScale + scaleDiff * easedProgress;
      const animatedOffset = {
        x: startOffset.x + offsetDiff.x * easedProgress,
        y: startOffset.y + offsetDiff.y * easedProgress,
      };

      setScale(animatedScale);
      setOffset(animatedOffset);

      if (progress < 1 && animationRef.current !== null) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsZooming(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleZoomIn = () => {
    handleZoom(0.1, 0.7, 2);
  };

  const handleZoomOut = () => {
    handleZoom(-0.1, 0.7, 2);
  };

  React.useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
      {tools.map((Tool) => (
        <div key={Tool.name} className="relative group">
          <button
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              selectedTool === Tool.name
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            } ${Tool.disabled && "opacity-50"}`}
            title={Tool.name}
            onClick={() => {
              if (!Tool.disabled) {
                setSelectedTool(Tool.name);
              }
            }}
          >
            <Tool.icon className="w-5 h-5" />
          </button>
          {Tool.disabled && (
            <div className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-2">
              <Popover name={Tool.name} />
            </div>
          )}
        </div>
      ))}
      <button
        key="more"
        className="p-2 rounded-md transition-colors hover:bg-gray-100 cursor-pointer"
        title="More"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-2" />
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom Out"
        disabled={isZooming || scale <= 0.7}
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom In"
        disabled={isZooming || scale >= 2}
      >
        <ZoomIn className="w-5 h-5" />
      </button>
    </div>
  );
}

// TODO: Need to work on design.
function Popover({ name }: { name: string }): React.ReactElement {
  return (
    <div className="absolute bg-white p-2 rounded-xl shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 top-4">
      <div className="w-fit flex items-center justify-center rounded-md font-sans flex-col whitespace-nowrap">
        <p>{name} is disabled</p>
      </div>
    </div>
  );
}
