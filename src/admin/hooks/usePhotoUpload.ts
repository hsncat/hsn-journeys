// ============================================================
// Photo upload hook with client-side compression
// ============================================================
import { useState } from 'react';
import { api } from '../api';

interface UploadResult {
  key: string;
  url: string;
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1600;
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(file);
        return;
      }
      if (width > height) {
        height = Math.round((height / width) * maxDim);
        width = maxDim;
      } else {
        width = Math.round((width / height) * maxDim);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        0.8,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadPhoto(file: File): Promise<UploadResult> {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed, file.name || 'photo.jpg');
      const result = await api.upload<UploadResult>('/photos/upload', fd);
      return result;
    } finally {
      setUploading(false);
    }
  }

  return { uploadPhoto, uploading };
}
