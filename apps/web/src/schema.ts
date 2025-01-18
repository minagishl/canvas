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
  weight: v.optional(v.number()),
  points: v.optional(v.array(PointSchema)),
  embedUrl: v.optional(v.string()),
  src: v.optional(v.string()),
});

export const CanvasDataSchema = v.object({
  content: v.array(CanvasObjectSchema),
});
