import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable(
  'items',
  {
    id: text('id', { mode: 'text' }).primaryKey(),
    content: text('content', { mode: 'json' }),
    createdAt: text('created_at', { mode: 'text' }),
  },
  () => []
);
