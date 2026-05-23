// ============================================================
// JourneyEditPage — full journey editor form
// ============================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useJourney,
  useCreateJourney,
  useUpdateJourney,
  useDeleteJourney,
} from '../hooks/useJourneys';
import { sumCosts } from '../../lib/journey-helpers';
import { COST_LABELS } from '../../lib/constants';
import type { Journey, Cost, SubCard } from '../types';
import {
  emptyJourneyForm,
  emptySubCardForm,
  type JourneyForm,
  type SubCardForm,
} from '../types';
import toast from 'react-hot-toast';
import HighlightInput from '../components/HighlightInput';
import PhotoUploader from '../components/PhotoUploader';
import ConfirmDialog from '../components/ConfirmDialog';
import ItineraryGridEditor from '../components/ItineraryGridEditor';

// ── Helpers ──────────────────────────────────────────────

const COST_KEYS: (keyof Cost)[] = [
  'packageFee', 'transportFee', 'accommodationFee',
  'foodFee', 'shoppingFee', 'ticketFee',
];

function journeyToForm(j: Journey): JourneyForm {
  return {
    province: j.province ?? '',
    city: j.city ?? '',
    country: j.country ?? '',
    title: j.title ?? '',
    emoji: j.emoji ?? '',
    description: j.description ?? '',
    date: j.date ?? '',
    endDate: j.endDate ?? '',
    story: j.story ?? '',
    highlights: j.highlights?.map((h) => (typeof h === 'string' ? h : h.text)) ?? [],
    costs: {
      packageFee: j.costs?.packageFee ?? 0,
      transportFee: j.costs?.transportFee ?? 0,
      accommodationFee: j.costs?.accommodationFee ?? 0,
      foodFee: j.costs?.foodFee ?? 0,
      shoppingFee: j.costs?.shoppingFee ?? 0,
      ticketFee: j.costs?.ticketFee ?? 0,
    },
    itinerary: j.itinerary?.map((it) => ({
      date: it.date ?? '',
      morning: it.morning ?? '',
      afternoon: it.afternoon ?? '',
      evening: it.evening ?? '',
      note: it.note ?? '',
    })) ?? [{ date: '', morning: '', afternoon: '', evening: '', note: '' }],
    photoKey: j.photoKey ?? null,
    photoUrl: j.photoUrl ?? '',
    subCards: j.subCards?.map((s: SubCard) => ({
      id: Number(s.id),
      name: s.name ?? '',
      province: s.province ?? '',
      city: s.city ?? '',
      country: s.country ?? '',
      date: s.date ?? '',
      endDate: s.endDate ?? '',
      emoji: s.emoji ?? '',
      story: s.story ?? '',
      highlights: s.highlights?.map((h) => (typeof h === 'string' ? h : h.text)) ?? [],
      costs: {
        packageFee: s.costs?.packageFee ?? 0,
        transportFee: s.costs?.transportFee ?? 0,
        accommodationFee: s.costs?.accommodationFee ?? 0,
        foodFee: s.costs?.foodFee ?? 0,
        shoppingFee: s.costs?.shoppingFee ?? 0,
        ticketFee: s.costs?.ticketFee ?? 0,
      },
      itineraryTable: s.itineraryTable ?? { headers: ['上午', '下午'], rows: [['', '']] },
      photoKey: s.photoKey ?? null,
      photoUrl: s.photoUrl ?? '',
    })) ?? [],
  };
}

function formToPayload(f: JourneyForm): Record<string, unknown> {
  return {
    province: f.province,
    city: f.city,
    country: f.country,
    title: f.title,
    emoji: f.emoji,
    description: f.description,
    date: f.date,
    endDate: f.endDate,
    story: f.story,
    highlights: f.highlights,
    costs: f.costs,
    itinerary: f.itinerary.filter((it) => it.date || it.morning || it.afternoon || it.evening || it.note),
    photoKey: f.photoKey,
    photoUrl: f.photoUrl,
    subCards: f.subCards.map((s) => ({
      id: s.id,
      name: s.name,
      province: s.province,
      city: s.city,
      country: s.country,
      date: s.date,
      endDate: s.endDate,
      emoji: s.emoji,
      story: s.story,
      highlights: s.highlights,
      costs: s.costs,
      itineraryTable: s.itineraryTable,
      photoKey: s.photoKey,
      photoUrl: s.photoUrl,
    })),
  };
}

// ── Input components ─────────────────────────────────────

function Input({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

// ── SubCard Editor ───────────────────────────────────────

function SubCardEditor({
  sub,
  index,
  onChange,
  onDelete,
}: {
  sub: SubCardForm;
  index: number;
  onChange: (s: SubCardForm) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function set<K extends keyof SubCardForm>(k: K, v: SubCardForm[K]) {
    onChange({ ...sub, [k]: v });
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{sub.emoji || '📌'}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {sub.name || `子卡片 ${index + 1}`}
          </span>
          {sub.city && <span className="text-sm text-zinc-400">— {sub.city}</span>}
        </div>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 space-y-5 border-t border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-2 gap-4">
            <Input label="名称" value={sub.name} onChange={(e) => set('name', e.target.value)} />
            <Input label="Emoji" value={sub.emoji} onChange={(e) => set('emoji', e.target.value)} maxLength={4} />
            <Input label="省份/区域" value={sub.province} onChange={(e) => set('province', e.target.value)} />
            <Input label="城市" value={sub.city} onChange={(e) => set('city', e.target.value)} />
            <Input label="国家" value={sub.country} onChange={(e) => set('country', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">开始日期</label>
              <input type="date" value={sub.date} onChange={(e) => set('date', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">结束日期</label>
              <input type="date" value={sub.endDate} onChange={(e) => set('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">故事</label>
            <textarea
              value={sub.story}
              onChange={(e) => set('story', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">亮点</label>
            <HighlightInput
              highlights={sub.highlights}
              onChange={(h) => set('highlights', h)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">费用</label>
            <div className="grid grid-cols-3 gap-3">
              {COST_KEYS.map((k) => (
                <div key={k}>
                  <label className="block text-xs text-zinc-500 mb-1">{COST_LABELS[k]}</label>
                  <input
                    type="number"
                    value={sub.costs[k] || 0}
                    onChange={(e) => set('costs', { ...sub.costs, [k]: Number(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">行程安排</label>
            <ItineraryGridEditor
              table={sub.itineraryTable}
              onChange={(t) => set('itineraryTable', t)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">封面照片</label>
            <PhotoUploader
              photoKey={sub.photoKey}
              photoUrl={sub.photoUrl}
              onUpload={(key, url) => { set('photoKey', key); set('photoUrl', url); }}
              onRemove={() => { set('photoKey', null); set('photoUrl', ''); }}
            />
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              删除子卡片
            </button>
          </div>

          <ConfirmDialog
            open={deleteConfirm}
            title="删除子卡片"
            message="确定要删除这个子卡片吗？"
            confirmText="删除"
            danger
            onConfirm={() => { setDeleteConfirm(false); onDelete(); }}
            onCancel={() => setDeleteConfirm(false)}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function JourneyEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const { data: journey, isLoading } = useJourney(isNew ? undefined : id);
  const createJourney = useCreateJourney();
  const updateJourney = useUpdateJourney();
  const deleteJourney = useDeleteJourney();

  const [form, setForm] = useState<JourneyForm>(emptyJourneyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (journey) {
      setForm(journeyToForm(journey));
    }
  }, [journey]);

  function update<K extends keyof JourneyForm>(k: K, v: JourneyForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.city.trim()) errs.push('城市名称不能为空');
    if (!form.title.trim()) errs.push('旅程标题不能为空');
    if (!form.date) errs.push('请选择出发日期');
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (isNew) {
        const result = await createJourney.mutateAsync(payload as Parameters<ReturnType<typeof useCreateJourney>['mutateAsync']>[0]);
        toast.success('旅程创建成功');
        navigate(`/admin/journeys/${result.id}`);
      } else {
        await updateJourney.mutateAsync({ id: Number(id), journey: payload as Parameters<ReturnType<typeof useUpdateJourney>['mutateAsync']>[0]['journey'] });
        toast.success('旅程保存成功');
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (isNew) return;
    deleteJourney.mutate(Number(id), {
      onSuccess: () => {
        toast.success('旅程已删除');
        navigate('/admin/journeys');
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : '删除失败'),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-4 z-10">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {isNew ? '添加旅程' : `编辑: ${form.title || '未命名'}`}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/journeys')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            取消
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              删除
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* 1. Basic Info */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">基本信息</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="城市" required value={form.city} onChange={(e) => update('city', e.target.value)} />
          <Input label="省份/区域" value={form.province} onChange={(e) => update('province', e.target.value)} />
          <Input label="国家" value={form.country} onChange={(e) => update('country', e.target.value)} />
          <Input label="Emoji" value={form.emoji} onChange={(e) => update('emoji', e.target.value)} maxLength={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="旅程标题" required value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">描述</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>
      </section>

      {/* 2. Dates */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">时间</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              出发日期 <span className="text-red-500">*</span>
            </label>
            <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">结束日期</label>
            <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      </section>

      {/* 3. Highlights */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">亮点</h3>
        <HighlightInput
          highlights={form.highlights}
          onChange={(h) => update('highlights', h)}
        />
      </section>

      {/* 4. Story */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">旅行故事</h3>
        <textarea
          value={form.story}
          onChange={(e) => update('story', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </section>

      {/* 5. Costs */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">费用</h3>
        <div className="grid grid-cols-3 gap-4">
          {COST_KEYS.map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {COST_LABELS[k]}
              </label>
              <input
                type="number"
                value={form.costs[k] || 0}
                onChange={(e) => update('costs', { ...form.costs, [k]: Number(e.target.value) || 0 })}
                min={0}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          合计: ¥{sumCosts(form.costs).toLocaleString()}
        </p>
      </section>

      {/* 6. Itinerary (fixed 5-column format) */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">行程安排</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500">日期</th>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500">上午</th>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500">下午</th>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500">晚上</th>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500">备注</th>
                <th className="border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 w-10" />
              </tr>
            </thead>
            <tbody>
              {form.itinerary.map((row, ri) => (
                <tr key={ri}>
                  <td className="border border-zinc-200 dark:border-zinc-700 p-1.5">
                    <input type="date" value={row.date}
                      onChange={(e) => {
                        const next = [...form.itinerary];
                        next[ri] = { ...next[ri], date: e.target.value };
                        update('itinerary', next);
                      }}
                      className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-zinc-900 dark:text-zinc-100" />
                  </td>
                  {(['morning', 'afternoon', 'evening', 'note'] as const).map((field) => (
                    <td key={field} className="border border-zinc-200 dark:border-zinc-700 p-1.5">
                      <input type="text" value={row[field]}
                        onChange={(e) => {
                          const next = [...form.itinerary];
                          next[ri] = { ...next[ri], [field]: e.target.value };
                          update('itinerary', next);
                        }}
                        className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-zinc-900 dark:text-zinc-100" />
                    </td>
                  ))}
                  <td className="border border-zinc-200 dark:border-zinc-700 p-1.5">
                    <button type="button"
                      onClick={() => update('itinerary', form.itinerary.filter((_, i) => i !== ri))}
                      className="p-1 text-zinc-400 hover:text-red-500 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button"
          onClick={() => update('itinerary', [...form.itinerary, { date: '', morning: '', afternoon: '', evening: '', note: '' }])}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加行
        </button>
      </section>

      {/* 7. Cover Photo */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">封面照片</h3>
        <PhotoUploader
          photoKey={form.photoKey}
          photoUrl={form.photoUrl}
          onUpload={(key, url) => { update('photoKey', key); update('photoUrl', url); }}
          onRemove={() => { update('photoKey', null); update('photoUrl', ''); }}
        />
      </section>

      {/* 8. Sub-cards */}
      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            子卡片 ({form.subCards.length})
          </h3>
          <button
            type="button"
            onClick={() => update('subCards', [...form.subCards, emptySubCardForm()])}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加子卡片
          </button>
        </div>

        {form.subCards.length === 0 ? (
          <p className="text-sm text-zinc-400 py-4 text-center">暂无子卡片</p>
        ) : (
          <div className="space-y-3">
            {form.subCards.map((sub, i) => (
              <SubCardEditor
                key={sub.id ?? `new-${i}`}
                sub={sub}
                index={i}
                onChange={(s) => {
                  const next = [...form.subCards];
                  next[i] = s;
                  update('subCards', next);
                }}
                onDelete={() => update('subCards', form.subCards.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-zinc-800/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-700 -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex items-center justify-between gap-3 z-10 rounded-b-xl">
        <div>
          {!isNew && <span className="text-sm text-zinc-500">ID: {id}</span>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/journeys')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            取消
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              删除
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        title="删除旅程"
        message="确定要删除这条旅程吗？此操作不可撤销，所有相关数据将被永久删除。"
        confirmText="删除"
        danger
        onConfirm={() => { setDeleteConfirm(false); handleDelete(); }}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
