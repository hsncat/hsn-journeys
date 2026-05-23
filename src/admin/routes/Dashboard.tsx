import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJourneysApi, listWishlistApi, listCoordsApi, listPackingApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState<{
    journeys?: number;
    subCards?: number;
    wishlist?: number;
    coords?: number;
    packing?: number;
    recent?: Array<{ id: number; title: string; updated_at?: string }>;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [j, w, c, p] = await Promise.all([
          listJourneysApi(),
          listWishlistApi(),
          listCoordsApi(),
          listPackingApi(),
        ]);
        const totalSub = j.reduce((acc, jj) => acc + jj.subCards.length, 0);
        setStats({
          journeys: j.length,
          subCards: totalSub,
          wishlist: w.length,
          coords: c.length,
          packing: p.length,
          recent: j.slice(0, 5).map(jj => ({ id: jj.id, title: jj.title })),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台</p>
          <h1>总览</h1>
        </div>
        <Link to="/journeys/new" className="btn btn-primary">+ 新建旅程</Link>
      </div>

      {loading ? (
        <div className="stat-row">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="stat-block">
              <div className="skel" style={{ width: 80, height: 14 }} />
              <div className="skel" style={{ width: 60, height: 40, marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-row">
          <div className="stat-block">
            <div className="label">旅程</div>
            <div className="value">{stats.journeys}</div>
          </div>
          <div className="stat-block">
            <div className="label">子卡片</div>
            <div className="value">{stats.subCards}</div>
          </div>
          <div className="stat-block">
            <div className="label">心愿单</div>
            <div className="value">{stats.wishlist}</div>
          </div>
          <div className="stat-block">
            <div className="label">城市坐标</div>
            <div className="value">{stats.coords}</div>
          </div>
          <div className="stat-block">
            <div className="label">行李清单</div>
            <div className="value">{stats.packing}</div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h2>快捷入口</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/journeys" className="btn btn-ghost">📋 管理旅程</Link>
          <Link to="/wishlist" className="btn btn-ghost">💭 管理心愿单</Link>
          <Link to="/coords" className="btn btn-ghost">📍 城市坐标</Link>
          <Link to="/packing" className="btn btn-ghost">🧳 行李清单</Link>
          <a href="/" className="btn btn-ghost">👀 查看公开站点</a>
        </div>
      </div>
    </div>
  );
}
