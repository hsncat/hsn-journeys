import { useState } from 'react';
import type { PackingRow } from '@/server/db';

interface Props {
  initialItems: PackingRow[];
}

const blankItem = (sortOrder: number): Partial<PackingRow> => ({
  category: '全部',
  item: '',
  note: '',
  is_overseas_only: 0,
  sort_order: sortOrder,
});

async function packingRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (res.status === 401) throw new Error('请先登录后台后再编辑行李清单');
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `保存失败 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export default function PackingListEditor({ initialItems }: Props) {
  const [items, setItems] = useState<PackingRow[]>(initialItems);
  const [draft, setDraft] = useState<Partial<PackingRow>>(() => blankItem(initialItems.length));
  const [busyId, setBusyId] = useState<number | 'new' | null>(null);
  const [message, setMessage] = useState('');

  const updateItem = <K extends keyof PackingRow>(id: number, key: K, value: PackingRow[K]) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item));
  };

  const saveItem = async (item: PackingRow) => {
    if (!item.item.trim()) {
      setMessage('项目不能为空');
      return;
    }
    setBusyId(item.id);
    setMessage('');
    try {
      const result = await packingRequest<{ item: PackingRow }>(`/api/packing/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...item,
          item: item.item.trim(),
          note: item.note?.trim() || null,
        }),
      });
      setItems(prev => prev.map(row => row.id === item.id ? result.item : row));
      setMessage('已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    } finally {
      setBusyId(null);
    }
  };

  const addItem = async () => {
    if (!draft.item?.trim()) {
      setMessage('项目不能为空');
      return;
    }
    setBusyId('new');
    setMessage('');
    try {
      const result = await packingRequest<{ item: PackingRow }>('/api/packing', {
        method: 'POST',
        body: JSON.stringify({
          category: draft.category || '全部',
          item: draft.item.trim(),
          note: draft.note?.trim() || null,
          is_overseas_only: draft.is_overseas_only ?? 0,
          sort_order: items.length,
        }),
      });
      setItems(prev => [...prev, result.item]);
      setDraft(blankItem(items.length + 1));
      setMessage('已添加');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '添加失败');
    } finally {
      setBusyId(null);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('删除这一项？')) return;
    setBusyId(id);
    setMessage('');
    try {
      await packingRequest<{ ok: boolean }>(`/api/packing/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
      setMessage('已删除');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '删除失败');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="packing-editor">
      <div className="packing-table-wrap">
        <table className="packing-table">
          <thead>
            <tr>
              <th>项目</th>
              <th>备注</th>
              <th>出国</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td>
                  <input
                    className="packing-input"
                    value={p.item}
                    aria-label="行李项目"
                    onChange={e => updateItem(p.id, 'item', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="packing-input"
                    value={p.note ?? ''}
                    aria-label="备注"
                    onChange={e => updateItem(p.id, 'note', e.target.value || null)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={p.is_overseas_only === 1}
                    aria-label="仅出国携带"
                    onChange={e => updateItem(p.id, 'is_overseas_only', e.target.checked ? 1 : 0)}
                  />
                </td>
                <td>
                  <div className="packing-actions">
                    <button type="button" onClick={() => saveItem(p)} disabled={busyId === p.id}>
                      {busyId === p.id ? '保存中' : '保存'}
                    </button>
                    <button type="button" className="danger" onClick={() => deleteItem(p.id)} disabled={busyId === p.id}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="packing-new-row">
              <td>
                <input
                  className="packing-input"
                  value={draft.item ?? ''}
                  placeholder="新增项目"
                  aria-label="新增行李项目"
                  onChange={e => setDraft(prev => ({ ...prev, item: e.target.value }))}
                />
              </td>
              <td>
                <input
                  className="packing-input"
                  value={draft.note ?? ''}
                  placeholder="备注"
                  aria-label="新增备注"
                  onChange={e => setDraft(prev => ({ ...prev, note: e.target.value }))}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={draft.is_overseas_only === 1}
                  aria-label="新增项目仅出国携带"
                  onChange={e => setDraft(prev => ({ ...prev, is_overseas_only: e.target.checked ? 1 : 0 }))}
                />
              </td>
              <td>
                <div className="packing-actions">
                  <button type="button" onClick={addItem} disabled={busyId === 'new'}>
                    {busyId === 'new' ? '添加中' : '+ 添加'}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {message && <p className="packing-message" role="status">{message}</p>}
    </div>
  );
}
