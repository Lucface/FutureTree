/**
 * Main seed file - runs all seed functions
 */

import { seedPathMap } from './pathmap';

async function main() {
  console.log('🚀 Starting database seed...\n');

  try {
    // Seed PathMap data (strategic paths and decision nodes)
    await seedPathMap();

    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
