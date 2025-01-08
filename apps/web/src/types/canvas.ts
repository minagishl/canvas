export type Point = {
  x: number;
  y: number;
};

export type LinePoint = {
  x: number;
  y: number;
};

export type fontSize = 12 | 14 | 16 | 18 | 20 | 24 | 30 | 36;

export type CanvasObject = {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'arrow';
  position: Point;
  width: number;
  height: number;
  fill: string;
  text?: string;
  imageData?: string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontSize?: fontSize;
  locked?: boolean;
  points?: LinePoint[];
  lineWidth?: number;
  italic?: boolean;
  rotation?: number;
  originalUrl?: string;
};

export type ToolType =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'image'
  | 'pen'
  | 'save'
  | 'arrow'
  | 'gif';

export type ResizeHandle =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null;
