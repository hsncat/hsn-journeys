// ============================================================
// ItineraryGridEditor — dynamic table editor for sub-card itinerary
// ============================================================

interface ItineraryTableData {
  headers: string[];
  rows: string[][];
}

interface ItineraryGridEditorProps {
  table: ItineraryTableData;
  onChange: (table: ItineraryTableData) => void;
}

export default function ItineraryGridEditor({ table, onChange }: ItineraryGridEditorProps) {
  const { headers, rows } = table;

  function updateHeader(index: number, value: string) {
    const next = [...headers];
    next[index] = value;
    onChange({ headers: next, rows });
  }

  function addHeader() {
    onChange({
      headers: [...headers, ''],
      rows: rows.map((row) => [...row, '']),
    });
  }

  function removeHeader(index: number) {
    if (headers.length <= 1) return;
    const nextHeaders = headers.filter((_, i) => i !== index);
    const nextRows = rows.map((row) => row.filter((_, i) => i !== index));
    onChange({ headers: nextHeaders, rows: nextRows });
  }

  function updateCell(rowIdx: number, colIdx: number, value: string) {
    const nextRows = rows.map((row, ri) => {
      if (ri !== rowIdx) return row;
      const next = [...row];
      next[colIdx] = value;
      return next;
    });
    onChange({ headers, rows: nextRows });
  }

  function addRow() {
    onChange({ headers, rows: [...rows, new Array(headers.length).fill('')] });
  }

  function removeRow(index: number) {
    onChange({ headers, rows: rows.filter((_, i) => i !== index) });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((header, ci) => (
              <th key={ci} className="border border-zinc-200 dark:border-zinc-700 p-1.5 bg-zinc-50 dark:bg-zinc-800">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(ci, e.target.value)}
                    placeholder="列名"
                    className="flex-1 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(ci)}
                    className="p-0.5 text-zinc-400 hover:text-red-500 shrink-0"
                    title="删除列"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </th>
            ))}
            <th className="border border-zinc-200 dark:border-zinc-700 p-1.5 bg-zinc-50 dark:bg-zinc-800 w-10">
              <button
                type="button"
                onClick={addHeader}
                className="p-1 text-zinc-500 hover:text-blue-600 rounded"
                title="添加列"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-zinc-200 dark:border-zinc-700 p-1.5">
                  <input
                    type={ci === 0 ? 'date' : 'text'}
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    placeholder={ci === 0 ? undefined : ''}
                    className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-zinc-900 dark:text-zinc-100"
                  />
                </td>
              ))}
              <td className="border border-zinc-200 dark:border-zinc-700 p-1.5 w-10">
                <button
                  type="button"
                  onClick={() => removeRow(ri)}
                  className="p-1 text-zinc-400 hover:text-red-500 rounded"
                  title="删除行"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={headers.length + 1} className="border border-zinc-200 dark:border-zinc-700 p-1.5">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center justify-center gap-1 w-full py-1 text-xs text-zinc-500 hover:text-blue-600 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加行
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
