// ============================================================
// Seed script: migrate data from legacy JSON/JS into D1
// Usage: npm run db:seed
// ============================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read and parse the legacy journeys.json file
const journeysPath = join(import.meta.dirname, '..', 'legacy', 'data', 'journeys.json');
const journeysData = JSON.parse(readFileSync(journeysPath, 'utf-8'));

// We'll generate SQL INSERT statements and run them via wrangler
// For now, output SQL that can be piped to wrangler

function esc(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/'/g, "''");
}

function sqlDate(s: unknown): string {
  if (!s) return '';
  return String(s);
}

const lines: string[] = [];

lines.push('-- Auto-generated seed data from legacy/data/journeys.json');
lines.push('BEGIN TRANSACTION;');
lines.push('');

let journeyOrder = 0;

for (const j of journeysData) {
  journeyOrder++;
  const id = j.id;

  // Insert journey
  lines.push(`INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order)`);
  lines.push(`VALUES (${id}, '${esc(j.province)}', '${esc(j.city)}', '${esc(j.country)}', '${sqlDate(j.date)}', '${sqlDate(j.endDate)}', '${esc(j.title)}', '${esc(j.emoji)}', '${esc(j.description)}', '${esc(j.story)}', ${journeyOrder});`);

  // Insert highlights
  if (Array.isArray(j.highlights)) {
    j.highlights.forEach((h: string, i: number) => {
      lines.push(`INSERT INTO highlights (journey_id, text, sort_order) VALUES (${id}, '${esc(h)}', ${i});`);
    });
  }

  // Insert costs
  const c = j.cost || {};
  lines.push(`INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee)`);
  lines.push(`VALUES (${id}, ${c.package || 0}, ${c.transport || 0}, ${c.accommodation || 0}, ${c.food || 0}, ${c.shopping || 0}, ${c.ticket || 0});`);

  // Insert itinerary items (old format)
  if (Array.isArray(j.itinerary)) {
    j.itinerary.forEach((item: Record<string, string>, i: number) => {
      lines.push(`INSERT INTO itinerary_items (journey_id, date, morning, afternoon, evening, note, sort_order)`);
      lines.push(`VALUES (${id}, '${sqlDate(item.date)}', '${esc(item.morning)}', '${esc(item.afternoon)}', '${esc(item.evening)}', '${esc(item.note)}', ${i});`);
    });
  }

  // Insert subCards
  if (Array.isArray(j.subCards)) {
    j.subCards.forEach((sub: Record<string, unknown>, si: number) => {
      const sId = sub.id || `sub-${id}-${si}`;
      lines.push(`INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order)`);
      lines.push(`VALUES ('${esc(sId)}', ${id}, '${esc(sub.name)}', '${esc(sub.province)}', '${esc(sub.city)}', '${esc(sub.country)}', '${sqlDate(sub.date)}', '${sqlDate(sub.endDate)}', '${esc(sub.emoji)}', '${esc(sub.story)}', ${si});`);

      // Subcard highlights
      if (Array.isArray(sub.highlights)) {
        (sub.highlights as string[]).forEach((h: string, hi: number) => {
          lines.push(`INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('${esc(sId)}', '${esc(h)}', ${hi});`);
        });
      }

      // Subcard costs
      const sc = (sub.cost || {}) as Record<string, number>;
      lines.push(`INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee)`);
      lines.push(`VALUES ('${esc(sId)}', ${sc.package || 0}, ${sc.transport || 0}, ${sc.accommodation || 0}, ${sc.food || 0}, ${sc.shopping || 0}, ${sc.ticket || 0});`);

      // Subcard itinerary table (new format)
      const it = sub.itineraryTable as Record<string, unknown> | undefined;
      if (it && Array.isArray(it.headers) && Array.isArray(it.rows)) {
        (it.headers as string[]).forEach((header: string, hi: number) => {
          (it.rows as string[][]).forEach((row: string[], ri: number) => {
            const cell = row[hi] || '';
            if (cell) {
              lines.push(`INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value)`);
              lines.push(`VALUES ('${esc(sId)}', ${hi}, '${esc(header)}', ${ri}, '${esc(cell)}');`);
            }
          });
        });
      }
    });
  }

  lines.push('');
}

lines.push('COMMIT;');

// Write to stdout
console.log(lines.join('\n'));
console.error(`\nGenerated SQL seed for ${journeysData.length} journeys.`);
console.error('Pipe to: wrangler d1 execute hsn-journeys-db --remote --command="..."');
console.error('Or save to file and use --file flag.');
