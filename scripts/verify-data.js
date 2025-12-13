const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const all =
    await sql`SELECT id, "companyName", "sourceUrl", "sourcePlatform" FROM case_studies`;
  console.log("Total case studies:", all.length);

  // Check for suspicious entries (no source URL or platform)
  const suspicious = all.filter((s) => !s.sourceUrl || !s.sourcePlatform);
  if (suspicious.length > 0) {
    console.log("\nSuspicious entries (no source):", suspicious.length);
    suspicious.forEach((s) => console.log("  -", s.companyName));
  } else {
    console.log("\n✅ All entries have valid sources");
  }

  // Check for placeholder names
  const placeholders = all.filter(
    (s) =>
      s.companyName.includes("Example") ||
      s.companyName.includes("Test") ||
      s.companyName.includes("Sample"),
  );
  if (placeholders.length > 0) {
    console.log("\nPlaceholder names found:", placeholders.length);
    placeholders.forEach((s) => console.log("  -", s.companyName));
  } else {
    console.log("✅ No placeholder names found");
  }

  // List all companies
  console.log("\n--- All Companies ---");
  all.forEach((s) => console.log(`  ${s.companyName} (${s.sourcePlatform})`));
}

check().catch(console.error);
