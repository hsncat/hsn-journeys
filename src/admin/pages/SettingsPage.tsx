// ============================================================
// SettingsPage — key-value editor + stats + deploy
// ============================================================
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { PageStats } from '../types';
import DeployButton from '../components/DeployButton';

export default function SettingsPage() {
  const { data: stats } = useQuery<PageStats>({
    queryKey: ['stats'],
    queryFn: () => api.get<PageStats>('/stats'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">设置</h2>
          <p className="text-sm text-zinc-500 mt-1">站点配置与数据概览</p>
        </div>
        <DeployButton />
      </div>

      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">数据概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-500">旅程</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats?.journeyCount ?? '...'}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-500">城市</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats?.cityCount ?? '...'}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-500">国家</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats?.countryCount ?? '...'}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-500">照片</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats?.photoCount ?? '...'}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-sm text-zinc-500">总费用</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats ? `¥${stats.totalCost.toLocaleString()}` : '...'}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">站点信息</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">站点名称</label>
            <input
              type="text"
              defaultValue="HSN Journey Traces"
              readOnly
              className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">站点描述</label>
            <input
              type="text"
              defaultValue="记录美好生活，探索世界的每一步"
              readOnly
              className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">主题</label>
            <select
              defaultValue="auto"
              className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
                else if (val === 'light') document.documentElement.removeAttribute('data-theme');
                else {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) document.documentElement.setAttribute('data-theme', 'dark');
                  else document.documentElement.removeAttribute('data-theme');
                }
              }}
            >
              <option value="auto">自动（跟随系统）</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">部署管理</h3>
        <p className="text-sm text-zinc-500">
          修改内容保存后，需要触发部署才能在网站上生效。部署会将最新数据构建为静态站点并发布。
        </p>
        <DeployButton />
      </section>
    </div>
  );
}
