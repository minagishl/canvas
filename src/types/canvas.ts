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
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

export type ToolType = "select" | "rectangle" | "circle" | "text" | "image";
