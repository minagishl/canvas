import { Point, CanvasObject } from '~/types/canvas';
import { showTemporaryAlert, hiddenAlert } from './alert';
import { type ToolType } from '~/types/canvas';
import { handleAddObject } from './history';
import { type HistoryState } from '~/types/history';

export const fetchRandomGif = async (
  imagePosition: Point | null,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  setImagePosition: (position: Point | null) => void,
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolType>>,
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>
): Promise<void> => {
  try {
    const gifUrl = await randomGif(imagePosition, setAlert);
    const img = await loadImage(gifUrl);

    const maxSize = 500;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;

    if (!imagePosition) return;

    // Check if the URL is from Tenor
    const originalUrl = new URL(gifUrl);
    if (originalUrl.origin !== 'https://media.tenor.com') {
      showTemporaryAlert('Invalid GIF URL', setAlert);
      throw new Error('Invalid GIF URL');
    }

    const gifObject: CanvasObject = {
      id: Math.random().toString(36).slice(2, 11),
      type: 'image',
      position: imagePosition,
      width,
      height,
      fill: 'transparent',
      originalUrl: gifUrl,
    };

    handleAddObject(gifObject, setObjects, setHistory, setCurrentHistoryIndex);

    setImagePosition(null);
    setSelectedTool('select');
    hiddenAlert(setAlert);
    showTemporaryAlert('GIF added successfully', setAlert);
  } catch (error) {
    console.error('Error fetching GIF:', error);
    hiddenAlert(setAlert);
    showTemporaryAlert(
      error instanceof Error ? error.message : 'Failed to fetch GIF',
      setAlert
    );
    setSelectedTool('select');
  }
};

export const randomGif = async (
  imagePosition: Point | null,
  setAlert: React.Dispatch<React.SetStateAction<string>>
): Promise<string> => {
  try {
    if (!imagePosition) {
      throw new Error('Image position not set');
    }

    showTemporaryAlert('Fetching GIF...', setAlert);

    const apiUrl = new URL(import.meta.env.VITE_API_URL);
    const response = await fetch(`${apiUrl}gif`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.results[0].media_formats.gif.url;
  } catch (error) {
    console.error('Error fetching GIF:', error);
    throw error;
  }
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const imageToggleCircle = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void => {
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (selectedObject && selectedObject.type === 'image') {
    const newObjects = objects.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            circle: !selectedObject.circle,
          }
        : obj
    );
    setObjects(newObjects);
  }
};

export const imageToggleSpoiler = (
  objects: CanvasObject[],
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
): void => {
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (selectedObject && selectedObject.type === 'image') {
    const newObjects = objects.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            spoiler: !selectedObject.spoiler,
          }
        : obj
    );
    setObjects(newObjects);
  }
};

interface HandleFileChangeProps {
  file: File | undefined;
  imagePosition: Point | null;
  setImageCache: (
    value: React.SetStateAction<{ [key: string]: string }>
  ) => void;
  setImagePosition: (value: React.SetStateAction<Point | null>) => void;
  setSelectedTool: (value: React.SetStateAction<ToolType>) => void;
  setAlert: (value: React.SetStateAction<string>) => void;
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const handleFileChange = async ({
  file,
  imagePosition,
  setImageCache,
  setImagePosition,
  setSelectedTool,
  setAlert,
  setObjects,
  setHistory,
  setCurrentHistoryIndex,
}: HandleFileChangeProps): Promise<void> => {
  if (!file || !imagePosition) return;

  if (!file.type.startsWith('image/')) {
    showTemporaryAlert('Please select an image file', setAlert);
    return;
  }

  let imageData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.onload = () => {
    const maxSize = 500;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;

    // For non-GIF images, optimize to WebP
    if (!file.type.includes('gif')) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      imageData = canvas.toDataURL('image/webp');
    }

    const id = Math.random().toString(36).slice(2, 11);
    setImageCache((prev) => ({ ...prev, [id]: imageData }));

    handleAddObject(
      {
        id,
        type: 'image',
        position: imagePosition,
        width,
        height,
        fill: 'transparent',
        imageData,
      },
      setObjects,
      setHistory,
      setCurrentHistoryIndex
    );

    setImagePosition(null);
    setSelectedTool('select');
  };

  img.src = imageData;
};
