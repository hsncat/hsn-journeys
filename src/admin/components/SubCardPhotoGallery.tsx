import { useRef, useState } from 'react';
import { uploadPhoto } from '../api';
import { toast } from './Toast';
import { compressImageToUnder500KB, isSupportedUploadImage } from '../lib/imageCompression';

interface Props {
  photos: string[];
  cover: string | null;
  folder: string;
  onChange: (photos: string[], cover: string | null, syncJourneyCover?: boolean, saveNow?: boolean) => void;
}

export default function SubCardPhotoGallery({ photos, cover, folder, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const didDragRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const normalized = normalizePhotos(photos, cover);
  const coverKey = cover || normalized[0] || null;
  const previewKey = previewIndex === null ? null : normalized[previewIndex] ?? null;

  const handleFiles = async (files: FileList | null) => {
    const selected = Array.from(files ?? []).filter(isSupportedUploadImage);
    if (selected.length === 0) {
      toast('请选择 JPG 或 HEIC 照片', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: selected.length });
    try {
      const uploaded: string[] = [];
      let failed = 0;
      let workingPhotos = normalized;
      let workingCover = coverKey;

      for (const file of selected) {
        try {
          const compressed = await compressImageToUnder500KB(file);
          const key = await uploadPhoto(compressed, folder);
          uploaded.push(key);
          workingCover = workingCover || key;
          workingPhotos = normalizePhotos([...workingPhotos, key], workingCover);
          onChange(workingPhotos, workingCover, false);
        } catch {
          failed += 1;
        } finally {
          setUploadProgress({ done: uploaded.length + failed, total: selected.length });
        }
      }

      onChange(workingPhotos, workingCover, !coverKey && Boolean(workingCover), true);
      if (uploaded.length === 0) {
        toast('照片上传失败，请换一张图片再试', 'error');
      } else if (failed > 0) {
        toast(`已上传 ${uploaded.length} 张，${failed} 张失败`, 'error');
      } else {
        toast(`照片已上传 ${uploaded.length} 张`, 'success');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : '上传失败', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openPreview = (key: string) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    const index = normalized.findIndex(photo => photo === key);
    setPreviewIndex(index >= 0 ? index : 0);
  };

  const reorderPhotos = (sourceKey: string, targetKey: string) => {
    if (sourceKey === targetKey) return;
    const sourceIndex = normalized.findIndex(photo => photo === sourceKey);
    const targetIndex = normalized.findIndex(photo => photo === targetKey);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...normalized];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next, coverKey, false, true);
  };

  const nextPreview = () => {
    if (normalized.length === 0) return;
    setPreviewIndex(index => index === null ? 0 : (index + 1) % normalized.length);
  };

  const setSubCover = (key: string) => {
    onChange(normalized, key, false, true);
    toast('已设置为子卡片封面', 'success');
  };

  const setJourneyCover = (key: string) => {
    onChange(normalized, key, true, true);
    toast('已设为封面，并同步到一级卡片', 'success');
  };

  const removePhoto = (key: string) => {
    const next = normalized.filter(photo => photo !== key);
    onChange(next, coverKey === key ? (next[0] ?? null) : coverKey, false, true);
    if (previewKey === key) setPreviewIndex(null);
  };

  return (
    <div className="sub-photo-gallery">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.heic,.heif,image/jpeg,image/heic,image/heif"
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {normalized.length === 0 ? (
        <button type="button" className="sub-photo-empty" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading && uploadProgress ? `上传中 ${uploadProgress.done}/${uploadProgress.total}` : '点击上传照片'}
        </button>
      ) : (
        <div className="sub-photo-grid-wrap">
          <div className="sub-photo-toolbar">
            <span>已上传 {normalized.length} 张</span>
          </div>
          <div className="sub-photo-grid">
            {normalized.map(key => (
              <figure
                className={`sub-photo-tile ${draggingKey === key ? 'is-dragging' : ''} ${dragOverKey === key && draggingKey !== key ? 'is-drag-over' : ''}`}
                key={key}
                draggable={!uploading}
                onDragStart={e => {
                  didDragRef.current = true;
                  setDraggingKey(key);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', key);
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverKey(key);
                }}
                onDragLeave={() => setDragOverKey(current => current === key ? null : current)}
                onDrop={e => {
                  e.preventDefault();
                  const sourceKey = e.dataTransfer.getData('text/plain') || draggingKey;
                  if (sourceKey) reorderPhotos(sourceKey, key);
                  setDraggingKey(null);
                  setDragOverKey(null);
                }}
                onDragEnd={() => {
                  setDraggingKey(null);
                  setDragOverKey(null);
                  window.setTimeout(() => { didDragRef.current = false; }, 0);
                }}
              >
                <button type="button" className="sub-photo-preview" onClick={() => openPreview(key)}>
                  <img src={`/r2/${key}`} alt="" loading="lazy" />
                </button>
                {coverKey === key && <figcaption>封面</figcaption>}
                <div className="sub-photo-actions">
                  <button type="button" onClick={() => setSubCover(key)}>设置为子卡片封面</button>
                  <button type="button" onClick={() => setJourneyCover(key)}>设为封面</button>
                  <button type="button" className="danger" onClick={() => removePhoto(key)}>移除</button>
                </div>
              </figure>
            ))}
            <button
              type="button"
              className="sub-photo-add-tile"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading && uploadProgress ? `上传中 ${uploadProgress.done}/${uploadProgress.total}` : '+ 添加照片'}
            </button>
          </div>
          {uploading && uploadProgress && (
            <div className="sub-photo-progress" role="status" aria-live="polite">
              <span>上传中 {uploadProgress.done}/{uploadProgress.total}</span>
              <div>
                <i style={{ width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
      {previewKey && (
        <div className="photo-lightbox" onClick={() => setPreviewIndex(null)}>
          <button type="button" className="photo-lightbox-close" onClick={() => setPreviewIndex(null)}>关闭</button>
          {normalized.length > 1 && (
            <button
              type="button"
              className="photo-lightbox-next"
              onClick={e => {
                e.stopPropagation();
                nextPreview();
              }}
            >
              下一张
            </button>
          )}
          <img className="photo-lightbox-main" src={`/r2/${previewKey}`} alt="" />
          {normalized.length > 1 && (
            <div className="photo-lightbox-strip" onClick={e => e.stopPropagation()}>
              {normalized.map((key, index) => (
                <button
                  type="button"
                  key={key}
                  className={index === previewIndex ? 'is-active' : ''}
                  onClick={() => setPreviewIndex(index)}
                >
                  <img src={`/r2/${key}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function normalizePhotos(photos: string[], cover: string | null): string[] {
  const list = photos.map(s => String(s).trim()).filter(Boolean);
  if (cover && !list.includes(cover)) list.unshift(cover);
  return [...new Set(list)];
}
