import { useRef, useState } from 'react';
import { uploadPhoto } from '../api';
import { toast } from './Toast';

interface Props {
  photos: string[];
  cover: string | null;
  folder: string;
  onChange: (photos: string[], cover: string | null, syncJourneyCover?: boolean) => void;
}

export default function SubCardPhotoGallery({ photos, cover, folder, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const normalized = normalizePhotos(photos, cover);
  const coverKey = cover || normalized[0] || null;

  const handleFiles = async (files: FileList | null) => {
    const selected = Array.from(files ?? []).filter(file => file.type.startsWith('image/'));
    if (selected.length === 0) return;
    const available = 10 - normalized.length;
    if (available <= 0) {
      toast('最多上传 10 张照片', 'error');
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected.slice(0, available)) {
        uploaded.push(await uploadPhoto(file, folder));
      }
      const nextCover = coverKey || uploaded[0] || null;
      const next = normalizePhotos([...normalized, ...uploaded], nextCover);
      onChange(next, nextCover, false);
      toast('照片已上传', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '上传失败', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setSubCover = (key: string) => {
    onChange(normalized, key, false);
    toast('已设置为子卡片封面', 'success');
  };

  const setJourneyCover = (key: string) => {
    onChange(normalized, key, true);
    toast('已设为封面，保存后同步到一级卡片', 'success');
  };

  const removePhoto = (key: string) => {
    const next = normalized.filter(photo => photo !== key);
    onChange(next, coverKey === key ? (next[0] ?? null) : coverKey, false);
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
          点击上传原图
        </button>
      ) : (
        <div className="sub-photo-grid">
          {normalized.map(key => (
            <figure className="sub-photo-tile" key={key}>
              <button type="button" className="sub-photo-preview" onClick={() => setPreview(key)}>
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
          {normalized.length < 10 && (
            <button
              type="button"
              className="sub-photo-add-tile"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '+ 添加照片'}
            </button>
          )}
        </div>
      )}
      {preview && (
        <div className="photo-lightbox" onClick={() => setPreview(null)}>
          <button type="button" className="photo-lightbox-close" onClick={() => setPreview(null)}>关闭</button>
          <img src={`/r2/${preview}`} alt="" />
        </div>
      )}
    </div>
  );
}

function normalizePhotos(photos: string[], cover: string | null): string[] {
  const list = photos.map(s => String(s).trim()).filter(Boolean);
  if (cover && !list.includes(cover)) list.unshift(cover);
  return [...new Set(list)].slice(0, 10);
}
