import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { items } from './db/schema';
import { v7 as uuidv7 } from 'uuid';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: '*', // Allow all origins
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);

function checkId(id: string): boolean {
  // Check UUID v7
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    return false;
  }

  return true;
}

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/', async (c) => {
  const bodies = await c.req.json();

  if (!Array.isArray(bodies)) {
    return c.json({ error: 'request body must be an array' }, 400);
  }

  for (const body of bodies) {
    if (!body.id) {
      return c.json({ error: 'invalid id' }, 400);
    }

    if (!['rectangle', 'circle', 'text', 'image', 'line'].includes(body.type)) {
      return c.json({ error: 'invalid type' }, 400);
    }

    if (
      !body.position ||
      typeof body.position.x !== 'number' ||
      typeof body.position.y !== 'number'
    ) {
      return c.json({ error: 'invalid position' }, 400);
    }

    if (typeof body.width !== 'number' || typeof body.height !== 'number') {
      return c.json({ error: 'invalid dimensions' }, 400);
    }

    if (typeof body.fill !== 'string') {
      return c.json({ error: 'invalid fill' }, 400);
    }

    if (body.text !== undefined && typeof body.text !== 'string') {
      return c.json({ error: 'invalid text' }, 400);
    }

    if (body.imageData !== undefined && typeof body.imageData !== 'string') {
      return c.json({ error: 'invalid imageData' }, 400);
    }

    if (
      body.weight !== undefined &&
      ![100, 200, 300, 400, 500, 600, 700, 800, 900].includes(body.weight)
    ) {
      return c.json({ error: 'invalid weight' }, 400);
    }

    if (body.fontSize !== undefined && typeof body.fontSize !== 'number') {
      return c.json({ error: 'invalid fontSize' }, 400);
    }

    if (body.locked !== undefined && typeof body.locked !== 'boolean') {
      return c.json({ error: 'invalid locked status' }, 400);
    }

    if (body.points !== undefined && !Array.isArray(body.points)) {
      return c.json({ error: 'invalid points' }, 400);
    }

    if (body.lineWidth !== undefined && typeof body.lineWidth !== 'number') {
      return c.json({ error: 'invalid lineWidth' }, 400);
    }
  }

  const id = uuidv7();
  const db = drizzle(c.env.DB);
  await db.insert(items).values({
    id,
    content: bodies,
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
  if (!checkId(id)) {
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
