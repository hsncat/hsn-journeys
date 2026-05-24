import { useEffect, useRef, useState } from 'react';
import { createPackingApi, deletePackingApi, listPackingApi, updatePackingApi } from '../api';
import type { PackingRow } from '@/server/db';
import { toast } from '../components/Toast';

type ColumnKey = 'item' | 'note';

interface FloatingControl {
  type: 'row' | 'col';
  index: number;
  top: number;
  left: number;
}

const columnLabels: Record<ColumnKey, string> = {
  item: '项目',
  note: '备注',
};

const newRow = (sortOrder: number): PackingRow => ({
  id: -Date.now() - sortOrder,
  category: '全部',
  item: '',
  note: '',
  is_overseas_only: 0,
  sort_order: sortOrder,
});

export default function PackingEdit() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [list, setList] = useState<PackingRow[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [columns, setColumns] = useState<ColumnKey[]>(['item', 'note']);
  const [control, setControl] = useState<FloatingControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listPackingApi();
      setList(rows.length ? rows : [newRow(0)]);
      setDeletedIds([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const updateCell = (idx: number, key: ColumnKey, value: string) => {
    setList(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  };

  const addRow = (after = list.length - 1) => {
    setList(prev => {
      const next = [...prev];
      next.splice(Math.max(0, after + 1), 0, newRow(next.length));
      return next.map((row, index) => ({ ...row, sort_order: index }));
    });
  };

  const removeRow = (idx: number) => {
    setList(prev => {
      const target = prev[idx];
      if (target?.id > 0) setDeletedIds(ids => [...ids, target.id]);
      const next = prev.filter((_, i) => i !== idx);
      return (next.length ? next : [newRow(0)]).map((row, index) => ({ ...row, sort_order: index }));
    });
  };

  const addCol = (after: number) => {
    if (!columns.includes('note')) {
      const next = [...columns];
      next.splice(Math.max(0, after + 1), 0, 'note');
      setColumns(next);
    }
  };

  const removeCol = (idx: number) => {
    const key = columns[idx];
    if (columns.length <= 1 || key === 'item') return;
    setColumns(prev => prev.filter((_, i) => i !== idx));
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

  const handleSave = async () => {
    const rows = list
      .map((row, index) => ({ ...row, item: row.item.trim(), note: row.note?.trim() || null, sort_order: index }))
      .filter(row => row.item);
    if (rows.length === 0) {
      toast('至少保留一个项目', 'error');
      return;
    }
    setSaving(true);
    try {
      for (const id of deletedIds) await deletePackingApi(id);
      for (const row of rows) {
        if (row.id > 0) {
          await updatePackingApi(row.id, row);
        } else {
          await createPackingApi(row);
        }
      }
      toast('已保存', 'success');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 行李清单</p>
          <h1>行李清单 ({list.filter(row => row.item.trim()).length})</h1>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? '保存中…' : '保存'}
        </button>
      </div>

      <div className="admin-card packing-admin-card">
        <h2 className="packing-admin-title">行李清单</h2>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : (
          <div className="packing-sheet" ref={wrapRef} onMouseLeave={() => setControl(null)}>
            <div className="packing-sheet-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map((key, i) => (
                      <th key={key} onMouseEnter={e => showColControls(i, e.currentTarget)}>
                        {columnLabels[key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, ri) => (
                    <tr key={row.id} onMouseEnter={e => showRowControls(ri, e.currentTarget)}>
                      {columns.map(key => (
                        <td key={key}>
                          {key === 'note' ? (
                            <textarea
                              value={row.note ?? ''}
                              onChange={e => updateCell(ri, key, e.target.value)}
                              rows={1}
                            />
                          ) : (
                            <input
                              value={row.item}
                              onChange={e => updateCell(ri, key, e.target.value)}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {control && (
                <div
                  className={`itinerary-floating-control is-${control.type}`}
                  style={{ top: control.top, left: control.left }}
                  onMouseEnter={() => setControl(control)}
                >
                  <button
                    type="button"
                    title={control.type === 'row' ? '在下方增加行' : '在右侧增加列'}
                    onClick={() => control.type === 'row' ? addRow(control.index) : addCol(control.index)}
                    disabled={control.type === 'col' && columns.includes('note')}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="danger"
                    title={control.type === 'row' ? '删除行' : '删除列'}
                    onClick={() => control.type === 'row' ? removeRow(control.index) : removeCol(control.index)}
                    disabled={control.type === 'col' && (columns.length <= 1 || columns[control.index] === 'item')}
                  >
                    -
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
