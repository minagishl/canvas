import { Point, CanvasObject } from '~/types/canvas';
import { convertYouTubeUrlToEmbed } from './embed';
import { copyObject } from './object';
import { getCanvasPoint } from './canvas';
import { handleFileChange } from './image';
import { HistoryState } from '~/types/history';
import { generateRandomId } from './generate';

export const handlePaste = async (
  width: number,
  height: number,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  offset: Point,
  scale: number,
  addObject: (object: CanvasObject) => void,
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>,
  objects: CanvasObject[],
  copyObjectIds: string[],
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>,
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
        });
      }
    }

    // If no image is found, perform existing text paste process
    const text = await navigator.clipboard.readText();
    if (text && /^[^{].*/.test(text)) {
      // Processing of existing text and YouTube URLs
      handleTextPaste(text, position, addObject, setSelectedObjectIds);
    } else if (copyObjectIds.length > 0) {
      copyObject(
        objects,
        copyObjectIds,
        setObjects,
        setSelectedObjectIds,
        setHistory,
        setCurrentHistoryIndex,
        currentHistoryIndex
      );
    }
  } catch (error) {
    console.error('Error pasting:', error);
  }
};

const handleTextPaste = (
  text: string,
  position: Point,
  addObject: (object: CanvasObject) => void,
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const id = generateRandomId();
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

  setSelectedObjectIds([id]);
};

export const handleCopy = async (value: string): Promise<void> => {
  const clipboard = navigator.clipboard;

  if (clipboard && clipboard.writeText) {
    await clipboard.writeText(value);
  }
};
