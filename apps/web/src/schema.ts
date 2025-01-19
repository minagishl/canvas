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
  weight: v.optional(v.number()),
  fontSize: v.optional(v.number()),
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
