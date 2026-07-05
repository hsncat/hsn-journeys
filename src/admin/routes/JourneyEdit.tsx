import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createJourneyApi, deleteSubCardApi, getJourneyApi, resyncJourneyApi, updateJourneyApi,
} from '../api';
import type { JourneyDTO, SubCardDTO } from '@/server/db';
import { emptyCost, emptyItinerary } from '@/server/db';
import { toast } from '../components/Toast';
import PhotoUploader from '../components/PhotoUploader';
import CostFields from '../components/CostFields';
import {
  aggregateFromSubCards,
  buildJourneyTitle,
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
  isFeatured: false,
  sortOrder: 0,
  subCards: [blankSub()],
});

export default function JourneyEdit({ mode }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ? Number(params.id) : 0;
  const [j, setJ] = useState<JourneyDTO>(blankJourney());
  const [loading, setLoading] = useState(mode === 'edit');
  const [creatingDraft, setCreatingDraft] = useState(false);
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
      country: normalizeCountry(aggregated.country),
      highlights: j.highlights.length ? j.highlights : (aggregated.highlights ?? []),
      photoUrl: j.photoUrl ?? aggregated.photoUrl ?? null,
      title: aggregated.title || buildJourneyTitle(aggregated.province, aggregated.city),
    } as JourneyDTO;
  }, [j]);

  const update = <K extends keyof JourneyDTO>(key: K, value: JourneyDTO[K]) => {
    setJ(prev => ({ ...prev, [key]: value }));
  };

  const updateCoverPhoto = async (key: string | null) => {
    update('photoUrl', key);
    if (mode !== 'edit') return;
    try {
      const fresh = await updateJourneyApi(id, { photoUrl: key });
      setJ(fresh);
      toast('封面照片已保存', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '封面照片保存失败', 'error');
    }
  };

  const createDraftJourney = async (target: 'journey' | 'template' | 'new-sub') => {
    if (mode !== 'new') return;
    setCreatingDraft(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const draft = {
        province: autoJourney.province || '待填写',
        city: autoJourney.city || '待填写',
        country: normalizeCountry(autoJourney.country),
        date: autoJourney.date || today,
        endDate: autoJourney.endDate || today,
        title: autoJourney.title || '待填写',
        emoji: autoJourney.emoji,
        description: null,
        story: autoJourney.story,
        highlights: autoJourney.highlights,
        cost: autoJourney.cost,
        photoUrl: autoJourney.photoUrl,
        subCards: [{
          ...blankSub(),
          name: '子卡片模板',
          emoji: autoJourney.emoji,
          province: '',
          city: '',
          country: '中国',
          date: today,
          endDate: today,
        }],
      };
      const created = await createJourneyApi(draft);
      const firstSubId = created.subCards[0]?.id;
      toast('已创建草稿', 'success');
      if (target === 'template' && firstSubId) {
        navigate(`/journeys/${created.id}/sub/${encodeURIComponent(firstSubId)}`);
      } else if (target === 'new-sub') {
        navigate(`/journeys/${created.id}/sub/new`);
      } else {
        navigate(`/journeys/${created.id}`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : '创建草稿失败', 'error');
    } finally {
      setCreatingDraft(false);
    }
  };

  const handleResync = async () => {
    try {
      const fresh = await resyncJourneyApi(id);
      setJ(fresh);
      toast('已从子卡片聚合并保存', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '操作失败', 'error');
    }
  };

  const handleSave = async () => {
    if (mode !== 'edit') return;
    setSaving(true);
    try {
      const fresh = await updateJourneyApi(id, {
        emoji: autoJourney.emoji,
        story: autoJourney.story,
        highlights: autoJourney.highlights,
        photoUrl: autoJourney.photoUrl,
      });
      setJ(fresh);
      toast('已保存', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSaving(false);
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
            <>
              <a href={`/detail/${id}`} target="_blank" rel="noopener" className="btn btn-ghost">预览</a>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中…' : '保存'}
              </button>
            </>
          )}
          {mode === 'new' && (
            <button
              className="btn btn-primary"
              onClick={() => createDraftJourney('journey')}
              disabled={creatingDraft}
            >
              {creatingDraft ? '保存中…' : '保存'}
            </button>
          )}
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
            <input type="text" value={autoJourney.country} readOnly />
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
            <textarea
              value={autoJourney.highlights.join('\n')}
              onChange={e => update('highlights', e.target.value.split(/\n+/).map(s => s.trim()).filter(Boolean))}
              rows={Math.max(3, autoJourney.highlights.length)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>费用</h2>
        <CostFields value={autoJourney.cost} readOnly />
      </div>

      {mode === 'new' && (
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>子卡片 (1)</h2>
            <button
              className="btn btn-accent"
              onClick={() => createDraftJourney('new-sub')}
              disabled={creatingDraft}
            >
              + 添加子卡片
            </button>
          </div>
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
              <tr>
                <td style={{ fontSize: 24, textAlign: 'center' }}>📍</td>
                <td>
                  <button
                    type="button"
                    className="link-btn table-link"
                    onClick={() => createDraftJourney('template')}
                    disabled={creatingDraft}
                  >
                    子卡片模板
                  </button>
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  待编辑
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  待编辑
                </td>
                <td style={{ fontSize: 13, fontFeatureSettings: '"tnum"' }}>
                  ¥{formatMoney(0)}
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => createDraftJourney('template')}
                      disabled={creatingDraft}
                    >
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          {creatingDraft && (
            <div style={{ marginTop: 10, color: 'var(--color-text-muted)', fontSize: 13 }}>
              正在创建草稿…
            </div>
          )}
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
                    <td style={{ fontSize: 24, textAlign: 'center' }}>📍</td>
                    <td>
                      <Link to={`/journeys/${id}/sub/${encodeURIComponent(s.id)}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                        {s.name}
                      </Link>
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

      <div className="admin-card">
        <h2>封面照片</h2>
        <PhotoUploader value={autoJourney.photoUrl} onChange={updateCoverPhoto} folder={`journeys/${id || 'new'}`} />
      </div>

      <div className="admin-card">
        <h2>旅行故事</h2>
        <div className="field">
          <textarea value={autoJourney.story ?? ''} onChange={e => update('story', e.target.value || null)} rows={6} />
        </div>
      </div>
    </div>
  );
}

function normalizeCountry(country: string | null | undefined): string {
  return country === '国外' || country === '国际' ? '国际' : '国内';
}
