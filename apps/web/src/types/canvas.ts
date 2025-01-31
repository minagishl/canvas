export type Point = {
  x: number;
  y: number;
};

export type LinePoint = {
  x: number;
  y: number;
};

export type fontSize =
  | 12
  | 14
  | 16
  | 18
  | 20
  | 24
  | 30
  | 36
  | 48
  | 60
  | 72
  | 96
  | 128;

export type fontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const ObjectTypes = [
  'rectangle',
  'circle',
  'text',
  'image',
  'line',
  'arrow',
  'embed',
] as const;

export type ObjectType = (typeof ObjectTypes)[number];

export type CanvasObject = {
  id: string;
  type: ObjectType;
  position: Point;
  width: number;
  height: number;
  fill: string;
  circle?: boolean;
  embedUrl?: string;
  fontSize?: fontSize;
  imageData?: string;
  italic?: boolean;
  lineWidth?: number;
  locked?: boolean;
  originalUrl?: string;
  points?: LinePoint[];
  rotation?: number;
  spoiler?: boolean;
  text?: string;
  weight?: fontWeight;
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
  | 'gif'
  | 'presentation';

export type ResizeHandle =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null;
