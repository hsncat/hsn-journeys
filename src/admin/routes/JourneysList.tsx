import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteJourneyApi, listJourneysApi } from '../api';
import type { JourneyDTO } from '@/server/db';
import { toast } from '../components/Toast';
import { totalCost } from '@/lib/itinerary';

export default function JourneysList() {
  const [list, setList] = useState<JourneyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setList(await listJourneysApi());
    } catch (err) {
      toast(err instanceof Error ? err.message : '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = q
    ? list.filter(j => `${j.title} ${j.province} ${j.city} ${j.country}`.toLowerCase().includes(q.toLowerCase()))
    : list;

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这段旅程？所有子卡片会一并删除，不可恢复。')) return;
    try {
      await deleteJourneyApi(id);
      toast('已删除', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 旅程</p>
          <h1>所有旅程 ({list.length})</h1>
        </div>
        <Link to="/journeys/new" className="btn btn-primary">+ 新建旅程</Link>
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索标题、城市、国家…"
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid var(--color-border)', borderRadius: 10,
            font: 'inherit', background: 'var(--color-bg)',
          }}
        />
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p>暂无匹配的旅程</p>
            <Link to="/journeys/new" className="btn btn-primary" style={{ marginTop: 12 }}>+ 添加第一段</Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}></th>
                <th>标题</th>
                <th>地点</th>
                <th>日期</th>
                <th>子卡</th>
                <th>费用</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id}>
                  <td style={{ fontSize: 28, textAlign: 'center' }}>{j.emoji ?? '🌏'}</td>
                  <td>
                    <Link to={`/journeys/${j.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {j.title}
                    </Link>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>#{j.id}</div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {j.country} / {j.city}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {j.date} ~ {j.endDate}
                  </td>
                  <td style={{ fontSize: 13, textAlign: 'center' }}>{j.subCards.length}</td>
                  <td style={{ fontSize: 13, fontFeatureSettings: '"tnum"' }}>
                    ¥{totalCost(j.cost).toLocaleString()}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/journeys/${j.id}`} className="btn btn-sm btn-ghost">编辑</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(j.id)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
