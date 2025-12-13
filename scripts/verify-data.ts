import { db } from '../lib/db';
import { caseStudies } from '../database/schema';

async function check() {
  const all = await db.select({
    id: caseStudies.id,
    companyName: caseStudies.companyName,
    sourceUrl: caseStudies.sourceUrl,
    sourcePlatform: caseStudies.sourcePlatform,
    industry: caseStudies.industry,
  }).from(caseStudies);

  console.log('━'.repeat(50));
  console.log('📊 FUTURETREE CASE STUDY DATABASE REPORT');
  console.log('━'.repeat(50));
  console.log('\n🔢 TOTAL CASE STUDIES:', all.length);

  // By Industry
  const byIndustry: Record<string, number> = {};
  for (const s of all) {
    const ind = s.industry || 'unknown';
    byIndustry[ind] = (byIndustry[ind] || 0) + 1;
  }
  console.log('\n📁 BY INDUSTRY:');
  Object.entries(byIndustry)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ind, count]) => console.log(`   ${ind}: ${count}`));

  // By Source
  const bySource: Record<string, number> = {};
  for (const s of all) {
    const src = s.sourcePlatform || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  }
  console.log('\n🔗 BY SOURCE PLATFORM:');
  Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([src, count]) => console.log(`   ${src}: ${count}`));

  // Check for suspicious entries (no source URL or platform)
  const suspicious = all.filter(s => !s.sourceUrl || !s.sourcePlatform);
  if (suspicious.length > 0) {
    console.log('\n⚠️  Entries missing source info:', suspicious.length);
  } else {
    console.log('\n✅ All entries have valid sources');
  }

  // Check for placeholder names
  const placeholders = all.filter(s =>
    s.companyName.includes('Example') ||
    s.companyName.includes('Test') ||
    s.companyName.includes('Sample')
  );
  if (placeholders.length > 0) {
    console.log('⚠️  Placeholder names found:', placeholders.length);
    placeholders.forEach(s => console.log('  -', s.companyName));
  } else {
    console.log('✅ No placeholder names found');
  }

  // List all companies
  console.log('\n📋 ALL COMPANIES:');
  console.log('─'.repeat(50));
  all.forEach(s => console.log(`   ${s.companyName} (${s.industry}) - ${s.sourcePlatform}`));
  console.log('─'.repeat(50));

  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
