import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createJourneyApi, deleteSubCardApi, getJourneyApi, resyncJourneyApi, updateJourneyApi,
} from '../api';
import type { JourneyDTO, SubCardDTO } from '@/server/db';
import { emptyCost, emptyItinerary } from '@/server/db';
import { toast } from '../components/Toast';
import PhotoUploader from '../components/PhotoUploader';
import ItineraryEditor from '../components/ItineraryEditor';
import CostFields from '../components/CostFields';
import {
  aggregateFromSubCards,
  buildJourneyTitle,
  dateRangeFromItinerary,
  formatMoney,
  totalCost,
} from '@/lib/itinerary';

interface Props { mode: 'new' | 'edit' }

const blankSub = (): SubCardDTO => ({
  id: 'new-sub-template',
  journeyId: 0,
  name: '',
  province: '',
  city: '',
  country: '中国',
  date: '',
  endDate: '',
  emoji: '📍',
  story: null,
  highlights: [],
  itineraryTable: emptyItinerary(),
  cost: emptyCost(),
  photoUrl: null,
  sortOrder: 0,
});

const blankJourney = (): JourneyDTO => ({
  id: 0,
  province: '',
  city: '',
  country: '国内',
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
  subCards: [blankSub()],
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
  }, [id, mode, navigate]);

  const autoJourney = useMemo(() => {
    const base = { ...j, country: normalizeCountry(j.country) };
    if (j.subCards.length === 0) {
      const title = buildJourneyTitle(j.province, j.city);
      return { ...base, title: title || j.title };
    }
    const aggregated = aggregateFromSubCards(j.subCards, base);
    return {
      ...base,
      ...aggregated,
      country: normalizeCountry(base.country),
      title: aggregated.title || buildJourneyTitle(aggregated.province, aggregated.city),
    } as JourneyDTO;
  }, [j]);

  const update = <K extends keyof JourneyDTO>(key: K, value: JourneyDTO[K]) => {
    setJ(prev => ({ ...prev, [key]: value }));
  };

  const updateNewSub = (index: number, patch: Partial<SubCardDTO>) => {
    setJ(prev => {
      const subCards = prev.subCards.map((sub, i) => i === index ? { ...sub, ...patch } : sub);
      const aggregated = aggregateFromSubCards(subCards, { ...prev, country: normalizeCountry(prev.country) });
      return {
        ...prev,
        ...aggregated,
        country: normalizeCountry(prev.country),
        title: aggregated.title || buildJourneyTitle(aggregated.province, aggregated.city),
        subCards,
      } as JourneyDTO;
    });
  };

  const updateNewSubItinerary = (index: number, itineraryTable: SubCardDTO['itineraryTable']) => {
    const range = dateRangeFromItinerary(itineraryTable);
    updateNewSub(index, {
      itineraryTable,
      ...(range ? { date: range.date, endDate: range.endDate } : {}),
    });
  };

  const handleSave = async () => {
    const payload = {
      province: autoJourney.province,
      city: autoJourney.city,
      country: normalizeCountry(autoJourney.country),
      date: autoJourney.date,
      endDate: autoJourney.endDate,
      title: autoJourney.title,
      emoji: autoJourney.emoji,
      description: null,
      story: autoJourney.story,
      highlights: autoJourney.highlights,
      cost: autoJourney.cost,
      photoUrl: autoJourney.photoUrl,
      subCards: mode === 'new' ? autoJourney.subCards.map(sub => ({
        ...sub,
        name: sub.city || autoJourney.title || '子卡片',
        country: sub.country || '中国',
      })) : undefined,
    };

    if (!payload.province || !payload.city || !payload.country || !payload.date || !payload.endDate || !payload.title) {
      toast('请先在子卡片里填写省份、城市和日期', 'error');
      return;
    }

    setSaving(true);
    try {
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
            <Link to="/journeys">旅程</Link> / {mode === 'new' ? '新建' : `#${id} ${autoJourney.title}`}
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
        <div className="form-grid">
          <div className="field">
            <label>Emoji</label>
            <input type="text" value={autoJourney.emoji ?? ''} maxLength={4} onChange={e => update('emoji', e.target.value)} />
          </div>
          <div className="field">
            <label>标题</label>
            <div className="auto-title">{autoJourney.title || '省份 / 大区·城市'}</div>
          </div>
          <div className="field">
            <label>省份 / 大区</label>
            <input type="text" value={autoJourney.province} readOnly />
          </div>
          <div className="field">
            <label>城市</label>
            <input type="text" value={autoJourney.city} readOnly />
          </div>
          <div className="field">
            <label>国家</label>
            <select value={normalizeCountry(j.country)} onChange={e => update('country', e.target.value)}>
              <option value="国内">国内</option>
              <option value="国外">国外</option>
            </select>
          </div>
          <div className="field">
            <label>开始日期</label>
            <input type="date" value={autoJourney.date} readOnly />
          </div>
          <div className="field">
            <label>结束日期</label>
            <input type="date" value={autoJourney.endDate} readOnly />
          </div>
        </div>
        <div className="form-grid full">
          <div className="field">
            <label>景点亮点</label>
            <textarea value={autoJourney.highlights.join('\n')} readOnly rows={Math.max(3, autoJourney.highlights.length)} />
          </div>
          <div className="field">
            <label>旅行故事</label>
            <textarea value={autoJourney.story ?? ''} onChange={e => update('story', e.target.value || null)} rows={6} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>费用</h2>
        <CostFields value={autoJourney.cost} readOnly />
      </div>

      <div className="admin-card">
        <h2>封面照片</h2>
        <PhotoUploader value={autoJourney.photoUrl} onChange={key => update('photoUrl', key)} folder={`journeys/${id || 'new'}`} />
      </div>

      {mode === 'new' && (
        <div className="admin-card">
          <h2>子卡片</h2>
          {j.subCards.map((sub, index) => (
            <div className="subcard-template" key={sub.id}>
              <div className="form-grid">
                <div className="field">
                  <label>Emoji</label>
                  <input type="text" value={sub.emoji ?? ''} maxLength={4} onChange={e => updateNewSub(index, { emoji: e.target.value })} />
                </div>
                <div className="field">
                  <label>省份</label>
                  <input type="text" value={sub.province ?? ''} onChange={e => updateNewSub(index, { province: e.target.value || null })} />
                </div>
                <div className="field">
                  <label>城市</label>
                  <input type="text" value={sub.city ?? ''} onChange={e => updateNewSub(index, { city: e.target.value || null })} />
                </div>
                <div className="field">
                  <label>国家</label>
                  <input type="text" value={sub.country ?? ''} onChange={e => updateNewSub(index, { country: e.target.value || null })} />
                </div>
                <div className="field">
                  <label>开始日期</label>
                  <input type="date" value={sub.date} onChange={e => updateNewSub(index, { date: e.target.value })} />
                </div>
                <div className="field">
                  <label>结束日期</label>
                  <input type="date" value={sub.endDate ?? ''} onChange={e => updateNewSub(index, { endDate: e.target.value || null })} />
                </div>
              </div>
              <div className="form-grid full">
                <div className="field">
                  <label>景点亮点（用、或,分隔）</label>
                  <input
                    type="text"
                    value={sub.highlights.join('、')}
                    onChange={e => updateNewSub(index, {
                      highlights: e.target.value.split(/[、,，;；]/).map(s => s.trim()).filter(Boolean),
                    })}
                  />
                </div>
                <div className="field">
                  <label>故事</label>
                  <textarea value={sub.story ?? ''} onChange={e => updateNewSub(index, { story: e.target.value || null })} rows={4} />
                </div>
              </div>
              <h3>行程表</h3>
              <ItineraryEditor value={sub.itineraryTable} onChange={v => updateNewSubItinerary(index, v)} />
              <h3>费用</h3>
              <CostFields value={sub.cost} onChange={cost => updateNewSub(index, { cost })} />
            </div>
          ))}
        </div>
      )}

      {mode === 'edit' && (
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>子卡片 ({j.subCards.length})</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={handleResync}>↻ 从子卡片聚合</button>
              <Link to={`/journeys/${id}/sub/new`} className="btn btn-accent">+ 添加子卡片</Link>
            </div>
          </div>
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
                      ¥{formatMoney(totalCost(s.cost))}
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

function normalizeCountry(country: string | null | undefined): string {
  return country === '国外' ? '国外' : '国内';
}

