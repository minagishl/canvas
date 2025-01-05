export type Point = {
  x: number;
  y: number;
};

export type LinePoint = {
  x: number;
  y: number;
};

export type CanvasObject = {
  id: string;
  type: "rectangle" | "circle" | "text" | "image" | "line";
  position: Point;
  width: number;
  height: number;
  fill: string;
  text?: string;
  imageData?: string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontSize?: number;
  locked?: boolean;
  points?: LinePoint[];
  lineWidth?: number;
};

export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "text"
  | "image"
  | "pen"
  | "save";

export type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | null;
