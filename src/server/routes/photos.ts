import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';

const photos = new Hono<AppBindings>();

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
  if (file.size > 8 * 1024 * 1024) return c.json({ error: 'too_large' }, 413);
  if (!file.type.startsWith('image/')) return c.json({ error: 'not_image' }, 415);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
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
photos.delete('/:key{.+}', requireAdmin, async (c) => {
  const key = c.req.param('key');
  await c.env.R2.delete(key);
  return c.json({ ok: true });
});

export default photos;
