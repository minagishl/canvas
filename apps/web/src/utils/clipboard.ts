import { Point, CanvasObject } from '../types/canvas';
import { convertYouTubeUrlToEmbed } from './embed';
import { copyObject } from './object';
import { getCanvasPoint } from './canvas';

export const handlePaste = (
  width: number,
  height: number,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  offset: Point,
  scale: number,
  addObject: (object: CanvasObject) => void,
  setSelectedObjectId: (value: React.SetStateAction<string | null>) => void,
  objects: CanvasObject[],
  copyObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void
) => {
  const clipboard = navigator.clipboard;

  if (clipboard && clipboard.readText) {
    clipboard.readText().then((data) => {
      try {
        if (/^[^{].*/.test(data)) {
          const position = getCanvasPoint(
            {
              clientX: width / 2,
              clientY: height / 2,
            } as React.MouseEvent,
            canvasRef,
            offset,
            scale
          );

          const id = Math.random().toString(36).slice(2, 11);

          let object: CanvasObject | null = null;
          const embedUrl = convertYouTubeUrlToEmbed(data);

          if (embedUrl !== null) {
            object = {
              id,
              type: 'embed',
              position,
              width: 400,
              height: 225,
              fill: 'transparent',
              embedUrl,
            };
          } else {
            object = {
              id,
              type: 'text',
              text: data,
              position,
              width: 200,
              height: 50,
              fill: '#4f46e5',
              weight: 400,
            };
          }

          addObject(object);
          setSelectedObjectId(id);
          return;
        } else if (copyObjectId) {
          copyObject(objects, copyObjectId, setObjects, setSelectedObjectId);
        }
      } catch (error) {
        console.error('Error pasting object:', error);
      }
    });
  }
};

export const handleCopy = async (value: string): Promise<void> => {
  const clipboard = navigator.clipboard;

  if (clipboard && clipboard.writeText) {
    await clipboard.writeText(value);
  }
};
