import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createSubCardApi, getJourneyApi, getSubCardApi, listJourneysApi, updateSubCardApi,
} from '../api';
import type { JourneyDTO, SubCardDTO } from '@/server/db';
import { emptyCost, emptyItinerary } from '@/server/db';
import { toast } from '../components/Toast';
import ItineraryEditor from '../components/ItineraryEditor';
import SubCardPhotoGallery from '../components/SubCardPhotoGallery';
import CostFields from '../components/CostFields';
import { dateRangeFromItinerary } from '@/lib/itinerary';

interface Props { mode: 'new' | 'edit' }

const blankSub = (journeyId: number): SubCardDTO => ({
  id: '',
  journeyId,
  name: '',
  province: null,
  city: null,
  country: null,
  date: '',
  endDate: null,
  emoji: '📍',
  story: null,
  highlights: [],
  itineraryTable: emptyItinerary(),
  cost: emptyCost(),
  photoUrl: null,
  photoUrls: [],
  sortOrder: 0,
});

export default function SubCardEdit({ mode }: Props) {
  const navigate = useNavigate();
  const { id: idParam, subId } = useParams();
  const journeyId = Number(idParam);
  const [s, setS] = useState<SubCardDTO>(blankSub(journeyId));
  const [allJourneys, setAllJourneys] = useState<JourneyDTO[]>([]);
  const [parent, setParent] = useState<JourneyDTO | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [syncJourneyPhoto, setSyncJourneyPhoto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const all = await listJourneysApi();
        setAllJourneys(all);
        const p = all.find(j => j.id === journeyId);
        if (p) setParent(p);
        if (mode === 'edit' && subId) {
          const real = await getSubCardApi(decodeURIComponent(subId));
          setS({ ...real, country: normalizeCountryLabel(real.country) });
        } else if (mode === 'new' && p) {
          setS(prev => ({
            ...prev,
            province: p.province,
            city: p.city,
            country: normalizeCountryLabel(p.country),
            date: p.date,
            endDate: p.endDate,
            emoji: p.emoji ?? '📍',
          }));
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : '加载失败', 'error');
        navigate(`/journeys/${journeyId}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [journeyId, subId, mode]);

  const update = <K extends keyof SubCardDTO>(key: K, value: SubCardDTO[K]) => {
    setS(prev => ({ ...prev, [key]: value }));
  };

  const selectedParent = allJourneys.find(j => j.id === s.journeyId) ?? parent;
  const autoName = (s.city || selectedParent?.title || selectedParent?.city || '子卡片').trim();

  const updateJourneyId = (nextJourneyId: number) => {
    const nextParent = allJourneys.find(j => j.id === nextJourneyId) ?? null;
    if (nextParent) setParent(nextParent);
    setS(prev => ({
      ...prev,
      journeyId: nextJourneyId,
      name: nextParent?.title || prev.name,
    }));
  };

  const updateItinerary = (itineraryTable: SubCardDTO['itineraryTable']) => {
    const range = dateRangeFromItinerary(itineraryTable);
    setS(prev => ({
      ...prev,
      itineraryTable,
      ...(range ? { date: range.date, endDate: range.endDate } : {}),
    }));
  };

  const updatePhotos = async (
    photoUrls: string[],
    photoUrl: string | null,
    shouldSyncJourneyPhoto = false,
    shouldSaveNow = false,
  ) => {
    setS(prev => ({ ...prev, photoUrls, photoUrl }));
    setSyncJourneyPhoto(shouldSyncJourneyPhoto);
    if (mode !== 'edit' || !s.id || (!shouldSyncJourneyPhoto && !shouldSaveNow)) return;
    try {
      await updateSubCardApi(s.id, { photoUrl, photoUrls, syncJourneyPhoto: shouldSyncJourneyPhoto });
      setSyncJourneyPhoto(false);
      if (shouldSyncJourneyPhoto) {
        setParent(prev => prev ? { ...prev, photoUrl } : prev);
        setAllJourneys(prev => prev.map(jj => jj.id === s.journeyId ? { ...jj, photoUrl } : jj));
        toast('一级卡片封面已同步', 'success');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : '照片保存失败', 'error');
    }
  };

  const handleSave = async () => {
    if (!s.date) {
      toast('请填写开始日期', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'new') {
        await createSubCardApi({
          journeyId: s.journeyId,
          name: autoName,
          province: s.province,
          city: s.city,
          country: normalizeCountryLabel(s.country),
          date: s.date,
          endDate: s.endDate,
          emoji: s.emoji,
          story: s.story,
          highlights: s.highlights,
          itineraryTable: s.itineraryTable,
          cost: s.cost,
          photoUrl: s.photoUrl,
          photoUrls: s.photoUrls,
          syncJourneyPhoto,
        });
        setSyncJourneyPhoto(false);
        toast('已创建', 'success');
        navigate(`/journeys/${journeyId}`);
      } else {
        await updateSubCardApi(s.id, {
          journeyId: s.journeyId,
          name: autoName,
          province: s.province,
          city: s.city,
          country: normalizeCountryLabel(s.country),
          date: s.date,
          endDate: s.endDate,
          emoji: s.emoji,
          story: s.story,
          highlights: s.highlights,
          itineraryTable: s.itineraryTable,
          cost: s.cost,
          photoUrl: s.photoUrl,
          photoUrls: s.photoUrls,
          syncJourneyPhoto,
        });
        setSyncJourneyPhoto(false);
        toast('已保存', 'success');
        // 如果转移到新 journey
        if (s.journeyId !== journeyId) {
          navigate(`/journeys/${s.journeyId}`);
        }
      }
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
          <p className="breadcrumb">
            <Link to="/journeys">旅程</Link> / <Link to={`/journeys/${journeyId}`}>{parent?.title ?? `#${journeyId}`}</Link> / {mode === 'new' ? '新建子卡' : s.name}
          </p>
          <h1>{mode === 'new' ? '新建子卡片' : '编辑子卡片'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>返回上页</button>
          <Link to={`/journeys/${journeyId}`} className="btn btn-ghost">取消</Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2>基本信息</h2>
        <div className="form-grid">
          <div className="field">
            <label>归属一级卡片</label>
            <select value={s.journeyId} onChange={e => updateJourneyId(Number(e.target.value))}>
              {allJourneys.map(jj => (
                <option key={jj.id} value={jj.id}>#{jj.id} {jj.title}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Emoji</label>
            <input type="text" value={s.emoji ?? ''} maxLength={4} onChange={e => update('emoji', e.target.value)} />
          </div>
          <div className="field">
            <label>省份</label>
            <input type="text" value={s.province ?? ''} onChange={e => update('province', e.target.value || null)} />
          </div>
          <div className="field">
            <label>城市</label>
            <input type="text" value={s.city ?? ''} onChange={e => update('city', e.target.value || null)} />
          </div>
          <div className="field">
            <label>国家</label>
            <input type="text" value={s.country ?? ''} onChange={e => update('country', e.target.value || null)} />
          </div>
          <div className="field">
            <label>开始日期 *</label>
            <input type="date" value={s.date} onChange={e => update('date', e.target.value)} />
          </div>
          <div className="field">
            <label>结束日期</label>
            <input type="date" value={s.endDate ?? ''} onChange={e => update('endDate', e.target.value || null)} />
          </div>
        </div>
        <div className="form-grid full">
          <div className="field">
            <label>景点亮点（用、或,分隔）</label>
            <input
              type="text"
              value={s.highlights.join('、')}
              onChange={e => {
                update('highlights', e.target.value.split(/[、,，;；]/).map(t => t.trim()).filter(Boolean));
              }}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>行程表</h2>
        <ItineraryEditor value={s.itineraryTable} onChange={updateItinerary} />
      </div>

      <div className="admin-card">
        <h2>费用</h2>
        <CostFields value={s.cost} onChange={cost => update('cost', cost)} />
      </div>

      <div className="admin-card">
        <h2>照片</h2>
        <SubCardPhotoGallery
          photos={s.photoUrls}
          cover={s.photoUrl}
          folder={`sub-cards/${s.id || 'new'}`}
          onChange={updatePhotos}
        />
      </div>

      <div className="admin-card">
        <h2>旅行故事</h2>
        <div className="field">
          <textarea value={s.story ?? ''} onChange={e => update('story', e.target.value || null)} rows={6} />
        </div>
      </div>
    </div>
  );
}

function normalizeCountryLabel(country: string | null | undefined): string | null {
  return country === '国外' ? '国际' : (country ?? null);
}
