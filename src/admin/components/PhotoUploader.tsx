import { useEffect, useRef, useState } from 'react';
import { uploadPhoto } from '../api';
import { toast } from './Toast';

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  folder?: string;
}

async function compressImage(file: File, maxW = 1600, quality = 0.8): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image_load_failed'));
      img.src = url;
    });
    const ratio = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas_to_blob_failed')), 'image/jpeg', quality);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoUploader({ value, onChange, folder = 'journeys' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(Date.now());

  useEffect(() => {
    setPreviewVersion(Date.now());
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('请选择图片文件', 'error');
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const blob = new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      const key = await uploadPhoto(blob, folder);
      onChange(key);
      toast('上传成功', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '上传失败', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className={`photo-uploader ${dragging ? 'dragging' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {uploading ? (
        <div className="upload-hint">上传中…</div>
      ) : value ? (
        <img src={`/r2/${value}?v=${previewVersion}`} alt="" />
      ) : (
        <>
          <div style={{ fontSize: 40, color: 'var(--color-text-faint)' }}>📷</div>
          <div className="upload-hint" style={{ marginTop: 8 }}>
            点击或拖拽图片到此处<br />
            <small style={{ color: 'var(--color-text-faint)' }}>会自动压缩到 1600px / JPEG</small>
          </div>
        </>
      )}
    </div>
  );
}
