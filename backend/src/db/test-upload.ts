import 'dotenv/config';

const url = process.env.SUPABASE_URL!.replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const h = { apikey: key, Authorization: `Bearer ${key}` };

async function main() {
  // 1. List buckets
  const res = await fetch(`${url}/storage/v1/bucket`, { headers: h });
  const buckets: { name: string }[] = await res.json();
  console.log('Buckets:', buckets.map((b) => b.name).join(', '));

  // 2. Upload a test file to the `documents` bucket
  const up = await fetch(`${url}/storage/v1/object/documents/test-conn.txt`, {
    method: 'POST',
    headers: { ...h, 'Content-Type': 'text/plain', 'x-upsert': 'false' },
    body: 'connectivity test',
  });
  console.log('Upload status:', up.status, await up.text());

  // 3. Upload a test file to the `students-documents` bucket
  const up2 = await fetch(
    `${url}/storage/v1/object/students-documents/test-conn.txt`,
    {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'text/plain', 'x-upsert': 'false' },
      body: 'connectivity test 2',
    },
  );
  console.log('Upload2 status:', up2.status, await up2.text());
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
