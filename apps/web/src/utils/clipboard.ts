import { Point, CanvasObject } from '~/types/canvas';
import { convertYouTubeUrlToEmbed } from './embed';
import { copyObject } from './object';
import { getCanvasPoint } from './canvas';
import { handleFileChange } from './image';
import { HistoryState } from '~/types/history';

export const handlePaste = async (
  width: number,
  height: number,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  offset: Point,
  scale: number,
  addObject: (object: CanvasObject) => void,
  setSelectedObjectId: (value: React.SetStateAction<string | null>) => void,
  objects: CanvasObject[],
  copyObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
) => {
  try {
    // Retrieve items from the clipboard
    const items = await navigator.clipboard.read();
    const position = getCanvasPoint(
      {
        clientX: width / 2,
        clientY: height / 2,
      } as React.MouseEvent,
      canvasRef,
      offset,
      scale
    );

    for (const item of items) {
      // Check image type
      if (
        item.types.includes('image/png') ||
        item.types.includes('image/jpeg') ||
        item.types.includes('image/gif')
      ) {
        const blob = await item.getType(
          item.types.find((type) => type.startsWith('image/'))!
        );
        handleFileChange({
          file: new File([blob], 'image', { type: blob.type }),
          imagePosition: position,
          setImageCache: () => {},
          setImagePosition: () => {},
          setSelectedTool: () => {},
          setAlert: () => {},
          setObjects,
          setHistory,
          setCurrentHistoryIndex,
          currentHistoryIndex,
        });
      }
    }

    // If no image is found, perform existing text paste process
    const text = await navigator.clipboard.readText();
    if (text && /^[^{].*/.test(text)) {
      // Processing of existing text and YouTube URLs
      handleTextPaste(text, position, addObject, setSelectedObjectId);
    } else if (copyObjectId) {
      copyObject(objects, copyObjectId, setObjects, setSelectedObjectId);
    }
  } catch (error) {
    console.error('Error pasting:', error);
  }
};

const handleTextPaste = (
  text: string,
  position: Point,
  addObject: (object: CanvasObject) => void,
  setSelectedObjectId: (value: React.SetStateAction<string | null>) => void
) => {
  const id = Math.random().toString(36).slice(2, 11);
  const embedUrl = convertYouTubeUrlToEmbed(text);

  if (embedUrl !== null) {
    addObject({
      id,
      type: 'embed',
      position,
      width: 400,
      height: 225,
      fill: 'transparent',
      embedUrl,
    });
  } else {
    addObject({
      id,
      type: 'text',
      text,
      position,
      width: 200,
      height: 50,
      fill: '#4f46e5',
      weight: 400,
    });
  }
  setSelectedObjectId(id);
};

export const handleCopy = async (value: string): Promise<void> => {
  const clipboard = navigator.clipboard;

  if (clipboard && clipboard.writeText) {
    await clipboard.writeText(value);
  }
};
