import type { Context } from 'hono';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function extFromType(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    case 'image/avif': return 'avif';
    default: return 'jpg';
  }
}

export async function uploadPhoto(c: Context) {
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file provided' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: `Unsupported image type: ${file.type}` }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: 'File too large (max 10MB)' }, 400);
  }

  const ext = extFromType(file.type);
  const key = `photos/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await c.env.PHOTOS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const publicUrl = `${c.env.PHOTOS_BUCKET_URL || 'https://pub-08378121a6644010ad56329bee93b880.r2.dev'}/${key}`;

  return c.json({ key, url: publicUrl }, 201);
}

export async function deletePhoto(c: Context) {
  const key = decodeURIComponent(c.req.param('key')!);

  try {
    await c.env.PHOTOS.delete(key);
    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
}
