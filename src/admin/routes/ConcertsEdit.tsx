import { useEffect, useState } from 'react';
import type { ConcertDTO } from '@/server/db';
import { createConcertApi, deleteConcertApi, listConcertsApi, updateConcertApi } from '../api';
import { toast } from '../components/Toast';

const moneyFmt = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const newRow = (sortOrder: number): ConcertDTO => ({
  id: -Date.now() - sortOrder,
  date: '',
  artist: '',
  title: '',
  venue: '',
  cost: 0,
  sortOrder,
});

type ConcertKey = 'date' | 'artist' | 'title' | 'venue' | 'cost';

export default function ConcertsEdit() {
  const [list, setList] = useState<ConcertDTO[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listConcertsApi();
      setList(rows.length ? rows : [newRow(0)]);
      setDeletedIds([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateCell = (idx: number, key: ConcertKey, value: string) => {
    setList(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      return { ...row, [key]: key === 'cost' ? Number(value) || 0 : value };
    }));
  };

  const addRow = () => {
    setList(prev => [...prev, newRow(prev.length)]);
  };

  const removeRow = (idx: number) => {
    setList(prev => {
      const target = prev[idx];
      if (target?.id > 0) setDeletedIds(ids => [...ids, target.id]);
      const next = prev.filter((_, i) => i !== idx);
      return (next.length ? next : [newRow(0)]).map((row, index) => ({ ...row, sortOrder: index }));
    });
  };

  const handleSave = async () => {
    const rows = list
      .map((row, index) => ({
        ...row,
        date: row.date.trim(),
        artist: row.artist.trim(),
        title: row.title.trim(),
        venue: row.venue.trim(),
        cost: Number(row.cost) || 0,
        sortOrder: index,
      }))
      .filter(row => row.date || row.artist || row.title || row.venue || row.cost);

    if (rows.some(row => !row.date || !row.artist || !row.title || !row.venue)) {
      toast('请补全日期、歌手、演唱会和地点', 'error');
      return;
    }

    setSaving(true);
    try {
      for (const id of deletedIds) await deleteConcertApi(id);
      for (const row of rows) {
        if (row.id > 0) {
          await updateConcertApi(row.id, row);
        } else {
          await createConcertApi(row);
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

  const total = list.reduce((sum, row) => sum + (Number(row.cost) || 0), 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 演唱会</p>
          <h1>演唱会 ({list.filter(row => row.title.trim()).length})</h1>
        </div>
        <div className="concert-admin-actions">
          <button className="btn btn-ghost" type="button" onClick={addRow} disabled={saving || loading}>添加一场</button>
          <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="admin-card concert-admin-card">
        <div className="concert-admin-summary">
          <span>共 {list.filter(row => row.title.trim()).length} 场</span>
          <span>合计 ¥{moneyFmt.format(total)}</span>
        </div>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : (
          <div className="concert-admin-table-wrap">
            <table className="admin-table concert-admin-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>歌手</th>
                  <th>演唱会</th>
                  <th>地点</th>
                  <th>金额</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, idx) => (
                  <tr key={row.id}>
                    <td><input type="date" value={row.date} onChange={e => updateCell(idx, 'date', e.target.value)} /></td>
                    <td><input value={row.artist} onChange={e => updateCell(idx, 'artist', e.target.value)} /></td>
                    <td><input value={row.title} onChange={e => updateCell(idx, 'title', e.target.value)} /></td>
                    <td><input value={row.venue} onChange={e => updateCell(idx, 'venue', e.target.value)} /></td>
                    <td><input type="number" min="0" step="0.01" value={row.cost || ''} onChange={e => updateCell(idx, 'cost', e.target.value)} /></td>
                    <td>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => removeRow(idx)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
