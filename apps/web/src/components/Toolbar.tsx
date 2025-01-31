import React, { useRef, useCallback } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  BugPlay,
} from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { ToolType } from '../types/canvas';
import { isMobile } from 'react-device-detect';
import { Popover } from './Popover';
import { Menu } from './Menu';
import { Loading } from './Loading';
import { shareCanvasAsURL } from '../utils/canvas';
import { useAlertContext } from '../contexts/AlertContext';
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100',
  variants: {
    isSelected: {
      true: 'bg-indigo-100 text-indigo-600',
    },
  },
});

const container = tv({
  base: 'fixed top-4 left-1/2 z-40 flex max-w-96 -translate-x-1/2 items-center gap-2 rounded-xl bg-white p-2 shadow-lg select-none',
  variants: {
    isDevMode: {
      true: 'max-w-none',
    },
  },
});

const tools: {
  icon: typeof MousePointer2;
  name: ToolType;
}[] = [
  { icon: MousePointer2, name: 'select' },
  { icon: Square, name: 'rectangle' },
  { icon: Circle, name: 'circle' },
  { icon: Type, name: 'text' },
  { icon: ImageIcon, name: 'image' },
];

export function Toolbar(): React.ReactElement {
  const {
    objects,
    offset,
    setOffset,
    scale,
    setScale,
    selectedTool,
    setSelectedTool,
    setSelectedObjectId,
  } = useCanvasContext();
  const { setAlert } = useAlertContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isZooming, setIsZooming] = React.useState(false);
  const animationRef = useRef<number | null>(null);

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool);
    if (window.gtag) {
      window.gtag('event', 'select_tool', {
        tool_type: tool,
        event_category: 'canvas',
      });
    }
  };

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

  const handleShareCanvas = useCallback(() => {
    shareCanvasAsURL(objects, {
      setIsLoading,
      setSelectedObjectId,
      setAlert,
    });
  }, [objects, setIsLoading, setSelectedObjectId, setAlert]);

  React.useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && selectedTool !== 'select') {
      handleToolSelect('select');

      const selectButton = document.getElementById('toolbar-select');
      if (selectButton) {
        selectButton.focus();
      }
    }
  };

  const isDevMode = import.meta.env.MODE === 'development';

  return (
    <>
      <Loading hidden={!isLoading} />
      <div className={container({ isDevMode })}>
        {tools
          .filter((Tool) => !isMobile || Tool.name === 'select')
          .map((Tool) => (
            <div key={Tool.name} className="group relative">
              <button
                id={`toolbar-${Tool.name}`}
                className={button({ isSelected: selectedTool === Tool.name })}
                onClick={() => handleToolSelect(Tool.name)}
                onKeyDown={handleOnKeyDown}
              >
                <Tool.icon className="h-5 w-5" />
              </button>
            </div>
          ))}
        {!isMobile && (
          <div className="group relative">
            <button key="more" className={button()}>
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <div className="absolute left-1/2 hidden h-8 w-24 -translate-x-1/2 group-hover:block" />
            <div className="absolute top-full left-1/2 hidden -translate-x-1/2 pt-3 group-hover:block">
              <Menu handleShareCanvas={handleShareCanvas} />
            </div>
          </div>
        )}
        <div className="relative flex h-6 w-4 items-center justify-center">
          <div className="h-6 w-px bg-gray-200" />
        </div>
        <div className="group relative">
          <button
            onClick={handleZoomOut}
            className={button()}
            disabled={isZooming || scale <= 0.7}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Zoom out" upper={false} />
          </div>
        </div>
        <div className="group relative">
          <button
            onClick={handleZoomIn}
            className={button()}
            disabled={isZooming || scale >= 2}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Zoom in" upper={false} />
          </div>
        </div>
        {isDevMode && (
          <div className="group relative">
            <button
              className="rounded-md p-2 text-green-500 transition-colors hover:bg-gray-100"
              disabled={true}
            >
              <BugPlay className="h-5 w-5" />
            </button>
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
              <Popover text="Currently in development mode" upper={false} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
