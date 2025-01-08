import {
  Pencil,
  ImageDown,
  Trash2,
  Share,
  MoveUpRight,
  Film,
} from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import html2canvas from 'html2canvas';
import { Popover } from './Popover';
import { showTemporaryAlert } from '../utils/alert';
import { useAlertContext } from '../contexts/AlertContext';

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
    // Deselect the object
    setSelectedObjectId(null);

    if (objects.length === 0) {
      showTemporaryAlert('Canvas is empty!', setAlert);
      return;
    }

    setTimeout(async () => {
      try {
        // Get the canvas container
        const canvasContainer = document.querySelector(
          '#root > div > div:first-child'
        );

        if (!canvasContainer) {
          throw new Error('Canvas container not found');
        }

        // Create a screenshot with html2canvas
        const canvas = await html2canvas(canvasContainer as HTMLElement, {
          backgroundColor: '#f9fafb',
          scale: window.devicePixelRatio,
          useCORS: true,
        });

        // Convert to Blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, 'image/png');
        });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${new Date().toISOString().slice(0, -5)}.png`;

        // Download the image
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the URL
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }, 100);
  };

  const handleClearCanvas = () => {
    setObjects([]);
    setSelectedObjectId(null);
  };

  return (
    <div className="animate-fade animate-duration-300 animate-once absolute left-1/2 top-2 mt-2 flex -translate-x-1/2 items-center justify-center gap-2 rounded-md bg-white p-2 shadow-md">
      <button
        className={`cursor-pointer rounded-md p-2 transition-colors ${
          selectedTool === 'pen'
            ? 'bg-indigo-100 text-indigo-600'
            : 'hover:bg-gray-100'
        }`}
        onClick={() => {
          setSelectedTool('pen');
        }}
        title="Pen"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        className={`cursor-pointer rounded-md p-2 transition-colors ${
          selectedTool === 'arrow'
            ? 'bg-indigo-100 text-indigo-600'
            : 'hover:bg-gray-100'
        }`}
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
              className={`cursor-pointer rounded-md p-2 transition-colors ${
                selectedTool === 'gif'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'hover:bg-gray-100'
              }`}
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
          className={`cursor-pointer rounded-md p-2 transition-colors ${
            selectedTool === 'save'
              ? 'bg-indigo-100 text-indigo-600'
              : 'hover:bg-gray-100'
          }`}
          onClick={handleSaveImage}
        >
          <ImageDown className="h-5 w-5" />
        </button>
        <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Save image" upper={false} />
        </div>
      </div>
      {import.meta.env.VITE_API_URL && (
        <div className="group/menu relative">
          <button
            className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
            onClick={handleShareCanvas}
          >
            <Share className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
            <Popover text="Share canvas" upper={false} />
          </div>
        </div>
      )}
      <div className="group/menu relative">
        <button
          className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
          onClick={handleClearCanvas}
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover/menu:block">
          <Popover text="Delete all objects" upper={false} />
        </div>
      </div>
    </div>
  );
}
