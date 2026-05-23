// ============================================================
// WishlistPage — grid of wishlist cards with CRUD modals
// ============================================================
import { useState } from 'react';
import {
  useWishlist,
  useCreateWishlistItem,
  useUpdateWishlistItem,
  useDeleteWishlistItem,
} from '../hooks/useWishlist';
import type { WishlistItem } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

interface WishlistForm {
  title: string;
  city: string;
  emoji: string;
  season: string;
  duration: string;
  description: string;
  highlights: string;
}

const emptyForm: WishlistForm = {
  title: '', city: '', emoji: '', season: '', duration: '', description: '', highlights: '',
};

function WishlistModal({
  open,
  title,
  form,
  onChange,
  onSave,
  onClose,
  saving,
}: {
  open: boolean;
  title: string;
  form: WishlistForm;
  onChange: (f: WishlistForm) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">标题 *</label>
            <input type="text" value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Emoji</label>
            <input type="text" value={form.emoji} onChange={(e) => onChange({ ...form, emoji: e.target.value })} maxLength={4}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">城市</label>
            <input type="text" value={form.city} onChange={(e) => onChange({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">季节</label>
            <input type="text" value={form.season} onChange={(e) => onChange({ ...form, season: e.target.value })} placeholder="例如: 春季"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">时长</label>
            <input type="text" value={form.duration} onChange={(e) => onChange({ ...form, duration: e.target.value })} placeholder="例如: 5天"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">描述</label>
            <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">亮点（每行一个）</label>
            <textarea value={form.highlights} onChange={(e) => onChange({ ...form, highlights: e.target.value })} rows={3} placeholder="每行一个亮点"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
            取消
          </button>
          <button onClick={onSave} disabled={saving || !form.title.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const createItem = useCreateWishlistItem();
  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<WishlistForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: WishlistItem) {
    setEditId(item.id);
    setForm({
      title: item.title ?? '',
      city: item.city ?? '',
      emoji: item.emoji ?? '',
      season: item.season ?? '',
      duration: item.duration ?? '',
      description: item.description ?? '',
      highlights: item.highlights?.map((h) => (typeof h === 'string' ? h : h.text)).join('\n') ?? '',
    });
    setModalOpen(true);
  }

  function handleSave() {
    const payload: Record<string, unknown> = {
      title: form.title,
      city: form.city,
      emoji: form.emoji,
      season: form.season,
      duration: form.duration,
      description: form.description,
      highlights: form.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      sortOrder: 0,
    };

    if (editId != null) {
      updateItem.mutate(
        { id: editId, item: payload },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createItem.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">心愿单</h2>
          <p className="text-sm text-zinc-500 mt-1">共 {wishlist?.length ?? 0} 个心愿</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加心愿
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : wishlist?.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500">还没有心愿单</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist?.map((item: WishlistItem) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {item.city && (
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-full">{item.city}</span>
                )}
                {item.season && (
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">{item.season}</span>
                )}
                {item.duration && (
                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">{item.duration}</span>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">{item.description}</p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-zinc-50 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded">
                      {typeof h === 'string' ? h : h.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <WishlistModal
        open={modalOpen}
        title={editId != null ? '编辑心愿' : '添加心愿'}
        form={form}
        onChange={setForm}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        saving={createItem.isPending || updateItem.isPending}
      />

      <ConfirmDialog
        open={deleteId != null}
        title="删除心愿"
        message="确定要删除这个心愿吗？"
        confirmText="删除"
        danger
        onConfirm={() => { if (deleteId != null) { deleteItem.mutate(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
