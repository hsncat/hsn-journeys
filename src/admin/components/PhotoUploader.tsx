// ============================================================
// PhotoUploader — drag-and-drop photo upload with preview
// ============================================================
import React, { useState, useRef } from 'react';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { R2_PUBLIC_URL } from '../../lib/constants';
import ConfirmDialog from './ConfirmDialog';

interface PhotoUploaderProps {
  photoKey: string | null;
  photoUrl?: string;
  onUpload: (key: string, url: string) => void;
  onRemove: () => void;
}

export default function PhotoUploader({ photoKey, photoUrl, onUpload, onRemove }: PhotoUploaderProps) {
  const { uploadPhoto, uploading } = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUrl = photoKey && photoUrl
    ? (photoUrl.startsWith('data:') || photoUrl.startsWith('http') ? photoUrl : `${R2_PUBLIC_URL}/${photoKey}`)
    : null;

  async function handleFile(file: File) {
    setError(null);
    try {
      const result = await uploadPhoto(file);
      onUpload(result.key, result.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '上传失败');
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  if (currentUrl) {
    return (
      <div className="space-y-3">
        <div className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <img src={currentUrl} alt="Cover" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium bg-white text-zinc-800 rounded-lg hover:bg-zinc-100"
            >
              更换
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <ConfirmDialog
          open={confirmOpen}
          title="删除照片"
          message="确定要删除这张照片吗？"
          confirmText="删除"
          danger
          onConfirm={() => { onRemove(); setConfirmOpen(false); }}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
            : uploading
            ? 'border-zinc-300 bg-zinc-50 dark:bg-zinc-800'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">上传中...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-zinc-500">点击或拖拽上传照片</span>
            <span className="text-xs text-zinc-400">JPG/PNG, 最大 1600px, 自动压缩</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
