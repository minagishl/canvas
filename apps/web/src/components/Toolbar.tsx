import React, { useRef } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
} from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { ToolType } from '../types/canvas';
import { isMobile } from 'react-device-detect';
import { Popover } from './Popover';
import { Menu } from './Menu';
import { Loading } from './Loading';
import { showTemporaryAlert } from '../utils/alert';
import { useAlertContext } from '../contexts/AlertContext';

const tools: {
  icon: typeof MousePointer2;
  name: ToolType;
  disabled: boolean;
}[] = [
  { icon: MousePointer2, name: 'select', disabled: false },
  { icon: Square, name: 'rectangle', disabled: false },
  { icon: Circle, name: 'circle', disabled: false },
  { icon: Type, name: 'text', disabled: false },
  { icon: ImageIcon, name: 'image', disabled: false },
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

  const handleShareCanvas = () => {
    setIsLoading(true);

    // Check if canvas is empty
    if (objects.length === 0) {
      showTemporaryAlert('Canvas is empty!', setAlert);
      setIsLoading(false);
      return;
    }

    // Must be completed
    setSelectedObjectId('');

    setTimeout(() => {
      const apiUrl = new URL(import.meta.env.VITE_API_URL);
      fetch(`${apiUrl.href}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objects),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Error sharing canvas');
          }
        })
        .then((data) => {
          const id = data.id;
          const url = new URL(window.location.href);
          url.searchParams.set('id', id);
          navigator.clipboard.writeText(url.toString());
          console.log('Canvas shared:', url.toString());
          showTemporaryAlert(
            'Canvas shared! URL copied to clipboard',
            setAlert
          );
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error sharing canvas:', error);
          showTemporaryAlert('Error sharing canvas', setAlert);
          setIsLoading(false);
        });
    }, 500);
  };

  return (
    <>
      <Loading hidden={!isLoading} />
      <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 select-none items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
        {tools
          .filter((Tool) => !isMobile || Tool.name === 'select')
          .map((Tool) => (
            <div key={Tool.name} className="group relative">
              <button
                className={`cursor-pointer rounded-md p-2 transition-colors ${
                  selectedTool === Tool.name
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'hover:bg-gray-100'
                } ${Tool.disabled && 'opacity-50'}`}
                onClick={() => {
                  if (!Tool.disabled) {
                    setSelectedTool(Tool.name);
                  }
                }}
              >
                <Tool.icon className="h-5 w-5" />
              </button>
              {Tool.disabled && (
                <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
                  <Popover text={`${Tool.name} is disabled`} upper={false} />
                </div>
              )}
            </div>
          ))}
        {!isMobile && (
          <div className="group relative">
            <button
              key="more"
              className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <div className="absolute left-1/2 hidden h-8 w-16 -translate-x-1/2 group-hover:block" />
            <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 group-hover:block">
              <Menu handleShareCanvas={handleShareCanvas} />
            </div>
          </div>
        )}
        <div className="mx-2 h-6 w-px bg-gray-200" />
        <div className="group relative">
          <button
            onClick={handleZoomOut}
            className="rounded-md p-2 transition-colors hover:bg-gray-100"
            disabled={isZooming || scale <= 0.7}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Zoom out" upper={false} />
          </div>
        </div>
        <div className="group relative">
          <button
            onClick={handleZoomIn}
            className="rounded-md p-2 transition-colors hover:bg-gray-100"
            disabled={isZooming || scale >= 2}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Zoom in" upper={false} />
          </div>
        </div>
      </div>
    </>
  );
}
