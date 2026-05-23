import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createJourneyApi, deleteSubCardApi, getJourneyApi, resyncJourneyApi, updateJourneyApi,
} from '../api';
import type { JourneyDTO } from '@/server/db';
import { emptyCost } from '@/server/db';
import { toast } from '../components/Toast';
import PhotoUploader from '../components/PhotoUploader';
import { totalCost } from '@/lib/itinerary';

interface Props { mode: 'new' | 'edit' }

const blankJourney = (): JourneyDTO => ({
  id: 0,
  province: '',
  city: '',
  country: '中国',
  date: '',
  endDate: '',
  title: '',
  emoji: '📍',
  description: null,
  story: null,
  highlights: [],
  cost: emptyCost(),
  photoUrl: null,
  sortOrder: 0,
  subCards: [],
});

export default function JourneyEdit({ mode }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ? Number(params.id) : 0;
  const [j, setJ] = useState<JourneyDTO>(blankJourney());
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit') {
      (async () => {
        try {
          const data = await getJourneyApi(id);
          setJ(data);
        } catch (err) {
          toast(err instanceof Error ? err.message : '加载失败', 'error');
          navigate('/journeys');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, mode]);

  const update = <K extends keyof JourneyDTO>(key: K, value: JourneyDTO[K]) => {
    setJ(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!j.title || !j.city || !j.province || !j.country || !j.date || !j.endDate) {
      toast('请填写标题、省份、城市、国家、日期', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        province: j.province,
        city: j.city,
        country: j.country,
        date: j.date,
        endDate: j.endDate,
        title: j.title,
        emoji: j.emoji,
        description: j.description,
        story: j.story,
        highlights: j.highlights,
        cost: j.cost,
        photoUrl: j.photoUrl,
      };
      if (mode === 'new') {
        const created = await createJourneyApi(payload);
        toast('已创建', 'success');
        navigate(`/journeys/${created.id}`);
      } else {
        await updateJourneyApi(id, payload);
        toast('已保存', 'success');
        const fresh = await getJourneyApi(id);
        setJ(fresh);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResync = async () => {
    if (!confirm('从所有子卡片重新聚合一级卡片的字段（日期/费用/亮点等）？')) return;
    try {
      const fresh = await resyncJourneyApi(id);
      setJ(fresh);
      toast('已重新聚合', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '操作失败', 'error');
    }
  };

  const handleDeleteSub = async (sid: string) => {
    if (!confirm('删除这个子卡片？')) return;
    try {
      await deleteSubCardApi(sid);
      const fresh = await getJourneyApi(id);
      setJ(fresh);
      toast('已删除', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  if (loading) return <div className="admin-empty">加载中…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="breadcrumb">
            <Link to="/journeys">旅程</Link> / {mode === 'new' ? '新建' : `#${id} ${j.title}`}
          </p>
          <h1>{mode === 'new' ? '新建旅程' : '编辑旅程'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {mode === 'edit' && (
            <a href={`/detail/${id}`} target="_blank" rel="noopener" className="btn btn-ghost">预览</a>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2>基本信息</h2>
        <p className="desc">一级卡片代表整段旅程；具体的行程明细在下面的"子卡片"里。</p>
        <div className="form-grid">
          <div className="field">
            <label>Emoji</label>
            <input type="text" value={j.emoji ?? ''} maxLength={4} onChange={e => update('emoji', e.target.value)} />
          </div>
          <div className="field">
            <label>标题 *</label>
            <input type="text" value={j.title} onChange={e => update('title', e.target.value)} />
          </div>
          <div className="field">
            <label>省份 / 大区 *</label>
            <input type="text" value={j.province} onChange={e => update('province', e.target.value)} />
            <span className="hint">多省用 & 分隔，如 "辽宁&山东"</span>
          </div>
          <div className="field">
            <label>城市 *</label>
            <input type="text" value={j.city} onChange={e => update('city', e.target.value)} />
            <span className="hint">多城用 & 分隔，如 "长白山&延吉"</span>
          </div>
          <div className="field">
            <label>国家 *</label>
            <input type="text" value={j.country} onChange={e => update('country', e.target.value)} />
            <span className="hint">国内填 "中国"；多国用 · 分隔，如 "法国·瑞士·意大利"</span>
          </div>
          <div className="field">
            <label>开始日期 *</label>
            <input type="date" value={j.date} onChange={e => update('date', e.target.value)} />
          </div>
          <div className="field">
            <label>结束日期 *</label>
            <input type="date" value={j.endDate} onChange={e => update('endDate', e.target.value)} />
          </div>
        </div>
        <div className="form-grid full">
          <div className="field">
            <label>简介</label>
            <textarea value={j.description ?? ''} onChange={e => update('description', e.target.value)} rows={2} />
          </div>
          <div className="field">
            <label>景点亮点（用、或,分隔）</label>
            <input
              type="text"
              value={j.highlights.join('、')}
              onChange={e => update('highlights', e.target.value.split(/[、,，;；]/).map(s => s.trim()).filter(Boolean))}
            />
          </div>
          <div className="field">
            <label>旅行故事</label>
            <textarea value={j.story ?? ''} onChange={e => update('story', e.target.value)} rows={6} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>费用</h2>
        <p className="desc">这里是一级卡片的汇总费用。如果"子卡片"里填了费用，可以点"从子卡片聚合"自动汇总。</p>
        <div className="form-grid">
          {(['package', 'transport', 'accommodation', 'food', 'shopping', 'ticket'] as const).map(key => (
            <div className="field" key={key}>
              <label>{({
                package: '报团费', transport: '交通费', accommodation: '住宿费',
                food: '餐饮费', shopping: '购物费', ticket: '门票费',
              } as Record<string, string>)[key]}</label>
              <input
                type="number"
                min={0}
                value={j.cost[key]}
                onChange={e => update('cost', { ...j.cost, [key]: Number(e.target.value) || 0 })}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, color: 'var(--color-text-muted)', fontSize: 14 }}>
          合计 <strong style={{ color: 'var(--color-accent)' }}>¥{totalCost(j.cost).toLocaleString()}</strong>
        </div>
      </div>

      <div className="admin-card">
        <h2>封面照片</h2>
        <PhotoUploader value={j.photoUrl} onChange={key => update('photoUrl', key)} folder={`journeys/${id}`} />
      </div>

      {mode === 'edit' && (
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>子卡片 ({j.subCards.length})</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={handleResync}>↻ 从子卡片聚合</button>
              <Link to={`/journeys/${id}/sub/new`} className="btn btn-accent">+ 添加子卡片</Link>
            </div>
          </div>
          <p className="desc">每个子卡片对应一个具体目的地，包含独立的行程表、费用和亮点。</p>
          {j.subCards.length === 0 ? (
            <div className="admin-empty">暂无子卡片</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>名称</th>
                  <th>日期</th>
                  <th>亮点</th>
                  <th>费用</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {j.subCards.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: 24, textAlign: 'center' }}>{s.emoji ?? '📍'}</td>
                    <td>
                      <Link to={`/journeys/${id}/sub/${encodeURIComponent(s.id)}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                        {s.name}
                      </Link>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{s.id}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {s.date}{s.endDate && s.endDate !== s.date ? ` ~ ${s.endDate}` : ''}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {(s.highlights || []).slice(0, 3).join(' · ')}
                    </td>
                    <td style={{ fontSize: 13, fontFeatureSettings: '"tnum"' }}>
                      ¥{totalCost(s.cost).toLocaleString()}
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/journeys/${id}/sub/${encodeURIComponent(s.id)}`} className="btn btn-sm btn-ghost">编辑</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSub(s.id)}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
