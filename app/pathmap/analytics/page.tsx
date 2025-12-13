// Force dynamic rendering - this page requires runtime QueryClient
export const dynamic = 'force-dynamic';

import { AnalyticsPageClient } from './analytics-client';

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
