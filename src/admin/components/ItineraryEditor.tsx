import type { ItineraryTable } from '@/server/db';

interface Props {
  value: ItineraryTable;
  onChange: (v: ItineraryTable) => void;
}

export default function ItineraryEditor({ value, onChange }: Props) {
  const headers = value.headers.length ? value.headers : ['日期', '上午', '下午', '备注'];
  const rows = value.rows;

  const update = (next: Partial<ItineraryTable>) => onChange({ headers, rows, ...next });

  const setCell = (r: number, c: number, val: string) => {
    const newRows = rows.map(row => [...row]);
    while (newRows[r].length < headers.length) newRows[r].push('');
    newRows[r][c] = val;
    update({ rows: newRows });
  };

  const setHeader = (i: number, val: string) => {
    const next = [...headers];
    next[i] = val;
    update({ headers: next });
  };

  const addRow = () => update({ rows: [...rows, headers.map(() => '')] });
  const removeRow = (idx: number) => update({ rows: rows.filter((_, i) => i !== idx) });
  const addCol = () => update({
    headers: [...headers, '新列'],
    rows: rows.map(r => [...r, '']),
  });
  const removeCol = (idx: number) => {
    if (headers.length <= 1) return;
    update({
      headers: headers.filter((_, i) => i !== idx),
      rows: rows.map(r => r.filter((_, i) => i !== idx)),
    });
  };

  return (
    <div className="itinerary-editor">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>
                <input value={h} onChange={e => setHeader(i, e.target.value)} />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCol(i)}
                    title="删除列"
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      border: 0, background: 'transparent', cursor: 'pointer',
                      color: 'var(--color-text-faint)', fontSize: 12,
                    }}
                  >×</button>
                )}
              </th>
            ))}
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length + 1} style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: 16 }}>
                还没有行程，点击下方"添加一天"开始
              </td>
            </tr>
          )}
          {rows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => {
                const isDate = ci === 0;
                const cell = String(row[ci] ?? '');
                return (
                  <td key={ci}>
                    {isDate ? (
                      <input
                        type="date"
                        value={cell.match(/^\d{4}-\d{1,2}-\d{1,2}$/) ? normalizeDate(cell) : cell}
                        onChange={e => setCell(ri, ci, e.target.value)}
                      />
                    ) : (
                      <textarea
                        value={cell}
                        onChange={e => setCell(ri, ci, e.target.value)}
                        rows={1}
                      />
                    )}
                  </td>
                );
              })}
              <td>
                <button
                  type="button"
                  onClick={() => removeRow(ri)}
                  title="删除该行"
                  style={{
                    border: 0, background: 'transparent', cursor: 'pointer',
                    color: 'var(--color-danger)', fontSize: 14,
                  }}
                >🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="itinerary-toolbar">
        <button type="button" onClick={addRow}>+ 添加一天</button>
        <button type="button" onClick={addCol}>+ 添加列</button>
      </div>
    </div>
  );
}

function normalizeDate(s: string): string {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}
