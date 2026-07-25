import { isAdmin } from './_lib/auth.js';
import { readContent, writeContent } from './_lib/content.js';
import { fail, json, methodNotAllowed, noStore, readJson } from './_lib/http.js';
import { normalizeContent } from './_lib/schema.js';

export const config = { runtime: 'edge' };

// The page is read far more often than it is published, so GET is cached at the
// edge and revalidated in the background. `?fresh=1` (the admin) bypasses it.
const CACHED = { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=600' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);

  if (request.method === 'GET') {
    const fresh = searchParams.get('fresh') === '1';
    const doc = await readContent();
    if (!doc) {
      return fail(404, 'nothing published yet', noStore);
    }
    return json(doc, { headers: fresh ? noStore : CACHED });
  }

  if (request.method === 'PUT') {
    if (!(await isAdmin(request))) return fail(401, 'unauthorized', noStore);

    const body = await readJson(request);
    if (!body) return fail(400, 'expected a JSON document', noStore);

    const doc = normalizeContent(body);
    doc.updatedAt = new Date().toISOString();
    const version = await writeContent(doc);

    return json({ ok: true, version, updatedAt: doc.updatedAt }, { headers: noStore });
  }

  return methodNotAllowed(['GET', 'PUT']);
}
