import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createWishlistApi, listWishlistApi, updateWishlistApi } from '../api';
import type { WishlistDTO } from '@/server/db';
import { toast } from '../components/Toast';

interface Props { mode: 'new' | 'edit' }

const blank = (): WishlistDTO => ({
  id: 0, title: '', city: '', emoji: '✈️',
  season: null, duration: null, description: null,
  highlights: [], sortOrder: 0,
});

export default function WishlistEdit({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const wid = id ? Number(id) : 0;
  const [w, setW] = useState<WishlistDTO>(blank());
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit') {
      (async () => {
        try {
          const all = await listWishlistApi();
          const item = all.find(x => x.id === wid);
          if (!item) throw new Error('not_found');
          setW(item);
        } catch (err) {
          toast(err instanceof Error ? err.message : '加载失败', 'error');
          navigate('/wishlist');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [wid, mode]);

  const update = <K extends keyof WishlistDTO>(key: K, value: WishlistDTO[K]) => {
    setW(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!w.title || !w.city) {
      toast('请填写标题和地点', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: w.title, city: w.city, emoji: w.emoji,
        season: w.season, duration: w.duration, description: w.description,
        highlights: w.highlights,
      };
      if (mode === 'new') {
        await createWishlistApi(payload);
        toast('已创建', 'success');
      } else {
        await updateWishlistApi(wid, payload);
        toast('已保存', 'success');
      }
      navigate('/wishlist');
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-empty">加载中…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb"><Link to="/wishlist">心愿单</Link> / {mode === 'new' ? '新建' : w.title}</p>
          <h1>{mode === 'new' ? '添加心愿' : '编辑心愿'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/wishlist" className="btn btn-ghost">取消</Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="form-grid">
          <div className="field">
            <label>Emoji</label>
            <input type="text" value={w.emoji ?? ''} maxLength={4} onChange={e => update('emoji', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label>标题 *</label>
            <input type="text" value={w.title} onChange={e => update('title', e.target.value)} />
          </div>
          <div className="field">
            <label>地点 *</label>
            <input type="text" value={w.city} onChange={e => update('city', e.target.value)} />
          </div>
          <div className="field">
            <label>合适季节</label>
            <input type="text" value={w.season ?? ''} onChange={e => update('season', e.target.value || null)} placeholder="如 春季 / 5月" />
          </div>
          <div className="field">
            <label>预计时长</label>
            <input type="text" value={w.duration ?? ''} onChange={e => update('duration', e.target.value || null)} placeholder="如 5天 / 1周" />
          </div>
        </div>
        <div className="form-grid full">
          <div className="field">
            <label>描述</label>
            <textarea value={w.description ?? ''} onChange={e => update('description', e.target.value || null)} rows={3} />
          </div>
          <div className="field">
            <label>主要景点（用、或,分隔）</label>
            <input
              type="text"
              value={w.highlights.join('、')}
              onChange={e => update('highlights', e.target.value.split(/[、,，;；]/).map(s => s.trim()).filter(Boolean))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
