/**
 * Transform Starter Story Scraped Data to FutureTree Schema
 *
 * This script takes the raw scraped data from the Apify actor
 * and transforms it to match our caseStudies database schema.
 *
 * Usage:
 *   npx tsx scripts/apify-scraper/transform-to-schema.ts ./scraped-data.json
 */

import * as fs from 'fs';
import * as path from 'path';

// Raw data structure from scraper
interface ScrapedCaseStudy {
  companyName: string | null;
  title: string | null;
  monthlyRevenue: string | null;
  startupCosts: string | null;
  founderName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  industry: string | null;
  businessType: string | null;
  employeeCount: string | null;
  foundedYear: string | null;
  fullContent: string | null;
  summary: string | null;
  sourceUrl: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  growthStrategies: string[];
  businessModel: string | null;
  customerType: string | null;
  fundingType: string | null;
  toolsUsed: string[];
  extractedAt: string;
}

// FutureTree schema structure
interface CaseStudyInsert {
  companyName: string;
  industry: string;
  subIndustry: string | null;
  location: string | null;
  startingState: {
    revenue?: string;
    teamSize?: string;
    yearsInBusiness?: number;
    challenges?: string[];
    capabilities?: string[];
    marketPosition?: string;
  };
  endingState: {
    revenue?: string;
    teamSize?: string;
    revenueGrowth?: string;
    achievements?: string[];
    newCapabilities?: string[];
    marketPosition?: string;
  };
  strategyType: string;
  expansionType: string | null;
  targetMarket: string | null;
  timeline: {
    totalMonths?: number;
    phases?: Array<{ name: string; months: number; description?: string }>;
    keyMilestones?: Array<{ month: number; event: string }>;
  } | null;
  keyActions: Array<{
    action: string;
    impact: string;
    difficulty?: 'easy' | 'moderate' | 'hard';
  }>;
  capitalInvested: {
    total?: number;
    breakdown?: Record<string, number>;
    fundingSource?: string;
  } | null;
  outcomes: {
    revenueMultiplier?: number;
    profitMarginChange?: number;
    teamGrowth?: number;
    newClientsGained?: number;
    customMetrics?: Record<string, number>;
  } | null;
  pitfalls: Array<{
    challenge: string;
    howOvercome?: string;
    advice?: string;
  }>;
  lessonsLearned: string | null;
  advice: string | null;
  sourceUrl: string | null;
  sourcePlatform: string;
  sourceDate: Date | null;
  founderQuotes: string[];
  tags: string[];
  matchingKeywords: string[];
  confidenceLevel: 'low' | 'medium' | 'high' | 'verified';
  isVerified: boolean;
  featuredImage: string | null;
  summary: string | null;
}

/**
 * Parse revenue string to normalized format
 */
function parseRevenue(revenueStr: string | null): string | null {
  if (!revenueStr) return null;

  const cleaned = revenueStr.replace(/[,$]/g, '').toLowerCase();

  // Handle K/M suffixes
  if (cleaned.includes('k')) {
    const num = parseFloat(cleaned.replace('k', ''));
    return `${num * 1000}`;
  }
  if (cleaned.includes('m')) {
    const num = parseFloat(cleaned.replace('m', ''));
    return `${num * 1000000}`;
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  return String(num);
}

/**
 * Parse revenue to a readable range
 */
function getRevenueRange(revenue: string | null): string | null {
  if (!revenue) return null;

  const num = parseFloat(parseRevenue(revenue) || '0');
  if (num === 0) return null;

  if (num < 10000) return 'under_10k';
  if (num < 50000) return '10k_50k';
  if (num < 100000) return '50k_100k';
  if (num < 250000) return '100k_250k';
  if (num < 500000) return '250k_500k';
  if (num < 1000000) return '500k_1m';
  if (num < 5000000) return '1m_5m';
  if (num < 10000000) return '5m_10m';
  return '10m_plus';
}

/**
 * Parse team size string to normalized format
 */
function parseTeamSize(employeeCount: string | null): string | null {
  if (!employeeCount) return null;

  const num = parseInt(employeeCount.replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return null;

  if (num === 0 || num === 1) return 'solo';
  if (num <= 5) return '2_5';
  if (num <= 10) return '6_10';
  if (num <= 25) return '11_25';
  if (num <= 50) return '26_50';
  if (num <= 100) return '51_100';
  return '100_plus';
}

/**
 * Determine strategy type from content and metadata
 */
function inferStrategyType(data: ScrapedCaseStudy): string {
  const content = (data.fullContent || '').toLowerCase();
  const strategies = data.growthStrategies.map(s => s.toLowerCase());

  // Check for content-led growth indicators
  if (
    strategies.some(s => s.includes('content') || s.includes('seo') || s.includes('blog')) ||
    content.includes('content marketing') ||
    content.includes('youtube channel') ||
    content.includes('blog post')
  ) {
    return 'content_led_growth';
  }

  // Check for vertical specialization
  if (
    content.includes('specialized in') ||
    content.includes('niche market') ||
    content.includes('specific industry') ||
    content.includes('vertical focus')
  ) {
    return 'vertical_specialization';
  }

  // Check for partnership model
  if (
    content.includes('partnership') ||
    content.includes('referral') ||
    content.includes('affiliate') ||
    content.includes('white label')
  ) {
    return 'partnership_expansion';
  }

  // Check for product-led growth
  if (
    content.includes('freemium') ||
    content.includes('product-led') ||
    content.includes('self-serve') ||
    data.businessModel?.toLowerCase().includes('saas')
  ) {
    return 'product_led_growth';
  }

  // Check for acquisition/expansion
  if (
    content.includes('acquisition') ||
    content.includes('merged') ||
    content.includes('expanded into')
  ) {
    return 'acquisition_expansion';
  }

  // Default
  return 'organic_growth';
}

/**
 * Extract key actions from content using NLP-lite approach
 */
function extractKeyActions(content: string | null): CaseStudyInsert['keyActions'] {
  if (!content) return [];

  const actions: CaseStudyInsert['keyActions'] = [];
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  // Look for action-oriented sentences
  const actionPatterns = [
    /(?:we|i|the team|the founder)\s+(decided|started|launched|built|created|implemented|developed|hired|invested)/i,
    /(?:key|first|main|critical)\s+(?:step|action|decision|move)\s+was/i,
    /(?:this|that)\s+(?:helped|allowed|enabled)\s+(?:us|me|them)\s+to/i,
  ];

  for (const sentence of sentences.slice(0, 200)) { // Limit to first 200 sentences
    for (const pattern of actionPatterns) {
      if (pattern.test(sentence) && sentence.length > 20 && sentence.length < 300) {
        actions.push({
          action: sentence.substring(0, 200),
          impact: 'Growth contributor',
          difficulty: 'moderate',
        });
        break;
      }
    }

    if (actions.length >= 5) break; // Limit to 5 key actions
  }

  return actions;
}

/**
 * Extract quotes from content
 */
function extractQuotes(content: string | null): string[] {
  if (!content) return [];

  const quotes: string[] = [];
  const quotePattern = /"([^"]{20,300})"/g;
  let match;

  while ((match = quotePattern.exec(content)) !== null && quotes.length < 5) {
    const quote = match[1].trim();
    if (!quote.includes('http') && !quote.includes('click')) {
      quotes.push(quote);
    }
  }

  return quotes;
}

/**
 * Generate matching keywords from content
 */
function generateKeywords(data: ScrapedCaseStudy): string[] {
  const keywords = new Set<string>();

  // Add industry
  if (data.industry) {
    keywords.add(data.industry.toLowerCase());
  }

  // Add business type
  if (data.businessType) {
    keywords.add(data.businessType.toLowerCase());
  }

  // Add customer type
  if (data.customerType) {
    keywords.add(data.customerType.toLowerCase());
  }

  // Add growth strategies
  data.growthStrategies.forEach(s => keywords.add(s.toLowerCase()));

  // Add tools (popular ones)
  const popularTools = ['shopify', 'stripe', 'notion', 'slack', 'zapier', 'hubspot', 'mailchimp'];
  data.toolsUsed.forEach(tool => {
    if (popularTools.some(pt => tool.toLowerCase().includes(pt))) {
      keywords.add(tool.toLowerCase());
    }
  });

  // Extract from content
  const content = (data.fullContent || '').toLowerCase();
  const keywordPatterns = [
    'saas', 'ecommerce', 'marketplace', 'agency', 'consulting',
    'subscription', 'freemium', 'bootstrap', 'venture', 'remote',
    'solo founder', 'co-founder', 'b2b', 'b2c', 'd2c',
  ];

  keywordPatterns.forEach(kw => {
    if (content.includes(kw)) {
      keywords.add(kw);
    }
  });

  return Array.from(keywords);
}

/**
 * Transform scraped data to schema format
 */
function transformCaseStudy(scraped: ScrapedCaseStudy): CaseStudyInsert | null {
  // Skip if no company name
  if (!scraped.companyName) {
    console.warn('Skipping case study without company name:', scraped.sourceUrl);
    return null;
  }

  // Build location string
  let location: string | null = null;
  const locationParts = [scraped.city, scraped.state, scraped.country].filter(Boolean);
  if (locationParts.length > 0) {
    location = locationParts.join(', ');
  }

  // Determine revenue values
  const revenueNum = parseRevenue(scraped.monthlyRevenue);
  const revenueRange = getRevenueRange(scraped.monthlyRevenue);

  // Build the transformed case study
  const transformed: CaseStudyInsert = {
    companyName: scraped.companyName,
    industry: scraped.industry || 'general_business',
    subIndustry: scraped.businessType,
    location,

    startingState: {
      revenue: 'unknown', // We don't usually have starting revenue
      teamSize: 'unknown',
      yearsInBusiness: undefined,
      challenges: [],
      capabilities: [],
      marketPosition: 'emerging',
    },

    endingState: {
      revenue: revenueRange || undefined,
      teamSize: parseTeamSize(scraped.employeeCount) || undefined,
      revenueGrowth: undefined,
      achievements: [],
      newCapabilities: scraped.toolsUsed,
      marketPosition: undefined,
    },

    strategyType: inferStrategyType(scraped),
    expansionType: null,
    targetMarket: scraped.customerType,

    timeline: null,

    keyActions: extractKeyActions(scraped.fullContent),

    capitalInvested: scraped.startupCosts
      ? {
          total: parseFloat(parseRevenue(scraped.startupCosts) || '0'),
          fundingSource: scraped.fundingType || 'bootstrapped',
        }
      : null,

    outcomes: revenueNum
      ? {
          customMetrics: {
            monthlyRevenue: parseFloat(revenueNum),
          },
        }
      : null,

    pitfalls: [],
    lessonsLearned: null,
    advice: null,

    sourceUrl: scraped.sourceUrl,
    sourcePlatform: 'starter_story',
    sourceDate: scraped.datePublished ? new Date(scraped.datePublished) : null,
    founderQuotes: extractQuotes(scraped.fullContent),

    tags: [...scraped.growthStrategies, scraped.customerType].filter(Boolean) as string[],
    matchingKeywords: generateKeywords(scraped),

    confidenceLevel: 'medium',
    isVerified: false,
    featuredImage: null,
    summary: scraped.summary?.substring(0, 500) || null,
  };

  return transformed;
}

/**
 * Main function
 */
async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('Usage: npx tsx transform-to-schema.ts <scraped-data.json>');
    console.error('');
    console.error('The scraped data file should be exported from Apify dataset.');
    process.exit(1);
  }

  // Read input file
  const inputPath = path.resolve(inputFile);
  console.log(`Reading from: ${inputPath}`);

  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const scrapedData: ScrapedCaseStudy[] = Array.isArray(rawData) ? rawData : [rawData];

  console.log(`Processing ${scrapedData.length} case studies...`);

  // Transform all case studies
  const transformed: CaseStudyInsert[] = [];
  const errors: string[] = [];

  for (const scraped of scrapedData) {
    try {
      const result = transformCaseStudy(scraped);
      if (result) {
        transformed.push(result);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${scraped.companyName || scraped.sourceUrl}: ${errorMsg}`);
    }
  }

  // Write output
  const outputFile = inputFile.replace('.json', '-transformed.json');
  fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));

  console.log('');
  console.log('=== Transformation Complete ===');
  console.log(`Input:        ${scrapedData.length} case studies`);
  console.log(`Transformed:  ${transformed.length} case studies`);
  console.log(`Errors:       ${errors.length}`);
  console.log(`Output:       ${outputFile}`);

  if (errors.length > 0) {
    console.log('');
    console.log('Errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }

  // Generate SQL insert statements
  const sqlFile = inputFile.replace('.json', '-inserts.sql');
  const sqlStatements = transformed.map(cs => {
    return `INSERT INTO case_studies (
  company_name, industry, sub_industry, location,
  starting_state, ending_state, strategy_type, expansion_type, target_market,
  timeline, key_actions, capital_invested, outcomes, pitfalls,
  lessons_learned, advice, source_url, source_platform, source_date,
  founder_quotes, tags, matching_keywords, confidence_level, is_verified,
  featured_image, summary
) VALUES (
  '${cs.companyName.replace(/'/g, "''")}',
  '${cs.industry}',
  ${cs.subIndustry ? `'${cs.subIndustry}'` : 'NULL'},
  ${cs.location ? `'${cs.location.replace(/'/g, "''")}'` : 'NULL'},
  '${JSON.stringify(cs.startingState).replace(/'/g, "''")}',
  '${JSON.stringify(cs.endingState).replace(/'/g, "''")}',
  '${cs.strategyType}',
  ${cs.expansionType ? `'${cs.expansionType}'` : 'NULL'},
  ${cs.targetMarket ? `'${cs.targetMarket}'` : 'NULL'},
  ${cs.timeline ? `'${JSON.stringify(cs.timeline).replace(/'/g, "''")}'` : 'NULL'},
  '${JSON.stringify(cs.keyActions).replace(/'/g, "''")}',
  ${cs.capitalInvested ? `'${JSON.stringify(cs.capitalInvested).replace(/'/g, "''")}'` : 'NULL'},
  ${cs.outcomes ? `'${JSON.stringify(cs.outcomes).replace(/'/g, "''")}'` : 'NULL'},
  '${JSON.stringify(cs.pitfalls).replace(/'/g, "''")}',
  ${cs.lessonsLearned ? `'${cs.lessonsLearned.replace(/'/g, "''")}'` : 'NULL'},
  ${cs.advice ? `'${cs.advice.replace(/'/g, "''")}'` : 'NULL'},
  ${cs.sourceUrl ? `'${cs.sourceUrl}'` : 'NULL'},
  'starter_story',
  ${cs.sourceDate ? `'${cs.sourceDate.toISOString()}'` : 'NULL'},
  '${JSON.stringify(cs.founderQuotes).replace(/'/g, "''")}',
  '${JSON.stringify(cs.tags).replace(/'/g, "''")}',
  '${JSON.stringify(cs.matchingKeywords).replace(/'/g, "''")}',
  'medium',
  false,
  NULL,
  ${cs.summary ? `'${cs.summary.replace(/'/g, "''")}'` : 'NULL'}
);`;
  });

  fs.writeFileSync(sqlFile, sqlStatements.join('\n\n'));
  console.log(`SQL:          ${sqlFile}`);
}

main().catch(console.error);
