const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export async function compressImageToUnder2MB(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= MAX_IMAGE_BYTES && file.type === 'image/jpeg') return file;

  const bitmap = await loadImage(file);
  let maxSide = Math.min(Math.max(bitmap.width, bitmap.height), 2400);
  let quality = 0.86;

  for (let attempt = 0; attempt < 14; attempt++) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await drawToJpeg(bitmap, width, height, quality);
    if (blob.size <= MAX_IMAGE_BYTES || attempt === 13) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    }
    if (quality > 0.58) {
      quality -= 0.08;
    } else {
      maxSide = Math.max(900, Math.round(maxSide * 0.82));
      quality = 0.76;
    }
  }

  return file;
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
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas_to_blob_failed')), 'image/jpeg', quality);
  });
}
