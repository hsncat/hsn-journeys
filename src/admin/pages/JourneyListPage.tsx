// ============================================================
// JourneyListPage — data table of all journeys
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJourneys, useDeleteJourney } from '../hooks/useJourneys';
import { sumCosts } from '../../lib/journey-helpers';
import type { Journey } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function JourneyListPage() {
  const { data: journeys, isLoading, error } = useJourneys();
  const deleteJourney = useDeleteJourney();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = journeys?.filter((j: Journey) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.city.toLowerCase().includes(q) ||
      j.country.toLowerCase().includes(q) ||
      j.province.toLowerCase().includes(q)
    );
  }) ?? [];

  function handleDelete() {
    if (deleteId == null) return;
    deleteJourney.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">旅程管理</h2>
          <p className="text-sm text-zinc-500 mt-1">共 {journeys?.length ?? 0} 条旅程</p>
        </div>
        <Link
          to="/admin/journeys/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加旅程
        </Link>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索旅程标题、城市、国家..."
          className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">加载失败: {(error as Error).message}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500 mb-4">
            {journeys?.length === 0 ? '还没有旅程数据' : '没有匹配的旅程'}
          </p>
          {journeys?.length === 0 && (
            <Link
              to="/admin/journeys/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              添加旅程
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 w-12">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500">旅程</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">城市</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden lg:table-cell">国家</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">日期</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500">费用</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 w-20">子卡片</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {filtered.map((j: Journey) => (
                  <tr
                    key={j.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-750 cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('a')) return;
                      window.location.href = `/admin/journeys/${j.id}`;
                    }}
                  >
                    <td className="px-4 py-3 text-zinc-400 text-xs">{j.id}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/journeys/${j.id}`} className="flex items-center gap-2 hover:text-blue-600">
                        <span className="text-lg">{j.emoji}</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{j.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{j.city}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">{j.country}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{j.date}</td>
                    <td className="px-4 py-3 text-right text-zinc-500">¥{sumCosts(j.costs).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{j.subCards?.length || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(j.id); }}
                        className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="删除旅程"
        message="确定要删除这条旅程吗？此操作不可撤销。"
        confirmText="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
