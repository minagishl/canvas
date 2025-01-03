export type Point = {
  x: number;
  y: number;
};

export type CanvasObject = {
  id: string;
  type: "rectangle" | "circle" | "text" | "image";
  position: Point;
  width: number;
  height: number;
  fill: string;
  text?: string;
  imageData?: string;
};

export type ToolType = "select" | "rectangle" | "circle" | "text" | "image";
