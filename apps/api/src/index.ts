import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { items } from './db/schema';
import { v7 as uuidv7 } from 'uuid';

type Bindings = {
  DB: D1Database;
  TENOR_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const objectTypes = [
  'rectangle',
  'circle',
  'text',
  'image',
  'line',
  'arrow',
  'embed',
] as const;

// Define a list of allowed keys
const allowedKeys = [
  'id',
  'type',
  'position',
  'width',
  'height',
  'fill',
  'circle',
  'embedUrl',
  'fontSize',
  'imageData',
  'italic',
  'lineWidth',
  'locked',
  'originalUrl',
  'points',
  'rotation',
  'spoiler',
  'text',
  'weight',
] as const;

const corsOptions = {
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
};

app.use('/*', cors(corsOptions));

// Validation functions
const validators = {
  checkId(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    );
  },

  checkPosition(position: any): boolean {
    return (
      position &&
      typeof position.x === 'number' &&
      typeof position.y === 'number'
    );
  },

  checkDimensions(width: any, height: any): boolean {
    return typeof width === 'number' && typeof height === 'number';
  },

  checkWeight(weight: any): boolean {
    if (weight === undefined) return true;
    return [100, 200, 300, 400, 500, 600, 700, 800, 900].includes(weight);
  },

  checkTypeFields(obj: any, type: string, field: string): boolean {
    if (obj[field] === undefined) return true;

    const typeValidations: Record<string, (value: any) => boolean> = {
      string: (value) => typeof value === 'string',
      number: (value) => typeof value === 'number',
      boolean: (value) => typeof value === 'boolean',
      array: (value) => Array.isArray(value),
    };

    const fieldTypes: Record<string, string> = {
      circle: 'boolean',
      embedUrl: 'string',
      fontSize: 'number',
      imageData: 'string',
      italic: 'boolean',
      lineWidth: 'number',
      locked: 'boolean',
      originalUrl: 'string',
      points: 'array',
      rotation: 'number',
      spoiler: 'boolean',
      text: 'string',
    };

    return typeValidations[fieldTypes[field]]?.(obj[field]) ?? false;
  },
};

// Function to delete invalid keys
function sanitizeObject(obj: any): any {
  const sanitized: any = {};
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}

// Object validation
function validateObject(obj: any): {
  isValid: boolean;
  error?: string;
  sanitizedObject?: any;
} {
  if (!obj.id) {
    return { isValid: false, error: 'invalid id' };
  }

  if (!objectTypes.includes(obj.type)) {
    return { isValid: false, error: 'invalid type' };
  }

  if (!validators.checkPosition(obj.position)) {
    return { isValid: false, error: 'invalid position' };
  }

  if (!validators.checkDimensions(obj.width, obj.height)) {
    return { isValid: false, error: 'invalid dimensions' };
  }

  if (typeof obj.fill !== 'string') {
    return { isValid: false, error: 'invalid fill' };
  }

  // Type check for each field
  const fieldsToValidate = [
    'text',
    'imageData',
    'fontSize',
    'lineWidth',
    'locked',
    'italic',
    'rotation',
    'circle',
    'spoiler',
    'points',
    'embedUrl',
    'originalUrl',
  ];

  for (const field of fieldsToValidate) {
    if (!validators.checkTypeFields(obj, obj.type, field)) {
      return { isValid: false, error: `invalid ${field}` };
    }
  }

  if (!validators.checkWeight(obj.weight)) {
    return { isValid: false, error: 'invalid weight' };
  }

  // If validation succeeds, return sanitizedObject
  return { isValid: true, sanitizedObject: sanitizeObject(obj) };
}

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

interface TenorResponse {
  results: Array<any>;
}

app.get('/gif', async (c) => {
  const response = await fetch(
    `https://tenor.googleapis.com/v2/search?q=random&key=${c.env.TENOR_API_KEY}&limit=1&random=true`
  );
  const data = (await response.json()) as TenorResponse;
  if (!data) {
    return c.json({ error: 'no gifs found' }, 404);
  }

  return c.json(data);
});

app.post('/', async (c) => {
  const bodies = await c.req.json();

  if (!Array.isArray(bodies)) {
    return c.json({ error: 'request body must be an array' }, 400);
  }

  if (bodies.length === 0) {
    return c.json({ error: 'request body must not be empty' }, 400);
  }

  const sanitizedBodies = [];
  for (const body of bodies) {
    const validation = validateObject(body);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }
    sanitizedBodies.push(validation.sanitizedObject);
  }

  const id = uuidv7();
  const db = drizzle(c.env.DB);
  await db.insert(items).values({
    id,
    content: sanitizedBodies, // Store sanitized data
    createdAt: new Date().toISOString(),
  });

  return c.json({ message: 'success', id }, 201);
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'id is required' }, 400);
  }

  // Check UUID v7
  if (!validators.checkId(id)) {
    return c.json({ error: 'invalid id' }, 400);
  }

  const db = drizzle(c.env.DB);

  // Get the corresponding item from the database
  const result = await db.select().from(items).where(eq(items.id, id)).get();

  if (!result) {
    return c.json({ error: 'item not found' }, 404);
  }

  return c.json(result);
});

export default app;
