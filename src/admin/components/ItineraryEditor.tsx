import { useRef, useState } from 'react';
import type { ClipboardEvent } from 'react';
import type { ItineraryTable } from '@/server/db';

interface Props {
  value: ItineraryTable;
  onChange: (v: ItineraryTable) => void;
}

interface FloatingControl {
  type: 'row' | 'col';
  index: number;
  top: number;
  left: number;
}

export default function ItineraryEditor({ value, onChange }: Props) {
  const headers = value.headers.length ? value.headers : ['日期', '上午', '下午', '备注'];
  const rows = value.rows;
  const visibleRows = rows.length ? rows : [headers.map(() => '')];
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [control, setControl] = useState<FloatingControl | null>(null);

  const update = (next: Partial<ItineraryTable>) => onChange({ headers, rows, ...next });

  const setCell = (r: number, c: number, val: string) => {
    const newRows = normalizedRows(rows, headers.length);
    while (newRows.length <= r) newRows.push(headers.map(() => ''));
    newRows[r][c] = val;
    if (r === 0 && isDateColumn(c) && isFullDate(val)) {
      for (let i = 1; i < newRows.length; i++) {
        if (!String(newRows[i][c] ?? '').trim()) {
          newRows[i][c] = dateOffset(val, i);
        }
      }
    }
    update({ rows: newRows });
  };

  const setHeader = (i: number, val: string) => {
    const next = [...headers];
    next[i] = val;
    update({ headers: next });
  };

  const addRow = (after = rows.length - 1) => {
    const next = normalizedRows(rows, headers.length);
    const insertAt = Math.max(0, after + 1);
    const row = headers.map(() => '');
    const dateCol = headers.findIndex((h, idx) => isDateColumn(idx));
    if (dateCol >= 0) {
      const firstDate = String(next[0]?.[dateCol] ?? '');
      if (isFullDate(firstDate)) row[dateCol] = dateOffset(firstDate, insertAt);
    }
    next.splice(insertAt, 0, row);
    update({ rows: next });
  };

  const removeRow = (idx: number) => update({ rows: rows.filter((_, i) => i !== idx) });

  const addCol = (after = headers.length - 1) => {
    const insertAt = Math.max(0, after + 1);
    const nextHeaders = [...headers];
    nextHeaders.splice(insertAt, 0, '新列');
    update({
      headers: nextHeaders,
      rows: normalizedRows(rows, headers.length).map(r => {
        const next = [...r];
        next.splice(insertAt, 0, '');
        return next;
      }),
    });
  };

  const removeCol = (idx: number) => {
    if (headers.length <= 1) return;
    update({
      headers: headers.filter((_, i) => i !== idx),
      rows: rows.map(r => r.filter((_, i) => i !== idx)),
    });
  };

  const showRowControls = (idx: number, target: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = target.getBoundingClientRect();
    const base = wrap.getBoundingClientRect();
    setControl({
      type: 'row',
      index: idx,
      top: rect.top - base.top + rect.height / 2,
      left: rect.right - base.left,
    });
  };

  const showColControls = (idx: number, target: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = target.getBoundingClientRect();
    const base = wrap.getBoundingClientRect();
    setControl({
      type: 'col',
      index: idx,
      top: rect.top - base.top,
      left: rect.left - base.left + rect.width / 2,
    });
  };

  const handlePaste = (
    event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    startRow: number,
    startCol: number,
  ) => {
    const text = event.clipboardData.getData('text/plain');
    const pastedRows = text.replace(/\r/g, '').split('\n');
    if (pastedRows[pastedRows.length - 1] === '') pastedRows.pop();
    const matrix = pastedRows.map(line => line.split('\t'));
    const isGrid = matrix.length > 1 || matrix.some(row => row.length > 1);
    if (!isGrid) return;

    event.preventDefault();
    const nextHeaders = [...headers];
    const requiredCols = startCol + Math.max(...matrix.map(row => row.length));
    while (nextHeaders.length < requiredCols) nextHeaders.push('新列');

    const nextRows = normalizedRows(rows, nextHeaders.length);
    while (nextRows.length < startRow + matrix.length) nextRows.push(nextHeaders.map(() => ''));
    matrix.forEach((row, rOffset) => {
      row.forEach((cell, cOffset) => {
        nextRows[startRow + rOffset][startCol + cOffset] = cell.trim();
      });
    });
    onChange({ headers: nextHeaders, rows: nextRows });
  };

  return (
    <div className="itinerary-editor" ref={wrapRef} onMouseLeave={() => setControl(null)}>
      <div className="itinerary-table-wrap">
        <table>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} onMouseEnter={e => showColControls(i, e.currentTarget)}>
                  <input value={h} onChange={e => setHeader(i, e.target.value)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, ri) => (
              <tr key={ri} onMouseEnter={e => showRowControls(ri, e.currentTarget)}>
                {headers.map((_, ci) => {
                  const isDate = isDateColumn(ci);
                  const cell = String(row[ci] ?? '');
                  return (
                    <td key={ci}>
                      {isDate ? (
                        <input
                          type="date"
                          value={cell.match(/^\d{4}-\d{1,2}-\d{1,2}$/) ? normalizeDate(cell) : cell}
                          onChange={e => setCell(ri, ci, e.target.value)}
                          onPaste={e => handlePaste(e, ri, ci)}
                        />
                      ) : (
                        <textarea
                          value={cell}
                          onChange={e => setCell(ri, ci, e.target.value)}
                          onPaste={e => handlePaste(e, ri, ci)}
                          rows={1}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {control && (
          <div
            className={`itinerary-floating-control is-${control.type}`}
            style={{
              top: control.top,
              left: control.left,
            }}
            onMouseEnter={() => setControl(control)}
          >
            <button
              type="button"
              title={control.type === 'row' ? '在下方增加行' : '在右侧增加列'}
              onClick={() => control.type === 'row' ? addRow(control.index) : addCol(control.index)}
            >
              +
            </button>
            <button
              type="button"
              className="danger"
              title={control.type === 'row' ? '删除行' : '删除列'}
              onClick={() => control.type === 'row' ? removeRow(control.index) : removeCol(control.index)}
              disabled={control.type === 'col' && headers.length <= 1}
            >
              -
            </button>
          </div>
          )}
      </div>
    </div>
  );
}

function normalizedRows(rows: (string | number)[][], colCount: number): (string | number)[][] {
  return rows.map(row => {
    const next = [...row];
    while (next.length < colCount) next.push('');
    return next.slice(0, colCount);
  });
}

function normalizeDate(s: string): string {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function dateOffset(start: string, offset: number): string {
  const normalized = normalizeDate(start);
  if (!isFullDate(normalized)) return '';
  const d = new Date(`${normalized}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function isDateColumn(index: number): boolean {
  return index === 0;
}

function isFullDate(s: string): boolean {
  return /^\d{4}-\d{1,2}-\d{1,2}$/.test(s);
}
