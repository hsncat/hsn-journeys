import { useEffect, useRef, useState } from 'react';
import { uploadPhoto } from '../api';
import { toast } from './Toast';
import { compressImageToUnder500KB, imageUploadErrorMessage, isSupportedUploadImage } from '../lib/imageCompression';

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  folder?: string;
}

export default function PhotoUploader({ value, onChange, folder = 'journeys' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(Date.now());

  useEffect(() => {
    setPreviewVersion(Date.now());
  }, [value]);

  const handleFile = async (file: File) => {
    if (!isSupportedUploadImage(file)) {
      toast('请选择 JPG 或 HEIC 照片', 'error');
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImageToUnder500KB(file);
      const key = await uploadPhoto(compressed, folder);
      onChange(key);
      toast('上传成功', 'success');
    } catch (err) {
      toast(imageUploadErrorMessage(err), 'error');
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
        accept=".jpg,.jpeg,.heic,.heif,image/jpeg,image/heic,image/heif"
        hidden
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {uploading ? (
        <div className="upload-hint">上传中...</div>
      ) : value ? (
        <>
          <button
            type="button"
            className="photo-uploader-preview"
            onClick={e => {
              e.stopPropagation();
              setPreviewOpen(true);
            }}
          >
            <img src={`/r2/${value}?v=${previewVersion}`} alt="" />
          </button>
          {previewOpen && (
            <div className="photo-lightbox" onClick={e => { e.stopPropagation(); setPreviewOpen(false); }}>
              <button type="button" className="photo-lightbox-close" onClick={() => setPreviewOpen(false)}>关闭</button>
              <img className="photo-lightbox-main" src={`/r2/${value}?v=${previewVersion}`} alt="" />
            </div>
          )}
          <button
            type="button"
            className="photo-uploader-replace"
            onClick={e => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={uploading}
          >
            替换照片
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 40, color: 'var(--color-text-faint)' }}>📷</div>
          <div className="upload-hint" style={{ marginTop: 8 }}>
            点击或拖拽图片到此处<br />
            <small style={{ color: 'var(--color-text-faint)' }}>支持 JPG / HEIC，自动压缩到 500KB 以内</small>
          </div>
        </>
      )}
    </div>
  );
}
