import { useEffect, useState } from 'react';
import { createPackingApi, deletePackingApi, listPackingApi, updatePackingApi } from '../api';
import type { PackingRow } from '@/server/db';
import { toast } from '../components/Toast';

const blank = (): Partial<PackingRow> => ({
  category: '全部', item: '', note: '', is_overseas_only: 0, sort_order: 0,
});

export default function PackingEdit() {
  const [list, setList] = useState<PackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PackingRow> | null>(null);

  const load = async () => {
    setLoading(true);
    try { setList(await listPackingApi()); }
    catch (err) { toast(err instanceof Error ? err.message : '加载失败', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing || !editing.item) return toast('项目不能为空', 'error');
    try {
      if (editing.id) {
        await updatePackingApi(editing.id, editing);
        toast('已保存', 'success');
      } else {
        await createPackingApi({ ...editing, sort_order: list.length });
        toast('已添加', 'success');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('删除这一项？')) return;
    try { await deletePackingApi(id); toast('已删除', 'success'); load(); }
    catch (err) { toast(err instanceof Error ? err.message : '删除失败', 'error'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 行李清单</p>
          <h1>行李清单 ({list.length})</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(blank())}>+ 添加项目</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>项目</th>
                <th>备注</th>
                <th>仅出国</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.item}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.note}</td>
                  <td>{p.is_overseas_only === 1 ? '✓' : ''}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ ...p })}>编辑</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <h2>{editing.id ? '编辑项目' : '添加项目'}</h2>
            <div className="field">
              <label>项目 *</label>
              <input type="text" value={editing.item ?? ''} onChange={e => setEditing(p => ({ ...p!, item: e.target.value }))} />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>备注</label>
              <textarea value={editing.note ?? ''} onChange={e => setEditing(p => ({ ...p!, note: e.target.value }))} rows={3} />
            </div>
            <div className="field" style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox" id="overseas"
                checked={editing.is_overseas_only === 1}
                onChange={e => setEditing(p => ({ ...p!, is_overseas_only: e.target.checked ? 1 : 0 }))}
              />
              <label htmlFor="overseas" style={{ margin: 0, cursor: 'pointer' }}>仅出国时携带</label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
