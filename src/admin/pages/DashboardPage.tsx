// ============================================================
// DashboardPage — stats overview + quick actions
// ============================================================
import { Link } from 'react-router-dom';
import { useJourneys } from '../hooks/useJourneys';
import { useWishlist } from '../hooks/useWishlist';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { sumCosts } from '../../lib/journey-helpers';
import type { PageStats } from '../types';
import DeployButton from '../components/DeployButton';

export default function DashboardPage() {
  const { data: journeys, isLoading: journeysLoading } = useJourneys();
  const { data: wishlist } = useWishlist();
  const { data: stats } = useQuery<PageStats>({
    queryKey: ['stats'],
    queryFn: () => api.get<PageStats>('/stats'),
  });

  const totalCost = journeys?.reduce((sum, j) => sum + sumCosts(j.costs), 0) ?? 0;

  const statCards = [
    { label: '旅程总数', value: stats?.journeyCount ?? journeys?.length ?? '...' },
    { label: '城市数量', value: stats?.cityCount ?? '...' },
    { label: '心愿单数量', value: wishlist?.length ?? '...' },
    { label: '总费用', value: `¥${totalCost.toLocaleString()}` },
  ];

  const recentJourneys = journeys?.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">仪表盘</h2>
          <p className="text-sm text-zinc-500 mt-1">HSN Journey Traces 管理概览</p>
        </div>
        <DeployButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {journeysLoading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : recentJourneys && recentJourneys.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">最近旅程</h3>
            <Link to="/admin/journeys" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              查看全部
            </Link>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500">旅程</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">城市</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">日期</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500">费用</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {recentJourneys.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-750 cursor-pointer"
                    onClick={() => window.location.href = `/admin/journeys/${j.id}`}
                  >
                    <td className="px-4 py-3">
                      <Link to={`/admin/journeys/${j.id}`} className="flex items-center gap-2">
                        <span>{j.emoji}</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{j.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{j.city}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{j.date}</td>
                    <td className="px-4 py-3 text-right text-zinc-500">¥{sumCosts(j.costs).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500 mb-4">还没有旅程数据</p>
          <Link
            to="/admin/journeys/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加第一条旅程
          </Link>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to="/admin/journeys/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加旅程
        </Link>
        <Link
          to="/admin/wishlist"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
        >
          管理心愿单
        </Link>
      </div>
    </div>
  );
}
