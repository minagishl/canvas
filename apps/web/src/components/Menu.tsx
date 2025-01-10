import {
  Pencil,
  ImageDown,
  Trash2,
  Share,
  MoveUpRight,
  Film,
} from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { Popover } from './Popover';
import { useAlertContext } from '../contexts/AlertContext';
import { exportCanvasAsImage } from '../utils/canvas';
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100',
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

  const handleSaveImage = async () => {
    exportCanvasAsImage(objects, setSelectedObjectId, setAlert);
  };

  const handleClearCanvas = () => {
    setObjects([]);
    setSelectedObjectId(null);
  };

  return (
    <div className="animate-fade animate-duration-300 animate-once absolute left-1/2 top-2 mt-2 flex -translate-x-1/2 items-center justify-center gap-2 rounded-md bg-white p-2 shadow-md">
      <button
        className={button({ isSelected: selectedTool === 'pen' })}
        onClick={() => {
          setSelectedTool('pen');
        }}
        title="Pen"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        className={button({ isSelected: selectedTool === 'arrow' })}
        onClick={() => {
          setSelectedTool('arrow');
        }}
      >
        <MoveUpRight className="h-5 w-5" />
      </button>
      {import.meta.env.VITE_API_URL &&
        import.meta.env.VITE_GIF_ENABLED === 'true' && (
          <div className="group/menu relative">
            <button
              className={button({ isSelected: selectedTool === 'gif' })}
              onClick={() => {
                setSelectedTool('gif');
              }}
            >
              <Film className="h-5 w-5" />
            </button>
            <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
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
        <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Export as image" upper={false} command="E" />
        </div>
      </div>
      {import.meta.env.VITE_API_URL && (
        <div className="group/menu relative">
          <button className={button()} onClick={handleShareCanvas}>
            <Share className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover text="Share canvas" upper={false} command="S" />
          </div>
        </div>
      )}
      <div className="group/menu relative">
        <button className={button()} onClick={handleClearCanvas}>
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Delete all objects" upper={false} />
        </div>
      </div>
    </div>
  );
}
