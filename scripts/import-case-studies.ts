#!/usr/bin/env npx tsx
/**
 * Import Case Studies from Transformed JSON
 *
 * This script imports case studies from the transformed Starter Story data
 * into the FutureTree database.
 *
 * Usage:
 *   npx tsx scripts/import-case-studies.ts ./scraped-data-transformed.json
 *
 * Options:
 *   --dry-run    Preview what would be imported without writing to database
 *   --batch=100  Batch size for inserts (default: 100)
 *   --skip=0     Skip first N records (for resuming)
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '@/lib/db';
import { caseStudies, type NewCaseStudy } from '@/database/schema';
import { sql } from 'drizzle-orm';

// Parse command line arguments
const args = process.argv.slice(2);
const inputFile = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const batchSize = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '100', 10);
const skip = parseInt(args.find(a => a.startsWith('--skip='))?.split('=')[1] || '0', 10);

if (!inputFile) {
  console.error(`
Import Case Studies from Transformed JSON

Usage:
  npx tsx scripts/import-case-studies.ts <transformed-data.json> [options]

Options:
  --dry-run    Preview what would be imported without writing to database
  --batch=N    Batch size for inserts (default: 100)
  --skip=N     Skip first N records (for resuming)

Example:
  npx tsx scripts/import-case-studies.ts ./scraped-data-transformed.json
  npx tsx scripts/import-case-studies.ts ./data.json --dry-run
  npx tsx scripts/import-case-studies.ts ./data.json --batch=50 --skip=1000
`);
  process.exit(1);
}

// Type definitions to match database schema
interface KeyAction {
  action: string;
  impact: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

interface Pitfall {
  issue: string;
  mitigation: string;
}

interface StartingState {
  revenue?: string;
  teamSize?: string;
  yearsInBusiness?: number;
  challenges?: string[];
  capabilities?: string[];
  marketPosition?: string;
}

interface EndingState {
  revenue?: string;
  teamSize?: string;
  growth?: string;
  margins?: string;
  marketPosition?: string;
}

interface Timeline {
  totalMonths?: number;
  phases?: { name: string; months: number }[];
}

interface CapitalInvested {
  amount?: string;
  source?: string;
}

interface Outcomes {
  revenueMultiplier?: number;
  marginImprovement?: string;
  teamGrowth?: string;
  marketShare?: string;
  otherMetrics?: Record<string, string>;
}

interface ImportedCaseStudy {
  companyName: string;
  industry: string;
  subIndustry: string | null;
  location: string | null;
  startingState: StartingState | Record<string, unknown>;
  endingState: EndingState | Record<string, unknown>;
  strategyType: string;
  expansionType: string | null;
  targetMarket: string | null;
  timeline: Timeline | Record<string, unknown> | null;
  keyActions: KeyAction[] | Array<Record<string, unknown>>;
  capitalInvested: CapitalInvested | Record<string, unknown> | null;
  outcomes: Outcomes | Record<string, unknown> | null;
  pitfalls: Pitfall[] | Array<Record<string, unknown>>;
  lessonsLearned: string | null;
  advice: string | null;
  sourceUrl: string | null;
  sourcePlatform: string;
  sourceDate: string | null;
  founderQuotes: string[];
  tags: string[];
  matchingKeywords: string[];
  confidenceLevel: 'low' | 'medium' | 'high' | 'verified';
  isVerified: boolean;
  featuredImage: string | null;
  summary: string | null;
}

async function importCaseStudies() {
  console.log('');
  console.log('=== FutureTree Case Study Importer ===');
  console.log('');

  // Read input file - inputFile is guaranteed to be defined here (checked above)
  const inputPath = path.resolve(inputFile!);
  console.log(`Reading: ${inputPath}`);

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const importData: ImportedCaseStudy[] = Array.isArray(rawData) ? rawData : [rawData];

  console.log(`Found ${importData.length} case studies in file`);

  if (skip > 0) {
    console.log(`Skipping first ${skip} records`);
  }

  const toImport = importData.slice(skip);
  console.log(`Will import ${toImport.length} case studies`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no database writes)' : 'LIVE'}`);
  console.log('');

  if (dryRun) {
    console.log('--- DRY RUN PREVIEW ---');
    console.log('');

    // Show sample of what would be imported
    const sample = toImport.slice(0, 5);
    for (const cs of sample) {
      console.log(`  - ${cs.companyName} (${cs.industry})`);
      console.log(`    Strategy: ${cs.strategyType}`);
      console.log(`    Source: ${cs.sourcePlatform}`);
      console.log(`    Keywords: ${cs.matchingKeywords.slice(0, 5).join(', ')}`);
      console.log('');
    }

    if (toImport.length > 5) {
      console.log(`  ... and ${toImport.length - 5} more`);
    }

    console.log('');
    console.log('Run without --dry-run to perform actual import.');
    return;
  }

  // Get existing company names to avoid duplicates
  console.log('Checking for existing case studies...');
  const existing = await db
    .select({ companyName: caseStudies.companyName })
    .from(caseStudies);

  const existingNames = new Set(existing.map(e => e.companyName.toLowerCase()));
  console.log(`Found ${existingNames.size} existing case studies`);

  // Filter out duplicates
  const newCaseStudies = toImport.filter(
    cs => !existingNames.has(cs.companyName.toLowerCase())
  );
  console.log(`${toImport.length - newCaseStudies.length} duplicates will be skipped`);
  console.log(`${newCaseStudies.length} new case studies to import`);
  console.log('');

  if (newCaseStudies.length === 0) {
    console.log('Nothing to import.');
    return;
  }

  // Import in batches
  let imported = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  const totalBatches = Math.ceil(newCaseStudies.length / batchSize);

  for (let i = 0; i < newCaseStudies.length; i += batchSize) {
    const batch = newCaseStudies.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    process.stdout.write(`\rImporting batch ${batchNum}/${totalBatches}...`);

    try {
      // Transform to database format with proper type casting
      const dbRecords: NewCaseStudy[] = batch.map(cs => ({
        companyName: cs.companyName,
        industry: cs.industry,
        subIndustry: cs.subIndustry,
        location: cs.location,
        startingState: cs.startingState as NewCaseStudy['startingState'],
        endingState: cs.endingState as NewCaseStudy['endingState'],
        strategyType: cs.strategyType,
        expansionType: cs.expansionType,
        targetMarket: cs.targetMarket,
        timeline: cs.timeline as NewCaseStudy['timeline'],
        keyActions: cs.keyActions as NewCaseStudy['keyActions'],
        capitalInvested: cs.capitalInvested as NewCaseStudy['capitalInvested'],
        outcomes: cs.outcomes as NewCaseStudy['outcomes'],
        pitfalls: cs.pitfalls as NewCaseStudy['pitfalls'],
        lessonsLearned: cs.lessonsLearned,
        advice: cs.advice,
        sourceUrl: cs.sourceUrl,
        sourcePlatform: cs.sourcePlatform as NewCaseStudy['sourcePlatform'],
        sourceDate: cs.sourceDate ? new Date(cs.sourceDate) : null,
        founderQuotes: cs.founderQuotes,
        tags: cs.tags,
        matchingKeywords: cs.matchingKeywords,
        confidenceLevel: cs.confidenceLevel,
        isVerified: cs.isVerified,
        featuredImage: cs.featuredImage,
        summary: cs.summary,
      }));

      // Insert batch
      await db.insert(caseStudies).values(dbRecords).onConflictDoNothing();

      imported += batch.length;
    } catch (error) {
      errors += batch.length;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errorDetails.push(`Batch ${batchNum}: ${errorMsg}`);
    }
  }

  console.log('\n');
  console.log('=== Import Complete ===');
  console.log('');
  console.log(`Imported:  ${imported} case studies`);
  console.log(`Errors:    ${errors}`);
  console.log(`Skipped:   ${toImport.length - newCaseStudies.length} (duplicates)`);
  console.log('');

  if (errorDetails.length > 0) {
    console.log('Error details:');
    errorDetails.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errorDetails.length > 10) {
      console.log(`  ... and ${errorDetails.length - 10} more errors`);
    }
  }

  // Verify import
  const total = await db.select({ count: sql<number>`count(*)` }).from(caseStudies);
  console.log(`Total case studies in database: ${total[0].count}`);
}

// Run import
importCaseStudies()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
