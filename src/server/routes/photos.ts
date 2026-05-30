import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';

const photos = new Hono<AppBindings>();
const MAX_ADMIN_PHOTO_BYTES = 500 * 1024;

// 上传：multipart/form-data，字段 file + optional folder
photos.post('/', requireAdmin, async (c) => {
  const ct = c.req.header('content-type') || '';
  if (!ct.includes('multipart/form-data')) {
    return c.json({ error: 'expect_multipart' }, 400);
  }
  const form = await c.req.formData();
  const file = form.get('file');
  const folder = (form.get('folder') as string | null) || 'journeys';

  if (!(file instanceof File)) return c.json({ error: 'missing_file' }, 400);
  if (file.size > MAX_ADMIN_PHOTO_BYTES) return c.json({ error: 'too_large_500kb' }, 413);
  if (!isAllowedPhoto(file)) return c.json({ error: 'not_image' }, 415);

  const ext = photoExtension(file);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = await file.arrayBuffer();
  await c.env.R2.put(key, buffer, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      uploaded_by: c.get('user')?.username ?? 'unknown',
      original_name: file.name,
    },
  });

  return c.json({ ok: true, key, url: `/r2/${key}` });
});

// 删除（管理员）
function isAllowedPhoto(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === 'image/jpeg'
    || type === 'image/jpg'
    || type === 'image/pjpeg'
    || type === 'image/heic'
    || type === 'image/heif'
    || /\.(jpe?g|heic|heif)$/.test(name);
}

function photoExtension(file: File): string {
  const type = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/pjpeg') return 'jpg';
  if (type === 'image/heic') return 'heic';
  if (type === 'image/heif') return 'heif';
  return ext && ['jpg', 'jpeg', 'heic', 'heif'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'jpg';
}

photos.delete('/:key{.+}', requireAdmin, async (c) => {
  const key = c.req.param('key');
  await c.env.R2.delete(key);
  return c.json({ ok: true });
});

export default photos;
