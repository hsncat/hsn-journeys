// ============================================================
// DeployButton — triggers site rebuild via POST /api/trigger-deploy
// ============================================================
import { useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';

export default function DeployButton() {
  const [loading, setLoading] = useState(false);

  async function handleDeploy() {
    setLoading(true);
    try {
      await api.post('/trigger-deploy');
      toast.success('部署成功！网站正在重新构建。');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '部署失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDeploy}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          部署中...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          部署更新
        </>
      )}
    </button>
  );
}
