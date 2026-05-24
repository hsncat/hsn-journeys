import { useRef, useState } from 'react';
import { uploadPhoto } from '../api';
import { toast } from './Toast';
import { compressImageToUnder500KB } from '../lib/imageCompression';

interface Props {
  photos: string[];
  cover: string | null;
  folder: string;
  onChange: (photos: string[], cover: string | null, syncJourneyCover?: boolean) => void;
}

export default function SubCardPhotoGallery({ photos, cover, folder, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const normalized = normalizePhotos(photos, cover);
  const coverKey = cover || normalized[0] || null;
  const previewKey = previewIndex === null ? null : normalized[previewIndex] ?? null;

  const handleFiles = async (files: FileList | null) => {
    const selected = Array.from(files ?? []).filter(file => file.type.startsWith('image/'));
    if (selected.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const compressed = await compressImageToUnder500KB(file);
        uploaded.push(await uploadPhoto(compressed, folder));
      }
      const nextCover = coverKey || uploaded[0] || null;
      const next = normalizePhotos([...normalized, ...uploaded], nextCover);
      onChange(next, nextCover, !coverKey && Boolean(nextCover));
      toast('照片已上传', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '上传失败', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openPreview = (key: string) => {
    const index = normalized.findIndex(photo => photo === key);
    setPreviewIndex(index >= 0 ? index : 0);
  };

  const nextPreview = () => {
    if (normalized.length === 0) return;
    setPreviewIndex(index => index === null ? 0 : (index + 1) % normalized.length);
  };

  const setSubCover = (key: string) => {
    onChange(normalized, key, false);
    toast('已设置为子卡片封面', 'success');
  };

  const setJourneyCover = (key: string) => {
    onChange(normalized, key, true);
    toast('已设为封面，并同步到一级卡片', 'success');
  };

  const removePhoto = (key: string) => {
    const next = normalized.filter(photo => photo !== key);
    onChange(next, coverKey === key ? (next[0] ?? null) : coverKey, false);
    if (previewKey === key) setPreviewIndex(null);
  };

  return (
    <div className="sub-photo-gallery">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {normalized.length === 0 ? (
        <button type="button" className="sub-photo-empty" onClick={() => inputRef.current?.click()}>
          点击上传照片
        </button>
      ) : (
        <div className="sub-photo-grid">
          {normalized.map(key => (
            <figure className="sub-photo-tile" key={key}>
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
            {uploading ? '上传中...' : '+ 添加照片'}
          </button>
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
