// ============================================================
// PackingListPage — manage packing categories and items
// ============================================================
import { useState } from 'react';
import {
  usePacking,
  useCreatePackingCategory,
  useUpdatePackingCategory,
  useDeletePackingCategory,
  useCreatePackingItem,
  useUpdatePackingItem,
  useDeletePackingItem,
} from '../hooks/usePacking';
import type { PackingCategory, PackingItem } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function PackingListPage() {
  const { data, isLoading } = usePacking();
  const createCategory = useCreatePackingCategory();
  const updateCategory = useUpdatePackingCategory();
  const deleteCategory = useDeletePackingCategory();
  const createItem = useCreatePackingItem();
  const updateItem = useUpdatePackingItem();
  const deleteItem = useDeletePackingItem();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);

  const [newItemText, setNewItemText] = useState<Record<number, string>>({});
  const [newItemNote, setNewItemNote] = useState<Record<number, string>>({});
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');
  const [editItemNote, setEditItemNote] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    createCategory.mutate(
      { name: newCategoryName.trim() },
      { onSuccess: () => setNewCategoryName('') },
    );
  }

  function handleRenameCategory() {
    if (editCatId == null || !editCatName.trim()) return;
    updateCategory.mutate(
      { id: editCatId, data: { name: editCatName.trim() } },
      { onSuccess: () => setEditCatId(null) },
    );
  }

  function handleAddItem(catId: number) {
    const text = newItemText[catId]?.trim();
    if (!text) return;
    createItem.mutate(
      { categoryId: catId, item: text, note: newItemNote[catId]?.trim() || '', checked: false, sortOrder: 0 },
      {
        onSuccess: () => {
          setNewItemText((prev) => ({ ...prev, [catId]: '' }));
          setNewItemNote((prev) => ({ ...prev, [catId]: '' }));
        },
      },
    );
  }

  function handleUpdateItem() {
    if (editItemId == null || !editItemText.trim()) return;
    updateItem.mutate(
      { id: editItemId, data: { item: editItemText.trim(), note: editItemNote.trim() } },
      { onSuccess: () => setEditItemId(null) },
    );
  }

  function toggleChecked(item: PackingItem) {
    updateItem.mutate({ id: item.id, data: { checked: !item.checked } });
  }

  const categories = data?.categories ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">打包清单</h2>
          <p className="text-sm text-zinc-500 mt-1">{categories.length} 个分类</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
          placeholder="新分类名称"
          className="flex-1 max-w-xs px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加分类
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">加载中...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-500">还没有打包分类</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat: PackingCategory) => (
            <div key={cat.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                {editCatId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCategory(); }}
                      autoFocus
                      className="flex-1 max-w-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button onClick={handleRenameCategory} className="p-1 text-green-600 hover:text-green-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button onClick={() => setEditCatId(null)} className="p-1 text-zinc-400 hover:text-zinc-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {cat.name}{' '}
                      <span className="text-sm text-zinc-400 font-normal">
                        ({cat.items?.filter((i: PackingItem) => i.checked).length ?? 0}/{cat.items?.length ?? 0})
                      </span>
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); }}
                        className="p-1 text-zinc-400 hover:text-blue-600 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteCatId(cat.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {cat.items?.map((item: PackingItem) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                    />
                    {editItemId === item.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editItemText}
                          onChange={(e) => setEditItemText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateItem(); }}
                          autoFocus
                          className="flex-1 max-w-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={editItemNote}
                          onChange={(e) => setEditItemNote(e.target.value)}
                          placeholder="备注"
                          className="flex-1 max-w-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button onClick={handleUpdateItem} className="p-1 text-green-600 hover:text-green-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button onClick={() => setEditItemId(null)} className="p-1 text-zinc-400 hover:text-zinc-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {item.item}
                        </span>
                        {item.note && <span className="text-xs text-zinc-400">{item.note}</span>}
                        <div className="hidden group-hover:flex gap-1">
                          <button
                            onClick={() => { setEditItemId(item.id); setEditItemText(item.item); setEditItemNote(item.note ?? ''); }}
                            className="p-1 text-zinc-400 hover:text-blue-600 rounded transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteItemId(item.id)}
                            className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                  <input
                    type="text"
                    value={newItemText[cat.id] ?? ''}
                    onChange={(e) => setNewItemText((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(cat.id); }}
                    placeholder="新物品名称"
                    className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={newItemNote[cat.id] ?? ''}
                    onChange={(e) => setNewItemNote((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(cat.id); }}
                    placeholder="备注"
                    className="w-24 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAddItem(cat.id)}
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteCatId != null}
        title="删除分类"
        message="确定要删除这个分类及其所有物品吗？"
        confirmText="删除"
        danger
        onConfirm={() => { if (deleteCatId != null) { deleteCategory.mutate(deleteCatId); setDeleteCatId(null); } }}
        onCancel={() => setDeleteCatId(null)}
      />
      <ConfirmDialog
        open={deleteItemId != null}
        title="删除物品"
        message="确定要删除这个物品吗？"
        confirmText="删除"
        danger
        onConfirm={() => { if (deleteItemId != null) { deleteItem.mutate(deleteItemId); setDeleteItemId(null); } }}
        onCancel={() => setDeleteItemId(null)}
      />
    </div>
  );
}
