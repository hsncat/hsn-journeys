import { useEffect, useRef, useState } from 'react';
import { deleteCoordApi, geocodeCoordApi, listCoordsApi, upsertCoordApi } from '../api';
import type { CityCoordRow } from '@/server/db';
import { toast } from '../components/Toast';

const blank = (): Partial<CityCoordRow> => ({ name: '', country: '中国', lat: 0, lng: 0, type: 'domestic' });

export default function CoordsEdit() {
  const [list, setList] = useState<CityCoordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CityCoordRow> | null>(null);
  const [q, setQ] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeHint, setGeocodeHint] = useState('');
  const lastGeocodeKey = useRef('');

  const load = async () => {
    setLoading(true);
    try { setList(await listCoordsApi()); }
    catch (err) { toast(err instanceof Error ? err.message : '加载失败', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = q ? list.filter(c => `${c.name} ${c.country}`.toLowerCase().includes(q.toLowerCase())) : list;

  const lookupCoordForEditing = async (draft = editing) => {
    if (!draft) return;
    const name = (draft.name ?? '').trim();
    const country = (draft.country ?? '').trim();
    const type = draft.type ?? 'domestic';
    if (list.some(c => c.name === name)) return;
    if (!name) {
      setGeocodeHint('');
      return;
    }
    if (name.length < 2) {
      setGeocodeHint('城市名至少输入 2 个字后自动获取坐标');
      return;
    }

    const key = `${name}|${country}|${type}`;
    if (lastGeocodeKey.current === key) return;
    lastGeocodeKey.current = key;
    setGeocoding(true);
    setGeocodeHint('正在自动获取坐标...');
    try {
      const coord = await geocodeCoordApi(name, country, type);
      setEditing(prev => {
        if (!prev || (prev.name ?? '').trim() !== name) return prev;
        return {
          ...prev,
          lat: coord.lat,
          lng: coord.lng,
          country: prev.country || coord.country,
          type: coord.type,
        };
      });
      setGeocodeHint(coord.displayName ? `已自动获取：${coord.displayName}` : '已自动获取坐标');
    } catch (err) {
      const message = err instanceof Error && err.message === 'geocode_not_found'
        ? '未找到坐标，请手动填写'
        : '坐标自动获取失败，请手动填写';
      setGeocodeHint(message);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!editing || !editing.name || !editing.country || !editing.type) {
      toast('请填写完整', 'error');
      return;
    }
    if (typeof editing.lat !== 'number' || typeof editing.lng !== 'number') {
      toast('lat/lng 必须是数字', 'error');
      return;
    }
    if (editing.lat === 0 && editing.lng === 0) {
      toast('请先自动获取或手动填写有效坐标', 'error');
      return;
    }
    try {
      await upsertCoordApi(editing.name, {
        country: editing.country,
        lat: editing.lat,
        lng: editing.lng,
        type: editing.type,
      });
      toast('已保存', 'success');
      setEditing(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`删除坐标 "${name}"？`)) return;
    try { await deleteCoordApi(name); toast('已删除', 'success'); load(); }
    catch (err) { toast(err instanceof Error ? err.message : '删除失败', 'error'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">管理后台 / 城市坐标</p>
          <h1>城市坐标 ({list.length})</h1>
        </div>
        <button className="btn btn-primary" onClick={() => {
          lastGeocodeKey.current = '';
          setGeocodeHint('');
          setEditing(blank());
        }}>+ 添加</button>
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索城市、国家…"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg)' }}
        />
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-empty">加载中…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>城市</th>
                <th>国家</th>
                <th>类型</th>
                <th>经纬度</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.country}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: c.type === 'domestic' ? 'var(--color-accent-soft)' : 'var(--color-danger-soft)',
                      color: c.type === 'domestic' ? 'var(--color-accent)' : 'var(--color-danger)',
                    }}>
                      {c.type === 'domestic' ? '国内' : '国际'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontFeatureSettings: '"tnum"', color: 'var(--color-text-muted)' }}>
                    {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => {
                        lastGeocodeKey.current = '';
                        setGeocodeHint('');
                        setEditing({ ...c });
                      }}>编辑</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.name)}>删除</button>
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
            <h2>{list.find(c => c.name === editing.name) ? '编辑坐标' : '添加坐标'}</h2>
            <div className="form-grid">
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>城市名 *</label>
                <input
                  type="text" value={editing.name ?? ''}
                  onChange={e => {
                    lastGeocodeKey.current = '';
                    setGeocodeHint('');
                    setEditing(p => ({ ...p!, name: e.target.value }));
                  }}
                  onBlur={e => lookupCoordForEditing({ ...editing, name: e.currentTarget.value })}
                  disabled={!!list.find(c => c.name === editing.name)}
                />
                {!list.find(c => c.name === editing.name) && geocodeHint && (
                  <p style={{
                    margin: '6px 0 0',
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: geocodeHint.includes('失败') || geocodeHint.includes('未找到')
                      ? 'var(--color-danger)'
                      : 'var(--color-text-muted)',
                  }}>
                    {geocodeHint}
                  </p>
                )}
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>国家 *</label>
                <input type="text" value={editing.country ?? ''} onChange={e => {
                  lastGeocodeKey.current = '';
                  setGeocodeHint('');
                  setEditing(p => ({ ...p!, country: e.target.value }));
                }} onBlur={e => lookupCoordForEditing({ ...editing, country: e.currentTarget.value })} />
              </div>
              <div className="field">
                <label>纬度 *</label>
                <input type="number" step="0.0001" value={editing.lat ?? 0} onChange={e => setEditing(p => ({ ...p!, lat: Number(e.target.value) }))} />
              </div>
              <div className="field">
                <label>经度 *</label>
                <input type="number" step="0.0001" value={editing.lng ?? 0} onChange={e => setEditing(p => ({ ...p!, lng: Number(e.target.value) }))} />
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>类型</label>
                <select value={editing.type ?? 'domestic'} onChange={e => {
                  lastGeocodeKey.current = '';
                  setGeocodeHint('');
                  const next = { ...editing, type: e.target.value as 'domestic' | 'international' };
                  setEditing(next);
                  lookupCoordForEditing(next);
                }}>
                  <option value="domestic">国内</option>
                  <option value="international">国际</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={geocoding}>
                {geocoding ? '获取中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
