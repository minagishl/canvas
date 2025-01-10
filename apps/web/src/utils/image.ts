import { Point } from '../types/canvas';
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
