import type { Context } from 'hono';

export async function triggerDeploy(c: Context) {
  const deployHookUrl = c.env.DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    return c.json({ error: 'Deploy hook URL not configured' }, 500);
  }

  try {
    const res = await fetch(deployHookUrl, { method: 'POST' });
    if (!res.ok) {
      return c.json({ error: `Deploy hook returned ${res.status}` }, 502);
    }
    return c.json({ success: true, message: 'Deploy triggered' });
  } catch (err) {
    return c.json({ error: 'Failed to trigger deploy', details: String(err) }, 502);
  }
}
