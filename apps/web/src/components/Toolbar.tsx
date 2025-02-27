import React, { useRef, useCallback, useEffect, useState } from 'react';
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
  Presentation,
} from 'lucide-react';
import { useCanvasContext } from '~/contexts/CanvasContext';
import { ToolType } from '~/types/canvas';
import { isMobile } from '~/utils/device';
import { Popover } from './Popover';
import { Menu } from './Menu';
import { Loading } from './Loading';
import { shareCanvasAsURL } from '~/utils/canvas';
import { useAlertContext } from '~/contexts/AlertContext';
import { useHistoryContext } from '~/contexts/HistoryContext';
import { useAIContext } from '~/contexts/AIContext';
import { Sparkles } from './Sparkles';
import { button, container, frame } from '~/variants';
import { getInitialLanguage, translate } from '~/store/language';
import type { Language } from '~/store/language';

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
    setSelectedObjectIds,
  } = useCanvasContext();
  const { history } = useHistoryContext();
  const { setAlert } = useAlertContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isZooming, setIsZooming] = React.useState(false);
  const animationRef = useRef<number | null>(null);
  const [currentLang] = useState<Language>(getInitialLanguage());

  // Debug
  const [popoverText, setPopoverText] = React.useState('');
  const popoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hiddedDevIcon, setHiddedDevIcon] = React.useState(false);

  // Joke
  const [, setKeyUp] = React.useState<string[]>([]);
  const [rotation, setRotation] = React.useState(false);

  // AI
  const { showAIInput, setShowAIInput } = useAIContext();

  const konamiCommand = React.useMemo(
    () => [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ],
    []
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeyUp((prev) => {
        const updated = [...prev, e.key];

        // Limit the length of the command
        if (updated.length > konamiCommand.length) {
          updated.shift();
        }

        // Start rotation animation if the command matches
        if (updated.join('') === konamiCommand.join('') && !rotation) {
          setRotation(true);
          // Stop the animation after one rotation
          setTimeout(() => {
            setRotation(false);
          }, 1000);
          return [];
        }
        return updated;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [konamiCommand, rotation]);

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
    shareCanvasAsURL(objects, setIsLoading, setSelectedObjectIds, setAlert);
  }, [objects, setIsLoading, setSelectedObjectIds, setAlert]);

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
  const isPresentation = selectedTool === 'presentation';

  const showPopoverMessage = useCallback((message: string) => {
    // Clear the existing timer
    if (popoverTimerRef.current) {
      clearTimeout(popoverTimerRef.current);
    }

    setPopoverText(message);

    // Set a new timer
    popoverTimerRef.current = setTimeout(() => {
      setPopoverText('');
    }, 2000);
  }, []);

  useEffect(() => {
    if (!isDevMode || hiddedDevIcon) return;

    if (history.length > 0) {
      const latestAction = history[history.length - 1];

      // If the action is to add an object
      if (latestAction.type === 'create') {
        const objectType =
          latestAction.objects[latestAction.objects.length - 1].type;
        showPopoverMessage(`The object "${objectType}" has been created.`);
      }

      // if the action is to delete an object
      if (latestAction.type === 'delete') {
        showPopoverMessage('The object has been deleted.');
      }

      // if the action is to copy an object
      if (latestAction.type === 'copy') {
        showPopoverMessage('The object has been copied.');
      }
    }

    // Clean up
    return () => {
      if (popoverTimerRef.current) {
        clearTimeout(popoverTimerRef.current);
      }
    };
  }, [hiddedDevIcon, history, isDevMode, showPopoverMessage]);

  const handleAIClick = () => {
    setShowAIInput(!showAIInput);
  };

  return (
    <>
      <Loading hidden={!isLoading} />
      <div className={container({ top: true })}>
        <div className={frame()}>
          {tools
            .filter(
              (Tool) =>
                (!isMobile || Tool.name === 'select') &&
                (!isPresentation || Tool.name === 'select')
            )
            .map((Tool) => (
              <div key={Tool.name} className="group relative">
                <button
                  id={`toolbar-${Tool.name}`}
                  className={button({
                    isSelected:
                      (!showAIInput && selectedTool === Tool.name) ||
                      (isPresentation &&
                        !showAIInput &&
                        Tool.name === 'select'),
                  })}
                  onClick={() => handleToolSelect(Tool.name)}
                  onKeyDown={handleOnKeyDown}
                  aria-label={String(translate(Tool.name, currentLang))}
                >
                  <Tool.icon className="h-5 w-5" />
                </button>
              </div>
            ))}
          {!isMobile && !isPresentation && (
            <div className="group relative" data-testid="more">
              <button
                key="more"
                className={button()}
                aria-label={String(translate('more', currentLang))}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <div className="absolute left-1/2 hidden h-8 w-24 -translate-x-1/2 group-hover:block" />
              <div className="absolute top-full left-1/2 hidden -translate-x-1/2 pt-3 group-hover:block">
                <Menu handleShareCanvas={handleShareCanvas} />
              </div>
            </div>
          )}

          {!isMobile && isPresentation && (
            <div className="group/menu relative">
              <button
                className={button()}
                onClick={() => {
                  handleToolSelect('select');
                }}
                aria-label={String(translate('stopPresentation', currentLang))}
              >
                <Presentation className="h-5 w-5" />
              </button>
              <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
                <Popover
                  text={String(translate('stopPresentation', currentLang))}
                  upper={false}
                />
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
              aria-label={String(translate('zoomOut', currentLang))}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
              <Popover
                text={String(translate('zoomOut', currentLang))}
                upper={false}
              />
            </div>
          </div>
          <div className="group relative">
            <button
              onClick={handleZoomIn}
              className={button()}
              disabled={isZooming || scale >= 2}
              aria-label={String(translate('zoomIn', currentLang))}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
              <Popover
                text={String(translate('zoomIn', currentLang))}
                upper={false}
              />
            </div>
          </div>
          {isDevMode && !hiddedDevIcon && (
            <div
              className="relative"
              onDoubleClick={() => setHiddedDevIcon(true)}
            >
              <div
                className={button({
                  className: 'cursor-default text-green-500',
                })}
              >
                <BugPlay
                  className={`h-5 w-5 ${
                    rotation
                      ? 'animate-once animate-duration-700 animate-ease-out animate-spin'
                      : ''
                  }`}
                />
              </div>
              <div className="absolute top-full left-1/2 mt-2 block -translate-x-1/2">
                {popoverText !== '' && (
                  <Popover text={popoverText} upper={false} triangle={true} />
                )}
              </div>
            </div>
          )}
        </div>

        {import.meta.env.VITE_ENABLED_AI === 'true' &&
          !isMobile &&
          !isPresentation && (
            <div className={frame({ className: 'group relative ml-2' })}>
              <button
                key="more"
                className={button({ isSelected: showAIInput })}
                onClick={handleAIClick}
                aria-label={String(translate('askAI', currentLang))}
              >
                <Sparkles isAnimating={showAIInput} />
              </button>
              <div className="absolute top-full left-1/2 hidden -translate-x-1/2 group-hover:block">
                <Popover
                  text={String(translate('askAI', currentLang))}
                  upper={false}
                />
              </div>
            </div>
          )}
      </div>
    </>
  );
}
