import type { Context } from 'hono';

// ============================================================
// Helpers to load a journey with all relations
// ============================================================

async function loadJourney(db: D1Database, id: number) {
  const row = await db.prepare('SELECT * FROM journeys WHERE id = ?').bind(id).first();
  if (!row) return null;
  return enrichJourney(db, row);
}

async function enrichJourney(db: D1Database, row: Record<string, unknown>) {
  const id = row.id as number;
  const [hlRows, costRow, itRows, subRows] = await Promise.all([
    db.prepare('SELECT * FROM highlights WHERE journey_id = ? ORDER BY sort_order').bind(id).all(),
    db.prepare('SELECT * FROM costs WHERE journey_id = ?').bind(id).first(),
    db.prepare('SELECT * FROM itinerary_items WHERE journey_id = ? ORDER BY sort_order').bind(id).all(),
    db.prepare('SELECT * FROM sub_cards WHERE journey_id = ? ORDER BY sort_order').bind(id).all(),
  ]);

  const subCards = [];
  for (const sr of subRows.results) {
    subCards.push(await enrichSubCard(db, sr as Record<string, unknown>));
  }

  return {
    id: row.id,
    province: row.province || '',
    city: row.city || '',
    country: row.country || '中国',
    date: row.date || '',
    endDate: row.end_date || '',
    title: row.title || '',
    emoji: row.emoji || '📍',
    description: row.description || '',
    story: row.story || '',
    photoKey: row.photo_key || null,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    highlights: hlRows.results.map((h: Record<string, unknown>) => ({
      id: h.id,
      journeyId: h.journey_id,
      text: h.text,
      sortOrder: h.sort_order,
    })),
    costs: {
      packageFee: (costRow as Record<string, unknown>)?.package_fee || 0,
      transportFee: (costRow as Record<string, unknown>)?.transport_fee || 0,
      accommodationFee: (costRow as Record<string, unknown>)?.accommodation_fee || 0,
      foodFee: (costRow as Record<string, unknown>)?.food_fee || 0,
      shoppingFee: (costRow as Record<string, unknown>)?.shopping_fee || 0,
      ticketFee: (costRow as Record<string, unknown>)?.ticket_fee || 0,
    },
    itinerary: itRows.results.map((it: Record<string, unknown>) => ({
      id: it.id,
      journeyId: it.journey_id,
      date: it.date || '',
      morning: it.morning || '',
      afternoon: it.afternoon || '',
      evening: it.evening || '',
      note: it.note || '',
      sortOrder: it.sort_order,
    })),
    subCards,
  };
}

async function enrichSubCard(db: D1Database, row: Record<string, unknown>) {
  const id = row.id as string;
  const [hlRows, costRow, itCells] = await Promise.all([
    db.prepare('SELECT * FROM sub_card_highlights WHERE sub_card_id = ? ORDER BY sort_order').bind(id).all(),
    db.prepare('SELECT * FROM sub_card_costs WHERE sub_card_id = ?').bind(id).first(),
    db.prepare(
      'SELECT * FROM sub_card_itinerary WHERE sub_card_id = ? ORDER BY row_index, header_index'
    ).bind(id).all(),
  ]);

  // Reconstruct itinerary table from cells
  const headers: string[] = [];
  const rowMap = new Map<number, string[]>();
  for (const cell of itCells.results) {
    const c = cell as Record<string, unknown>;
    const hIdx = c.header_index as number;
    const rIdx = c.row_index as number;
    const hText = c.header_text as string;
    const val = c.cell_value as string;
    if (!headers.includes(hText)) headers[hIdx] = hText;
    if (!rowMap.has(rIdx)) rowMap.set(rIdx, []);
    rowMap.get(rIdx)![hIdx] = val;
  }
  const rows2d = Array.from(rowMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, row]) => headers.map((_, i) => row[i] || ''));

  return {
    id: row.id,
    journeyId: row.journey_id,
    name: row.name || '',
    province: row.province || '',
    city: row.city || '',
    country: row.country || '中国',
    date: row.date || '',
    endDate: row.end_date || '',
    emoji: row.emoji || '📍',
    story: row.story || '',
    photoKey: row.photo_key || null,
    sortOrder: row.sort_order || 0,
    highlights: hlRows.results.map((h: Record<string, unknown>) => ({
      id: h.id,
      subCardId: h.sub_card_id,
      text: h.text,
      sortOrder: h.sort_order,
    })),
    costs: {
      packageFee: (costRow as Record<string, unknown>)?.package_fee || 0,
      transportFee: (costRow as Record<string, unknown>)?.transport_fee || 0,
      accommodationFee: (costRow as Record<string, unknown>)?.accommodation_fee || 0,
      foodFee: (costRow as Record<string, unknown>)?.food_fee || 0,
      shoppingFee: (costRow as Record<string, unknown>)?.shopping_fee || 0,
      ticketFee: (costRow as Record<string, unknown>)?.ticket_fee || 0,
    },
    itineraryTable: { headers: headers.filter(Boolean), rows: rows2d },
  };
}

// ============================================================
// Transaction helpers for journeys
// ============================================================

async function insertHighlights(db: D1Database, journeyId: number, highlights: unknown[]) {
  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    const text = typeof h === 'string' ? h : (h as Record<string, unknown>).text;
    if (text) {
      await db.prepare(
        'INSERT INTO highlights (journey_id, text, sort_order) VALUES (?, ?, ?)'
      ).bind(journeyId, text, i).run();
    }
  }
}

async function insertCosts(db: D1Database, journeyId: number, costs: Record<string, unknown> | undefined) {
  if (!costs) costs = {};
  await db.prepare(
    `INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    journeyId,
    (costs.packageFee as number) || 0,
    (costs.transportFee as number) || 0,
    (costs.accommodationFee as number) || 0,
    (costs.foodFee as number) || 0,
    (costs.shoppingFee as number) || 0,
    (costs.ticketFee as number) || 0,
  ).run();
}

async function insertItinerary(db: D1Database, journeyId: number, itinerary: unknown[]) {
  for (let i = 0; i < itinerary.length; i++) {
    const it = itinerary[i] as Record<string, unknown>;
    await db.prepare(
      `INSERT INTO itinerary_items (journey_id, date, morning, afternoon, evening, note, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      journeyId,
      (it.date as string) || '',
      (it.morning as string) || '',
      (it.afternoon as string) || '',
      (it.evening as string) || '',
      (it.note as string) || '',
      i,
    ).run();
  }
}

async function deleteJourneyRelations(db: D1Database, journeyId: number) {
  // FK cascades handle highlights, costs, itinerary_items, sub_cards
  // But we delete explicitly for clarity where needed
  await db.prepare('DELETE FROM highlights WHERE journey_id = ?').bind(journeyId).run();
  await db.prepare('DELETE FROM itinerary_items WHERE journey_id = ?').bind(journeyId).run();
  await db.prepare('DELETE FROM costs WHERE journey_id = ?').bind(journeyId).run();
}

// ============================================================
// Sub-card helpers
// ============================================================

async function saveSubCardHighlights(db: D1Database, subCardId: string, highlights: unknown[]) {
  await db.prepare('DELETE FROM sub_card_highlights WHERE sub_card_id = ?').bind(subCardId).run();
  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    const text = typeof h === 'string' ? h : (h as Record<string, unknown>).text;
    if (text) {
      await db.prepare(
        'INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES (?, ?, ?)'
      ).bind(subCardId, text, i).run();
    }
  }
}

async function saveSubCardCosts(db: D1Database, subCardId: string, costs: Record<string, unknown> | undefined) {
  await db.prepare('DELETE FROM sub_card_costs WHERE sub_card_id = ?').bind(subCardId).run();
  if (!costs) costs = {};
  await db.prepare(
    `INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    subCardId,
    (costs.packageFee as number) || 0,
    (costs.transportFee as number) || 0,
    (costs.accommodationFee as number) || 0,
    (costs.foodFee as number) || 0,
    (costs.shoppingFee as number) || 0,
    (costs.ticketFee as number) || 0,
  ).run();
}

async function saveSubCardItinerary(db: D1Database, subCardId: string, table: { headers: string[]; rows: string[][] } | undefined) {
  await db.prepare('DELETE FROM sub_card_itinerary WHERE sub_card_id = ?').bind(subCardId).run();
  if (!table || !table.headers || !table.rows) return;
  const { headers, rows } = table;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < headers.length; c++) {
      await db.prepare(
        `INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(subCardId, c, headers[c], r, rows[r][c] || '').run();
    }
  }
}

// ============================================================
// Route handlers
// ============================================================

export async function listJourneys(c: Context) {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM journeys ORDER BY date DESC, sort_order ASC').all();
  const journeys = [];
  for (const row of result.results) {
    journeys.push(await enrichJourney(db, row as Record<string, unknown>));
  }
  return c.json(journeys);
}

export async function getJourney(c: Context) {
  const id = Number(c.req.param('id'));
  const j = await loadJourney(c.env.DB, id);
  if (!j) return c.json({ error: 'Journey not found' }, 404);
  return c.json(j);
}

export async function createJourney(c: Context) {
  const body = await c.req.json();
  const db = c.env.DB;

  const maxResult = await db.prepare('SELECT MAX(sort_order) as m FROM journeys').first();
  const nextOrder = ((maxResult as Record<string, number> | null)?.m || 0) + 1;

  const result = await db.prepare(
    `INSERT INTO journeys (province, city, country, date, end_date, title, emoji, description, story, photo_key, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.province || '', body.city || '', body.country || '中国',
    body.date || '', body.endDate || '', body.title || '',
    body.emoji || '📍', body.description || '', body.story || '',
    body.photoKey || null, body.sortOrder ?? nextOrder,
  ).run();

  const id = result.meta.last_row_id as number;

  await insertHighlights(db, id, body.highlights || []);
  await insertCosts(db, id, body.costs);
  await insertItinerary(db, id, body.itinerary || []);

  const journey = await loadJourney(db, id);
  return c.json(journey, 201);
}

export async function updateJourney(c: Context) {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM journeys WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Journey not found' }, 404);

  await db.prepare(
    `UPDATE journeys SET province=?, city=?, country=?, date=?, end_date=?, title=?, emoji=?,
     description=?, story=?, photo_key=?, sort_order=?, updated_at=datetime('now')
     WHERE id=?`
  ).bind(
    body.province || '', body.city || '', body.country || '中国',
    body.date || '', body.endDate || '', body.title || '',
    body.emoji || '📍', body.description || '', body.story || '',
    body.photoKey || null, body.sortOrder ?? 0, id,
  ).run();

  // Replace relations
  await deleteJourneyRelations(db, id);
  await insertHighlights(db, id, body.highlights || []);
  await insertCosts(db, id, body.costs);
  await insertItinerary(db, id, body.itinerary || []);

  const journey = await loadJourney(db, id);
  return c.json(journey);
}

export async function deleteJourney(c: Context) {
  const id = Number(c.req.param('id'));
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM journeys WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Journey not found' }, 404);

  // FK cascades handle highlights, costs, itinerary, sub_cards, etc.
  await db.prepare('DELETE FROM journeys WHERE id = ?').bind(id).run();
  return c.json({ success: true });
}

// ============================================================
// Sub-card handlers
// ============================================================

export async function createSubCard(c: Context) {
  const jid = Number(c.req.param('jid'));
  const body = await c.req.json();
  const db = c.env.DB;

  const parent = await db.prepare('SELECT id FROM journeys WHERE id = ?').bind(jid).first();
  if (!parent) return c.json({ error: 'Journey not found' }, 404);

  const maxResult = await db.prepare(
    'SELECT MAX(sort_order) as m FROM sub_cards WHERE journey_id = ?'
  ).bind(jid).first();
  const nextOrder = ((maxResult as Record<string, number> | null)?.m || 0) + 1;

  const sid = 'sub-' + jid + '-' + Date.now();

  await db.prepare(
    `INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, photo_key, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    sid, jid, body.name || '', body.province || '', body.city || '', body.country || '中国',
    body.date || '', body.endDate || '', body.emoji || '📍',
    body.story || '', body.photoKey || null, body.sortOrder ?? nextOrder,
  ).run();

  await saveSubCardHighlights(db, sid, body.highlights || []);
  await saveSubCardCosts(db, sid, body.costs);
  await saveSubCardItinerary(db, sid, body.itineraryTable);

  const subRow = await db.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(sid).first();
  const subCard = await enrichSubCard(db, subRow as Record<string, unknown>);
  return c.json(subCard, 201);
}

export async function updateSubCard(c: Context) {
  const jid = Number(c.req.param('jid'));
  const sid = c.req.param('sid');
  const body = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare(
    'SELECT id FROM sub_cards WHERE id = ? AND journey_id = ?'
  ).bind(sid, jid).first();
  if (!existing) return c.json({ error: 'Sub-card not found' }, 404);

  await db.prepare(
    `UPDATE sub_cards SET name=?, province=?, city=?, country=?, date=?, end_date=?, emoji=?, story=?, photo_key=?, sort_order=?
     WHERE id=?`
  ).bind(
    body.name || '', body.province || '', body.city || '', body.country || '中国',
    body.date || '', body.endDate || '', body.emoji || '📍',
    body.story || '', body.photoKey || null, body.sortOrder ?? 0, sid,
  ).run();

  if (body.highlights) await saveSubCardHighlights(db, sid!, body.highlights);
  if (body.costs) await saveSubCardCosts(db, sid!, body.costs);
  if (body.itineraryTable) await saveSubCardItinerary(db, sid!, body.itineraryTable);

  const subRow = await db.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(sid).first();
  const subCard = await enrichSubCard(db, subRow as Record<string, unknown>);
  return c.json(subCard);
}

export async function deleteSubCard(c: Context) {
  const jid = Number(c.req.param('jid'));
  const sid = c.req.param('sid');
  const db = c.env.DB;

  const existing = await db.prepare(
    'SELECT id FROM sub_cards WHERE id = ? AND journey_id = ?'
  ).bind(sid, jid).first();
  if (!existing) return c.json({ error: 'Sub-card not found' }, 404);

  await db.prepare('DELETE FROM sub_cards WHERE id = ?').bind(sid).run();
  return c.json({ success: true });
}
