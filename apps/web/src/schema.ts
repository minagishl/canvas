import * as v from 'valibot';
import { ObjectTypes } from './types/canvas';

export const PointSchema = v.object({
  x: v.number(),
  y: v.number(),
});

export const CanvasObjectSchema = v.object({
  id: v.string(),
  type: v.picklist(ObjectTypes),
  position: PointSchema,
  width: v.number(),
  height: v.number(),
  fill: v.optional(v.string()),
  text: v.optional(v.string()),
  imageData: v.optional(v.string()),
  weight: v.optional(
    v.enum({
      100: 100,
      200: 200,
      300: 300,
      400: 400,
      500: 500,
      600: 600,
      700: 700,
      800: 800,
      900: 900,
    })
  ),
  fontSize: v.optional(
    v.enum({
      12: 12,
      14: 14,
      16: 16,
      18: 18,
      20: 20,
      24: 24,
      30: 30,
      36: 36,
      48: 48,
      60: 60,
      72: 72,
      96: 96,
      128: 128,
    })
  ),
  locked: v.optional(v.boolean()),
  points: v.optional(v.array(PointSchema)),
  lineWidth: v.optional(v.number()),
  italic: v.optional(v.boolean()),
  rotation: v.optional(v.number()),
  originalUrl: v.optional(v.string()),
  circle: v.optional(v.boolean()),
  spoiler: v.optional(v.boolean()),
  embedUrl: v.optional(v.string()),
});

export const CanvasDataSchema = v.object({
  content: v.array(CanvasObjectSchema),
});

export const CanvasAIDaraSchema = v.array(CanvasObjectSchema);
