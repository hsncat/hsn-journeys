import { useState } from 'react';
import { changePassword } from '../api';
import { toast } from './Toast';

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast('两次新密码不一致', 'error');
      return;
    }
    if (newPw.length < 8) {
      toast('新密码至少 8 位', 'error');
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPw, newPw);
      toast('密码已更新', 'success');
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : '修改失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog">
        <h2>修改密码</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>当前密码</label>
            <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} required autoFocus />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>新密码（至少 8 位）</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>再次输入新密码</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
