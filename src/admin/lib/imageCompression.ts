const MAX_IMAGE_BYTES = 500 * 1024;

export function isSupportedUploadImage(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return type === 'image/jpeg'
    || type === 'image/jpg'
    || type === 'image/heic'
    || type === 'image/heif'
    || /\.(jpe?g|heic|heif)$/.test(name);
}

export async function compressImageToUnder500KB(file: File): Promise<File> {
  if (!isSupportedUploadImage(file)) throw new Error('unsupported_image_format');

  const source = isHeicFile(file) ? await heicToJpeg(file) : file;
  if (source.size <= MAX_IMAGE_BYTES && source.type === 'image/jpeg') return source;

  const bitmap = await loadImage(source);
  let maxSide = Math.min(Math.max(bitmap.width, bitmap.height), 1800);
  let quality = 0.82;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 22; attempt++) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await drawToJpeg(bitmap, width, height, quality);
    if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    if (blob.size <= MAX_IMAGE_BYTES) return toJpegFile(blob, file.name);

    if (quality > 0.48) {
      quality -= 0.08;
    } else {
      maxSide = Math.max(420, Math.round(maxSide * 0.76));
      quality = 0.72;
    }
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

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return type === 'image/heic' || type === 'image/heif' || /\.(heic|heif)$/.test(name);
}

async function heicToJpeg(file: File): Promise<File> {
  try {
    const mod = await import(/* @vite-ignore */ 'https://esm.sh/heic2any@0.0.4');
    const convert = (mod.default ?? mod) as (options: { blob: Blob; toType: string; quality?: number }) => Promise<Blob | Blob[]>;
    const result = await convert({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    return toJpegFile(blob, file.name);
  } catch {
    if (file.size <= MAX_IMAGE_BYTES) {
      return new File([file], file.name, { type: file.type || 'image/heic' });
    }
    throw new Error('heic_convert_failed');
  }
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
