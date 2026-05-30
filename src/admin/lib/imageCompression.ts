const MAX_IMAGE_BYTES = 500 * 1024;

export async function compressImageToUnder500KB(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= MAX_IMAGE_BYTES && file.type === 'image/jpeg') return file;

  const bitmap = await loadImage(file);
  let maxSide = Math.min(Math.max(bitmap.width, bitmap.height), 1800);
  let quality = 0.82;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 22; attempt++) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await drawToJpeg(bitmap, width, height, quality);
    if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    if (blob.size <= MAX_IMAGE_BYTES) {
      return toJpegFile(blob, file.name);
    }

    if (quality > 0.48) {
      quality -= 0.08;
    } else {
      maxSide = Math.max(420, Math.round(maxSide * 0.76));
      quality = 0.72;
    }
  }

  if (bestBlob && bestBlob.size <= MAX_IMAGE_BYTES) {
    return toJpegFile(bestBlob, file.name);
  }

  for (const side of [360, 320, 280, 240, 200, 160]) {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    for (const q of [0.42, 0.34, 0.28, 0.22]) {
      const blob = await drawToJpeg(bitmap, width, height, q);
      if (blob.size <= MAX_IMAGE_BYTES) return toJpegFile(blob, file.name);
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    }
  }

  if (bestBlob && bestBlob.size <= MAX_IMAGE_BYTES) return toJpegFile(bestBlob, file.name);
  throw new Error('image_compress_too_large');
}

function toJpegFile(blob: Blob, originalName: string): File {
  return new File([blob], originalName.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image_load_failed'));
    };
    img.src = url;
  });
}

function drawToJpeg(img: HTMLImageElement, width: number, height: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('canvas_context_failed'));
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas_to_blob_failed')), 'image/jpeg', quality);
  });
}
