import { CanvasObject, Point, ToolType } from "../types/canvas";

export const createPreviewObject = (
  tool: ToolType,
  startPoint: Point,
  endPoint: Point,
  isShiftPressed: boolean
): CanvasObject => {
  let width = Math.abs(endPoint.x - startPoint.x);
  let height = Math.abs(endPoint.y - startPoint.y);

  if (isShiftPressed) {
    if (tool === "rectangle") {
      const size = Math.min(width, height);
      width = size;
      height = size;
    } else if (tool === "circle") {
      const diameter = Math.min(width, height);
      width = diameter;
      height = diameter;
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: tool === "text" ? "text" : tool === "circle" ? "circle" : "rectangle",
    position: {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y),
    },
    width,
    height,
    fill: "#4f46e5",
    text: tool === "text" ? "Select to edit" : undefined,
    weight: 400,
  };
};
