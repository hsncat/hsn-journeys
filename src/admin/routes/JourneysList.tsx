import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteJourneyApi, listJourneysApi, updateFeaturedJourneysApi } from '../api';
import type { JourneyDTO } from '@/server/db';
import { toast } from '../components/Toast';
import { formatMoney, totalCost } from '@/lib/itinerary';

export default function JourneysList() {
  const [list, setList] = useState<JourneyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [featuredMode, setFeaturedMode] = useState(false);
  const [featuredIds, setFeaturedIds] = useState<Set<number>>(new Set());
  const [savingFeatured, setSavingFeatured] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const journeys = await listJourneysApi();
      setList(journeys);
      setFeaturedIds(new Set(journeys.filter(j => j.isFeatured).map(j => j.id)));
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

  const toggleFeatured = (id: number) => {
    setFeaturedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cancelFeaturedMode = () => {
    setFeaturedIds(new Set(list.filter(j => j.isFeatured).map(j => j.id)));
    setFeaturedMode(false);
  };

  const handleSaveFeatured = async () => {
    setSavingFeatured(true);
    try {
      await updateFeaturedJourneysApi([...featuredIds]);
      toast('精彩旅程已更新', 'success');
      setFeaturedMode(false);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSavingFeatured(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 旅程</p>
          <h1>所有旅程 ({list.length})</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {featuredMode ? (
            <>
              <button className="btn btn-ghost" onClick={cancelFeaturedMode} disabled={savingFeatured}>取消</button>
              <button className="btn btn-accent" onClick={handleSaveFeatured} disabled={savingFeatured}>
                {savingFeatured ? '保存中…' : `保存精彩旅程 (${featuredIds.size})`}
              </button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setFeaturedMode(true)}>设置精彩旅程</button>
          )}
          <Link to="/journeys/new" className="btn btn-primary">+ 新建旅程</Link>
        </div>
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
                {featuredMode && <th style={{ width: 52, textAlign: 'center' }}>精选</th>}
                <th style={{ width: 60 }}></th>
                <th>标题</th>
                <th>日期</th>
                <th>子卡</th>
                <th>费用</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id}>
                  {featuredMode && (
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={featuredIds.has(j.id)}
                        onChange={() => toggleFeatured(j.id)}
                        aria-label={`选择 ${j.title} 为精彩旅程`}
                      />
                    </td>
                  )}
                  <td style={{ fontSize: 28, textAlign: 'center' }}>{j.emoji ?? '🌏'}</td>
                  <td>
                    <Link to={`/journeys/${j.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {j.title}
                    </Link>
                    {j.isFeatured && !featuredMode && (
                      <span style={{
                        marginLeft: 8,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'var(--color-warning-soft)',
                        color: 'var(--color-warning)',
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        精彩
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {j.date} ~ {j.endDate}
                  </td>
                  <td style={{ fontSize: 13, textAlign: 'center' }}>{j.subCards.length}</td>
                  <td style={{ fontSize: 13, fontFeatureSettings: '"tnum"' }}>
                    ¥{formatMoney(totalCost(j.cost))}
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
