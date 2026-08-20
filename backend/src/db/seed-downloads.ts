import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool, { schema });

const DOWNLOADS: (typeof schema.downloads.$inferInsert)[] = [
  {
    title: '2026 Academic Year Calendar',
    description:
      'Complete academic calendar for the 2026 school year including term dates, holidays, and examination schedules.',
    category: 'General',
    fileFormat: 'PDF',
    fileSize: '245 KB',
    downloadUrl: '/documents/2026-academic-calendar.pdf',
  },
  {
    title: 'Admission Application Form',
    description:
      'Official admission application form for all education levels. Can be filled online or printed and submitted physically.',
    category: 'Admissions',
    fileFormat: 'PDF',
    fileSize: '128 KB',
    downloadUrl: '/documents/admission-application-form.pdf',
  },
  {
    title: 'School Fee Structure 2026',
    description:
      'Detailed fee structure for Nursery, Primary, Secondary, and TVET programs for the 2026 academic year.',
    category: 'Fees',
    fileFormat: 'PDF',
    fileSize: '156 KB',
    downloadUrl: '/documents/school-fee-structure-2026.pdf',
  },
  {
    title: 'School Rules and Regulations',
    description:
      'Complete guide to school rules, student conduct expectations, disciplinary procedures, and rights.',
    category: 'General',
    fileFormat: 'PDF',
    fileSize: '312 KB',
    downloadUrl: '/documents/school-rules-and-regulations.pdf',
  },
  {
    title: 'Uniform Requirements Guide',
    description:
      'Complete guide and specifications for official school uniforms across primary, secondary, and TVET levels.',
    category: 'Requirements',
    fileFormat: 'PDF',
    fileSize: '180 KB',
    downloadUrl: '/documents/uniform-requirements-guide.pdf',
  },
];

async function main() {
  console.log('🌱 Seeding downloads...');

  for (const doc of DOWNLOADS) {
    const existing = await db
      .select()
      .from(schema.downloads)
      .where(eq(schema.downloads.title, doc.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⚠️ Already exists: ${doc.title}`);
      continue;
    }

    await db.insert(schema.downloads).values(doc);
    console.log(`✓ Created: ${doc.title}`);
  }

  console.log('🎉 Downloads seeded successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Download seed failed:', err);
  process.exit(1);
});
