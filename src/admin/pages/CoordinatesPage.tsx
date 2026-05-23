// ============================================================
// CoordinatesPage — manage map coordinates
// ============================================================
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { CityCoordinate } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

interface CoordForm {
  name: string;
  country: string;
  lat: string;
  lng: string;
  type: 'domestic' | 'international';
}

const emptyCoord: CoordForm = { name: '', country: '', lat: '', lng: '', type: 'domestic' };

export default function CoordinatesPage() {
  const qc = useQueryClient();
  const { data: coords, isLoading } = useQuery<CityCoordinate[]>({
    queryKey: ['coordinates'],
    queryFn: () => api.get<CityCoordinate[]>('/coordinates'),
  });

  const createCoord = useMutation({
    mutationFn: (data: CityCoordinate) => api.post<{ id: number }>('/coordinates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coordinates'] }),
  });
  const updateCoord = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CityCoordinate> }) =>
      api.put<{ ok: boolean }>(`/coordinates/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coordinates'] }),
  });
  const deleteCoord = useMutation({
    mutationFn: (id: number) => api.del(`/coordinates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coordinates'] }),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CoordForm>(emptyCoord);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  function openCreate() {
    setEditId(null);
    setForm(emptyCoord);
    setModalOpen(true);
  }

  function openEdit(c: CityCoordinate) {
    setEditId(c.id);
    setForm({ name: c.name, country: c.country, lat: String(c.lat), lng: String(c.lng), type: c.type });
    setModalOpen(true);
  }

  function handleSave() {
    const payload = {
      name: form.name,
      country: form.country,
      lat: Number(form.lat),
      lng: Number(form.lng),
      type: form.type,
    };
    if (editId != null) {
      updateCoord.mutate(
        { id: editId, data: payload },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createCoord.mutate(payload as CityCoordinate, { onSuccess: () => setModalOpen(false) });
    }
  }

  const filtered = coords?.filter((c: CityCoordinate) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
  }) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">地图坐标</h2>
          <p className="text-sm text-zinc-500 mt-1">共 {coords?.length ?? 0} 个坐标</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加坐标
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索城市或国家..."
        className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500">暂无坐标数据</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">城市</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">国家</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">纬度</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">经度</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500">类型</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {filtered.map((c: CityCoordinate) => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-750">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{c.country}</td>
                  <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs">{c.lat.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs">{c.lng.toFixed(4)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      c.type === 'domestic'
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {c.type === 'domestic' ? '国内' : '国外'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editId != null ? '编辑坐标' : '添加坐标'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">城市名称</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">国家</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">纬度</label>
                <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">经度</label>
                <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">类型</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'domestic' | 'international' })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="domestic">国内</option>
                  <option value="international">国外</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                取消
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.lat || !form.lng}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="删除坐标"
        message="确定要删除这个坐标吗？"
        confirmText="删除"
        danger
        onConfirm={() => { if (deleteId != null) { deleteCoord.mutate(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
