import { db } from '../lib/db';
import { caseStudies } from '../database/schema';
import { sql, eq } from 'drizzle-orm';

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate case studies...\n');

  // Get all case studies grouped by company_name
  const all = await db.select({
    id: caseStudies.id,
    companyName: caseStudies.companyName,
    sourceUrl: caseStudies.sourceUrl,
  }).from(caseStudies);

  // Find duplicates
  const byName: Record<string, typeof all> = {};
  for (const cs of all) {
    const name = cs.companyName;
    if (!byName[name]) byName[name] = [];
    byName[name].push(cs);
  }

  // Process duplicates
  let deleted = 0;
  for (const [name, entries] of Object.entries(byName)) {
    if (entries.length > 1) {
      console.log(`  ${name}: ${entries.length} entries`);

      // Prefer entries with sourceUrl, keep the first one
      entries.sort((a, b) => {
        if (a.sourceUrl && !b.sourceUrl) return -1;
        if (!a.sourceUrl && b.sourceUrl) return 1;
        return 0;
      });

      // Delete all but the first (best) entry
      for (let i = 1; i < entries.length; i++) {
        await db.delete(caseStudies).where(eq(caseStudies.id, entries[i].id));
        console.log(`    ✓ Deleted duplicate: ${entries[i].id}`);
        deleted++;
      }
    }
  }

  // Get final count
  const remaining = await db.select({ count: sql`COUNT(*)` }).from(caseStudies);
  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Deleted ${deleted} duplicates`);
  console.log(`   ${remaining[0].count} case studies remaining`);

  process.exit(0);
}

cleanupDuplicates().catch(e => {
  console.error(e);
  process.exit(1);
});
