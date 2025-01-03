import { CanvasObject, Point, ToolType } from "../types/canvas";

export const createPreviewObject = (
  tool: ToolType,
  startPoint: Point,
  endPoint: Point
): CanvasObject => {
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

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
    text: tool === "text" ? "Double click to edit" : undefined,
  };
};
