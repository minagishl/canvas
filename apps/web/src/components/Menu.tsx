import {
  Pencil,
  ImageDown,
  Trash2,
  Share,
  MoveUpRight,
  Film,
  Presentation,
} from 'lucide-react';
import { useCanvasContext } from '~/contexts/CanvasContext';
import { Popover } from './Popover';
import { useAlertContext } from '~/contexts/AlertContext';
import { getInitialLanguage, translate } from '~/store/language';
import { useState } from 'react';
import type { Language } from '~/store/language';
import { exportCanvasAsImage } from '~/utils/canvas';
import { type ToolType } from '~/types/canvas';
import { button, menu } from '~/variants';

export function Menu({ handleShareCanvas }: { handleShareCanvas: () => void }) {
  const {
    selectedTool,
    setSelectedTool,
    setSelectedObjectIds,
    setObjects,
    objects,
  } = useCanvasContext();
  const { setAlert } = useAlertContext();
  const [currentLang] = useState<Language>(getInitialLanguage());

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool);
    if (window.gtag) {
      window.gtag('event', 'select_tool', {
        tool_type: tool,
        event_category: 'canvas',
      });
    }
  };

  const handleSaveImage = async () => {
    exportCanvasAsImage(objects, setSelectedObjectIds, setAlert);
  };

  const handleClearCanvas = () => {
    setObjects([]);
    setSelectedObjectIds([]);
  };

  const handleStartPresentation = () => {
    setSelectedTool('presentation');

    // Full screen
    const body = document.querySelector('body');
    if (body) {
      body.requestFullscreen();
      body.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          setSelectedTool('select');
        }
      });
    }

    if (window.gtag) {
      window.gtag('event', 'start_presentation', {
        event_category: 'canvas',
      });
    }
  };

  return (
    <div className={menu()} role="menu">
      <button
        className={button({ isSelected: selectedTool === 'pen' })}
        onClick={() => {
          handleToolSelect('pen');
        }}
        aria-label={String(translate('pen', currentLang))}
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        className={button({ isSelected: selectedTool === 'arrow' })}
        onClick={() => {
          handleToolSelect('arrow');
        }}
        aria-label={String(translate('arrow', currentLang))}
      >
        <MoveUpRight className="h-5 w-5" />
      </button>
      {import.meta.env.VITE_API_URL &&
        import.meta.env.VITE_ENABLED_GIF === 'true' && (
          <div className="group/menu relative">
            <button
              className={button({ isSelected: selectedTool === 'gif' })}
              onClick={() => {
                handleToolSelect('gif');
              }}
              aria-label={String(translate('gif', currentLang))}
            >
              <Film className="h-5 w-5" />
            </button>
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
              <Popover
                text={String(translate('addRandomGIF', currentLang))}
                upper={false}
              />
            </div>
          </div>
        )}
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <div className="group/menu relative">
        <button
          className={button({ isSelected: selectedTool === 'save' })}
          onClick={handleSaveImage}
          aria-label={String(translate('exportImage', currentLang))}
        >
          <ImageDown className="h-5 w-5" />
        </button>
        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover
            text={String(translate('exportImage', currentLang))}
            upper={false}
            command="E"
          />
        </div>
      </div>
      {import.meta.env.VITE_API_URL && (
        <div className="group/menu relative">
          <button
            className={button()}
            onClick={handleShareCanvas}
            aria-label={String(translate('shareCanvas', currentLang))}
          >
            <Share className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover
              text={String(translate('shareCanvas', currentLang))}
              upper={false}
              command="S"
            />
          </div>
        </div>
      )}
      {import.meta.env.VITE_ENABLED_PRESENTATION === 'true' && (
        <div className="group/menu relative">
          <button
            className={button({ isSelected: selectedTool === 'presentation' })}
            onClick={handleStartPresentation}
            aria-label={String(translate('startPresentation', currentLang))}
          >
            <Presentation className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover
              text={String(translate('startPresentation', currentLang))}
              upper={false}
            />
          </div>
        </div>
      )}
      <div className="group/menu relative">
        <button
          className={button()}
          onClick={handleClearCanvas}
          aria-label={String(translate('deleteAllObjects', currentLang))}
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover
            text={String(translate('deleteAllObjects', currentLang))}
            upper={false}
          />
        </div>
      </div>
    </div>
  );
}
