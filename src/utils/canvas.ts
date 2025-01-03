import { CanvasObject } from "../types/canvas";

export const drawObject = (
  ctx: CanvasRenderingContext2D,
  object: CanvasObject,
  scale: number
) => {
  ctx.fillStyle = object.fill;

  switch (object.type) {
    case "rectangle":
      ctx.fillRect(
        object.position.x,
        object.position.y,
        object.width,
        object.height
      );
      break;
    case "circle":
      ctx.beginPath();
      ctx.ellipse(
        object.position.x + object.width / 2,
        object.position.y + object.height / 2,
        object.width / 2,
        object.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    case "text":
      if (object.text) {
        ctx.font = `${16 * scale}px sans-serif`;
        ctx.fillText(object.text, object.position.x, object.position.y + 16);
      }
      break;
    case "image":
      if (object.imageData) {
        const img = new Image();
        img.src = object.imageData;
        img.onload = () => {
          ctx.drawImage(
            img,
            object.position.x,
            object.position.y,
            object.width,
            object.height
          );
        };
      }
  }
};
