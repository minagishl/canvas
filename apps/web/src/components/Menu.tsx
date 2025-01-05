import { Pencil, ImageDown, Trash2, Share } from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import html2canvas from 'html2canvas';

export function Menu() {
  const {
    selectedTool,
    setSelectedTool,
    setSelectedObjectId,
    setObjects,
    objects,
  } = useCanvasContext();

  const handleSaveImage = async () => {
    // Deselect the object
    setSelectedObjectId(null);

    if (objects.length === 0) {
      alert('Canvas is empty!');
      return;
    }

    setTimeout(async () => {
      try {
        // Get the canvas container
        const canvasContainer = document.querySelector(
          '.relative.w-full.h-full'
        );
        if (!canvasContainer) return;

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

  const handleShareCanvas = () => {
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
        const url = `${window.location.href}?id=${id}`;
        navigator.clipboard.writeText(url);
        console.log('Canvas shared:', url);
        alert('Canvas shared! URL copied to clipboard');
      })
      .catch((error) => {
        console.error('Error sharing canvas:', error);
        alert('Error sharing canvas');
      });
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
          selectedTool === 'save'
            ? 'bg-indigo-100 text-indigo-600'
            : 'hover:bg-gray-100'
        }`}
        onClick={handleSaveImage}
        title="Save as image"
      >
        <ImageDown className="h-5 w-5" />
      </button>
      <button
        className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
        onClick={handleShareCanvas}
        title="Share"
      >
        <Share className="h-5 w-5" />
      </button>
      <button
        className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
        onClick={handleClearCanvas}
        title="Clear canvas"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
