import { Point, CanvasObject } from '../types/canvas';
import { showTemporaryAlert } from './alert';

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
