import 'dotenv/config';

const url = process.env.SUPABASE_URL!.replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function req(path: string, method: string, body?: unknown) {
  const res = await fetch(url + path, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function ensureBucket(id: string) {
  const list = await req('/storage/v1/bucket', 'GET');
  const buckets = Array.isArray(list.json)
    ? (list.json as { name: string }[])
    : [];
  if (buckets.some((b) => b.name === id)) {
    console.log(`✅ Bucket already exists: ${id}`);
    return;
  }
  const created = await req('/storage/v1/bucket', 'POST', {
    id,
    name: id,
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'text/plain',
    ],
  });
  console.log(
    `Created ${id} -> status ${created.status}`,
    JSON.stringify(created.json),
  );
}

(async () => {
  const list = await req('/storage/v1/bucket', 'GET');
  console.log('Existing buckets:', JSON.stringify(list.json));

  await ensureBucket('documents');
  await ensureBucket('students-documents');
})();
