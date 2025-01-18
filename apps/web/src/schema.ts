import { z } from 'zod';
import { ObjectTypes, CanvasObject } from './types/canvas';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const CanvasObjectSchema = z.object({
  id: z.string(),
  type: z.enum(ObjectTypes),
  position: PointSchema,
  width: z.number(),
  height: z.number(),
  fill: z.string().optional(),
  text: z.string().optional(),
  weight: z.number().optional(),
  points: z.array(PointSchema).optional(),
  embedUrl: z.string().optional(),
  src: z.string().optional(),
});

export const CanvasDataSchema = z.object({
  content: z.array(CanvasObjectSchema) as z.ZodType<CanvasObject[]>,
});
