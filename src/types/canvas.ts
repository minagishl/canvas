export type Point = {
  x: number;
  y: number;
};

export type CanvasObject = {
  id: string;
  type: "rectangle" | "circle" | "text";
  position: Point;
  width: number;
  height: number;
  fill: string;
  text?: string;
};

export type ToolType = "select" | "rectangle" | "circle" | "text" | "image";
