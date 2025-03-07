import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { items } from './db/schema';
import { v7 as uuidv7 } from 'uuid';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

type Bindings = {
  DB: D1Database;
  TENOR_API_KEY: string;
  ALLOWED_ORIGINS: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  TURNSTILE_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const AIObjectTypes = {
  rectangle: 'rectangle',
  circle: 'circle',
  text: 'text',
  line: 'line',
  arrow: 'arrow',
} as const;

const ObjectTypes = {
  ...AIObjectTypes,
  image: 'image',
  embed: 'embed',
} as const;

const fontWeight = {
  100: 100,
  200: 200,
  300: 300,
  400: 400,
  500: 500,
  600: 600,
  700: 700,
  800: 800,
  900: 900,
} as const;

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
  'arrowHead',
] as const;

app.use(
  '*',
  cors({
    origin: (_, c) => (c.env.ALLOWED_ORIGINS ?? '*').split(','),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);

// Add X-Robots-Tag header to prevent indexing
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('X-Robots-Tag', 'noindex, nofollow');
});

// Validation functions
const validators = {
  checkId(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    );
  },

  checkObjectId(id: string): boolean {
    return /^[0-9a-zA-Z]{9}$/i.test(id);
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
    return Object.keys(fontWeight).includes(weight.toString());
  },

  checkTypeFields(obj: any, type: string, field: string): boolean {
    // Always return true for undefined optional fields
    if (obj[field] === undefined) return true;

    // For lineWidth, ensure it's a number between 1-12 if defined
    if (field === 'lineWidth') {
      const width = obj[field];
      return typeof width === 'number' && width >= 1 && width <= 12;
    }

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
      arrowHead: 'boolean',
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
  if (!validators.checkObjectId(obj.id)) {
    return { isValid: false, error: 'invalid id' };
  }

  if (!Object.values(ObjectTypes).includes(obj.type)) {
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

  if (obj.weight !== undefined && !validators.checkWeight(obj.weight)) {
    return { isValid: false, error: 'invalid weight' };
  }

  // If validation succeeds, return sanitizedObject
  return { isValid: true, sanitizedObject: sanitizeObject(obj) };
}

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/robots.txt', (c) => {
  return c.text('User-agent: *\nDisallow: /');
});

interface TenorResponse {
  results: Array<any>;
}

app.get('/gif', async (c) => {
  const keyword = Math.random() > 0.5 ? 'cat' : 'dog';
  const response = await fetch(
    `https://tenor.googleapis.com/v2/search?q=${keyword}&key=${c.env.TENOR_API_KEY}&limit=1&random=true`
  );
  const data = (await response.json()) as TenorResponse;
  if (!data) {
    return c.json({ error: 'no gifs found' }, 404);
  }

  return c.json(data);
});

app.post('/', async (c) => {
  const { bodies, token } = await c.req.json();

  if (!token) {
    return c.json({ error: 'turnstile token is required' }, 400);
  }

  // Validate turnstile token
  const formData = new FormData();
  formData.append('secret', c.env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: formData,
    }
  );

  interface TurnstileResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    error_codes?: string[];
    action?: string;
    cdata?: string;
  }

  const outcome = (await result.json()) as TurnstileResponse;
  if (!outcome.success) {
    return c.json({ error: 'turnstile validation failed' }, 400);
  }

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

const schema = z.object({
  canvas: z
    .array(
      z.object({
        id: z.string().describe('9-character unique ID (alphanumeric)'),
        type: z.nativeEnum(AIObjectTypes).describe('Object type'),
        position: z
          .object({
            x: z.number().describe('X coordinate'),
            y: z.number().describe('Y coordinate'),
          })
          .describe('Object position'),
        width: z.number().describe('Object width (20-500 pixels)'),
        height: z.number().describe('Object height (20-500 pixels)'),
        fill: z
          .string()
          .describe('Fill color (hex format, e.g., #FF0000 for red)'),
        fontSize: z
          .number()
          .optional()
          .refine(
            (n) =>
              n !== undefined &&
              [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128].includes(n),
            {
              message:
                'Font size must be one of: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128',
            }
          )
          .describe(
            'Font size (12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, or 128)'
          ),
        italic: z.boolean().optional().describe('True if italic'),
        lineWidth: z
          .number()
          .optional()
          .describe('Line width (1-12 pixels, default 6)'),
        points: z
          .array(
            z
              .object({
                x: z.number().describe('Point X coordinate'),
                y: z.number().describe('Point Y coordinate'),
              })
              .describe('Points for lines and arrows')
          )
          .optional(),
        rotation: z.number().optional().describe('Rotation angle (in degrees)'),
        text: z.string().optional().describe('Text content'),
        weight: z
          .number()
          .refine(
            (n) =>
              n !== undefined && Object.keys(fontWeight).includes(n.toString())
          )
          .optional()
          .describe('Font weight (100-900)'),
      })
    )
    .describe('Canvas objects'),
});

app.post('/generate', async (c) => {
  const client = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: 'OPENAI_API_KEY is not set' }, 500);
  }

  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json({ error: 'prompt is required' }, 400);
  }

  if (prompt.length > 128) {
    return c.json({ error: 'prompt is too long' }, 400);
  }

  try {
    const systemPrompt = `You are a skilled diagram creator. Your task is to create clear, visually appealing diagrams based on user prompts.

Guidelines:
- Create objects with appropriate sizes and positions
- Use contrasting colors for better visibility
- Space objects evenly for readability
- For text objects, use appropriate font sizes (larger for headings, smaller for details)
- Always center-align text objects, not left-aligned
- Keep the layout balanced and organized
- In principle, avoid using arrows unless explicitly requested
- Position objects logically to show relationships
- Use consistent styling across similar elements

Remember to optimize the visual hierarchy and ensure the diagram effectively communicates the intended message.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt },
    ];

    const completion = await client.chat.completions.create({
      model: c.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      response_format: zodResponseFormat(schema, 'canvas'),
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      return c.json({ error: 'Invalid OpenAI API response.' }, 500);
    }

    try {
      const parsedResponse = JSON.parse(response);
      // Filter out fontSize: 0 by removing the property when it's 0
      parsedResponse.canvas = parsedResponse.canvas.map(
        (obj: { [x: string]: any; fontSize: any }) => {
          if (obj.fontSize === 0) {
            const { fontSize, ...rest } = obj;
            return rest;
          }
          return obj;
        }
      );
      return c.json(parsedResponse.canvas);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return c.json({ error: 'Failed to parse JSON output.' }, 500);
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to generate content.' }, 500);
  }
});

export default app;
