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
import { exportCanvasAsImage } from '~/utils/canvas';
import { tv } from 'tailwind-variants';
import { type ToolType } from '~/types/canvas';

const button = tv({
  base: 'cursor-pointer rounded-sm p-2.5 transition-colors hover:bg-gray-100',
  variants: {
    isSelected: {
      true: 'bg-indigo-100 text-indigo-600',
    },
  },
});

export function Menu({ handleShareCanvas }: { handleShareCanvas: () => void }) {
  const {
    selectedTool,
    setSelectedTool,
    setSelectedObjectId,
    setObjects,
    objects,
  } = useCanvasContext();
  const { setAlert } = useAlertContext();

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
    exportCanvasAsImage(objects, setSelectedObjectId, setAlert);
  };

  const handleClearCanvas = () => {
    setObjects([]);
    setSelectedObjectId(null);
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
    <div
      className="animate-fade animate-duration-300 animate-once shadow-base absolute top-2 left-1/2 mt-2 flex -translate-x-1/2 items-center justify-center gap-2 rounded-lg bg-white p-1.5"
      role="menu"
    >
      <button
        className={button({ isSelected: selectedTool === 'pen' })}
        onClick={() => {
          handleToolSelect('pen');
        }}
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        className={button({ isSelected: selectedTool === 'arrow' })}
        onClick={() => {
          handleToolSelect('arrow');
        }}
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
            >
              <Film className="h-5 w-5" />
            </button>
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
              <Popover text="Add random GIF" upper={false} />
            </div>
          </div>
        )}
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <div className="group/menu relative">
        <button
          className={button({ isSelected: selectedTool === 'save' })}
          onClick={handleSaveImage}
        >
          <ImageDown className="h-5 w-5" />
        </button>
        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Export as image" upper={false} command="E" />
        </div>
      </div>
      {import.meta.env.VITE_API_URL && (
        <div className="group/menu relative">
          <button className={button()} onClick={handleShareCanvas}>
            <Share className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover text="Share canvas" upper={false} command="S" />
          </div>
        </div>
      )}
      {import.meta.env.VITE_ENABLED_PRESENTATION === 'true' && (
        <div className="group/menu relative">
          <button
            className={button({ isSelected: selectedTool === 'presentation' })}
            onClick={handleStartPresentation}
          >
            <Presentation className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover text="Start presentation" upper={false} />
          </div>
        </div>
      )}
      <div className="group/menu relative">
        <button className={button()} onClick={handleClearCanvas}>
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Delete all objects" upper={false} />
        </div>
      </div>
    </div>
  );
}
