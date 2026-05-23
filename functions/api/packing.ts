import type { Context } from 'hono';

export async function listPacking(c: Context) {
  const db = c.env.DB;
  const cats = await db.prepare('SELECT * FROM packing_categories ORDER BY sort_order').all();
  const result = [];

  for (const cat of cats.results) {
    const c = cat as Record<string, unknown>;
    const items = await db.prepare(
      'SELECT * FROM packing_items WHERE category_id = ? ORDER BY sort_order'
    ).bind(c.id).all();

    result.push({
      id: c.id,
      name: c.name,
      sortOrder: c.sort_order,
      items: items.results.map((i: Record<string, unknown>) => ({
        id: i.id,
        categoryId: i.category_id,
        item: i.item,
        note: i.note,
        checked: !!(i.checked as number),
        sortOrder: i.sort_order,
      })),
    });
  }

  return c.json(result);
}

export async function createCategory(c: Context) {
  const { name } = await c.req.json();
  if (!name) return c.json({ error: 'Name is required' }, 400);

  const db = c.env.DB;
  const maxResult = await db.prepare('SELECT MAX(sort_order) as m FROM packing_categories').first();
  const nextOrder = ((maxResult as Record<string, number> | null)?.m || 0) + 1;

  const result = await db.prepare(
    'INSERT INTO packing_categories (name, sort_order) VALUES (?, ?)'
  ).bind(name, nextOrder).run();

  return c.json({ id: result.meta.last_row_id }, 201);
}

export async function updateCategory(c: Context) {
  const id = Number(c.req.param('id'));
  const { name, sortOrder } = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM packing_categories WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  if (name !== undefined) {
    await db.prepare('UPDATE packing_categories SET name = ? WHERE id = ?').bind(name, id).run();
  }
  if (sortOrder !== undefined) {
    await db.prepare('UPDATE packing_categories SET sort_order = ? WHERE id = ?').bind(sortOrder, id).run();
  }

  return c.json({ success: true });
}

export async function deleteCategory(c: Context) {
  const id = Number(c.req.param('id'));
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM packing_categories WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.prepare('DELETE FROM packing_categories WHERE id = ?').bind(id).run();
  return c.json({ success: true });
}

export async function createItem(c: Context) {
  const body = await c.req.json();
  const { categoryId, item, note, checked } = body;
  if (!categoryId || !item) return c.json({ error: 'categoryId and item are required' }, 400);

  const db = c.env.DB;
  const maxResult = await db.prepare(
    'SELECT MAX(sort_order) as m FROM packing_items WHERE category_id = ?'
  ).bind(categoryId).first();
  const nextOrder = ((maxResult as Record<string, number> | null)?.m || 0) + 1;

  const result = await db.prepare(
    'INSERT INTO packing_items (category_id, item, note, checked, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).bind(categoryId, item, note || '', checked ? 1 : 0, body.sortOrder ?? nextOrder).run();

  return c.json({ id: result.meta.last_row_id }, 201);
}

export async function updateItem(c: Context) {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM packing_items WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const sets: string[] = [];
  const vals: unknown[] = [];

  if (body.item !== undefined) { sets.push('item = ?'); vals.push(body.item); }
  if (body.note !== undefined) { sets.push('note = ?'); vals.push(body.note); }
  if (body.checked !== undefined) { sets.push('checked = ?'); vals.push(body.checked ? 1 : 0); }
  if (body.sortOrder !== undefined) { sets.push('sort_order = ?'); vals.push(body.sortOrder); }

  if (sets.length > 0) {
    vals.push(id);
    await db.prepare(`UPDATE packing_items SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  }

  return c.json({ success: true });
}

export async function deleteItem(c: Context) {
  const id = Number(c.req.param('id'));
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM packing_items WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.prepare('DELETE FROM packing_items WHERE id = ?').bind(id).run();
  return c.json({ success: true });
}
