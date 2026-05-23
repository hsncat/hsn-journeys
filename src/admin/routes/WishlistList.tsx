import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteWishlistApi, listWishlistApi } from '../api';
import type { WishlistDTO } from '@/server/db';
import { toast } from '../components/Toast';

export default function WishlistList() {
  const [list, setList] = useState<WishlistDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setList(await listWishlistApi()); }
    catch (err) { toast(err instanceof Error ? err.message : '加载失败', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('删除这条心愿？')) return;
    try { await deleteWishlistApi(id); toast('已删除', 'success'); load(); }
    catch (err) { toast(err instanceof Error ? err.message : '删除失败', 'error'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 心愿单</p>
          <h1>心愿单 ({list.length})</h1>
        </div>
        <Link to="/wishlist/new" className="btn btn-primary">+ 添加心愿</Link>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : list.length === 0 ? (
          <div className="admin-empty">
            <p>暂无心愿</p>
            <Link to="/wishlist/new" className="btn btn-primary" style={{ marginTop: 12 }}>+ 添加第一条</Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}></th>
                <th>标题</th>
                <th>地点</th>
                <th>季节 · 时长</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(w => (
                <tr key={w.id}>
                  <td style={{ fontSize: 24, textAlign: 'center' }}>{w.emoji ?? '✈️'}</td>
                  <td>
                    <Link to={`/wishlist/${w.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {w.title}
                    </Link>
                    {w.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                        {w.description.slice(0, 80)}{w.description.length > 80 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{w.city}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {[w.season, w.duration].filter(Boolean).join(' · ')}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/wishlist/${w.id}`} className="btn btn-sm btn-ghost">编辑</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(w.id)}>删除</button>
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
