# Starter Story Case Study Scraper

Apify actor to extract ~4,500 business case studies from [starterstory.com](https://www.starterstory.com) for FutureTree's intelligence engine.

## Prerequisites

1. **Starter Story Premium subscription** - Required for full case study access
2. **Apify account** - For running the actor with proxy rotation

## Setup

### 1. Get Session Cookies

1. Log into starterstory.com with your premium account
2. Open DevTools (F12) → Application → Cookies
3. Copy these cookies:
   - `_starterstory_session`
   - Any other auth-related cookies

### 2. Deploy to Apify

```bash
# Install Apify CLI
npm install -g apify-cli

# Login to Apify
apify login

# Deploy the actor
cd scripts/apify-scraper
apify push
```

### 3. Run the Actor

In Apify Console, configure input:

```json
{
  "sessionCookies": [
    {
      "name": "_starterstory_session",
      "value": "YOUR_SESSION_COOKIE_VALUE",
      "domain": ".starterstory.com"
    }
  ],
  "maxCaseStudies": 5000,
  "delayBetweenRequests": 2500,
  "startPage": 1
}
```

## Output

The actor saves to Apify Dataset with fields:

- `companyName` - Business name
- `monthlyRevenue` - Current MRR/revenue
- `startupCosts` - Initial investment
- `founderName` - Founder name(s)
- `industry` - Business category
- `location` - City, state, country
- `employeeCount` - Team size
- `growthStrategies` - Marketing channels used
- `toolsUsed` - Tech stack
- `fullContent` - Full article text
- `sourceUrl` - Original URL

## Transform to FutureTree Schema

After scraping, transform data to our database schema:

```bash
# Export dataset from Apify to JSON
# Then run:
cd /path/to/futuretree
npx tsx scripts/apify-scraper/transform-to-schema.ts ./scraped-data.json
```

This generates:

- `scraped-data-transformed.json` - Ready for database import
- `scraped-data-inserts.sql` - SQL INSERT statements

## Import to Database

```bash
# Using the seed script
npm run db:seed:cases -- --file=./scraped-data-transformed.json

# Or direct SQL
psql $DATABASE_URL < scraped-data-inserts.sql
```

## Rate Limiting

The scraper is configured to be respectful:

- 2.5 second delay between requests
- Max 20 requests per minute
- Sequential processing (no parallel requests)
- Residential proxy rotation

## Resuming

If the scraper stops, you can resume:

```json
{
  "startPage": 150
}
```

## Filtering

Scrape specific industries:

```json
{
  "industries": ["SaaS", "E-Commerce", "Agency"],
  "minRevenue": 10000,
  "maxRevenue": 1000000
}
```

## Troubleshooting

### "Access denied" errors

- Session cookies may have expired
- Re-login and get fresh cookies

### Missing data fields

- Some case studies have incomplete data
- The transformer handles missing fields gracefully

### Rate limiting

- Increase `delayBetweenRequests` to 5000ms
- Use residential proxies

## Legal Note

This scraper is for personal use with a paid Starter Story subscription. The data is used to power FutureTree's recommendation engine, not for redistribution.
