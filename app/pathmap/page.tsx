'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Target,
  FileText,
  Users,
  Sparkles,
  TreeDeciduous,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { StrategicPath } from '@/database/schema';

// Icon mapping for dynamic rendering
const iconMap = {
  Target,
  FileText,
  Users,
  TrendingUp,
  Compass,
  Sparkles,
};

// Strategic paths data (will come from API in production)
const strategicPaths: StrategicPath[] = [
  {
    id: '1',
    name: 'Vertical Specialization',
    slug: 'vertical-specialization',
    summary: 'Become the go-to expert in a specific industry niche',
    description:
      'Transform from a generalist service provider to a specialized expert commanding premium rates. Focus on healthcare, biotech, legal, or real estate.',
    successRate: '72.00',
    caseCount: 34,
    timelineP25: 6,
    timelineP75: 18,
    capitalP25: '5000.00',
    capitalP75: '25000.00',
    riskScore: '0.35',
    confidenceLevel: 'high',
    lastAggregated: new Date(),
    contradictionFlags: [],
    modelVersion: 1,
    rootNodeId: null,
    icon: 'Target',
    color: 'emerald',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Content-Led Growth',
    slug: 'content-led-growth',
    summary: 'Build authority and inbound leads through valuable content',
    description:
      'Establish yourself as a thought leader through consistent, high-value content. YouTube channels, podcasts, and educational resources.',
    successRate: '65.00',
    caseCount: 28,
    timelineP25: 9,
    timelineP75: 24,
    capitalP25: '2000.00',
    capitalP75: '15000.00',
    riskScore: '0.45',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    contradictionFlags: [],
    modelVersion: 1,
    rootNodeId: null,
    icon: 'FileText',
    color: 'blue',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Partnership Expansion',
    slug: 'partnership-expansion',
    summary: 'Grow through strategic alliances and referral partnerships',
    description:
      "Leverage other businesses' audiences and trust to accelerate growth. Agency partnerships, referral networks, and white-label services.",
    successRate: '68.00',
    caseCount: 22,
    timelineP25: 4,
    timelineP75: 12,
    capitalP25: '1000.00',
    capitalP75: '10000.00',
    riskScore: '0.40',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    rootNodeId: null,
    icon: 'Users',
    color: 'purple',
    sortOrder: 3,
    isActive: true,
    contradictionFlags: [],
    modelVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const colorVariants: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
};

export default function PathMapPage() {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50" role="banner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 text-foreground shrink-0">
            <TreeDeciduous className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-semibold text-sm sm:text-base">FutureTree</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pathmap"
              className="hidden sm:block text-sm font-medium text-foreground"
            >
              PathMap
            </Link>
            <Link href="/discover">
              <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden xs:inline">Start</span> Discovery
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div>
      {/* Hero Section */}
      <section className="py-10 sm:py-16 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 gap-2 bg-primary/5 border-primary/20 text-xs sm:text-sm"
              >
                <BarChart3 className="h-3 w-3" />
                Powered by 84+ case studies
              </Badge>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight lg:text-5xl">
                Strategic Growth Paths
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground">
                Explore proven pathways that businesses like yours have taken to
                grow. Each path is backed by real case studies with measurable
                outcomes.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Link href="/discover">
                  <Button size="default" className="gap-2 text-sm sm:text-base">
                    <Compass className="h-4 w-4" />
                    Find Your Path
                  </Button>
                </Link>
                <Button variant="outline" size="default" className="gap-2 text-sm sm:text-base">
                  <Sparkles className="h-4 w-4" />
                  Compare Paths
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommended for your profile
                  </div>
                  <CardTitle>Vertical Specialization</CardTitle>
                  <CardDescription>
                    Based on businesses in video production at $500K-$1M revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center py-4">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        72%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        success rate
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        12 mo
                      </div>
                      <div className="text-xs text-muted-foreground">
                        avg timeline
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        $15K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        avg capital
                      </div>
                    </div>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low risk</span>
                    <span>High success</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Paths Grid */}
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight">
              Explore Growth Paths
            </h2>
            <p className="mt-2 text-muted-foreground">
              Each path represents a proven strategy with real-world validation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategicPaths.map((path) => {
              const colors = colorVariants[path.color || 'blue'];
              const IconComponent =
                iconMap[path.icon as keyof typeof iconMap] || Target;
              const isHovered = hoveredPath === path.id;

              return (
                <Link key={path.id} href={`/pathmap/${path.slug}`}>
                  <Card
                    className={`h-full transition-all duration-200 cursor-pointer ${colors.border} ${
                      isHovered ? 'shadow-lg scale-[1.02]' : ''
                    }`}
                    onMouseEnter={() => setHoveredPath(path.id)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}
                        >
                          <IconComponent className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        <Badge
                          variant="outline"
                          className={colors.badge}
                        >
                          {path.caseCount} cases
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{path.name}</CardTitle>
                      <CardDescription>{path.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Success Rate */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              Success Rate
                            </span>
                            <span className="font-medium">
                              {parseFloat(path.successRate || '0').toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={parseFloat(path.successRate || '0')}
                            className="h-2"
                          />
                        </div>

                        {/* Timeline & Capital */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">
                                {path.timelineP25}-{path.timelineP75} mo
                              </div>
                              <div className="text-xs text-muted-foreground">
                                timeline
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">
                                ${(parseFloat(path.capitalP25 || '0') / 1000).toFixed(0)}K-
                                ${(parseFloat(path.capitalP75 || '0') / 1000).toFixed(0)}K
                              </div>
                              <div className="text-xs text-muted-foreground">
                                capital
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Explore CTA */}
                        <div className="pt-2">
                          <div
                            className={`text-sm font-medium flex items-center gap-1 ${colors.text}`}
                          >
                            Explore this path
                            <ArrowRight
                              className={`h-4 w-4 transition-transform ${
                                isHovered ? 'translate-x-1' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Self-Discovery CTA Section */}
      <section className="py-10 sm:py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 sm:p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                    Not sure which path is right for you?
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Our self-discovery process analyzes your business profile,
                    market position, and capabilities to recommend the paths
                    most likely to succeed for your specific situation.
                  </p>
                  <div className="mt-6">
                    <Link href="/discover">
                      <Button size="lg" className="gap-2">
                        <Compass className="h-4 w-4" />
                        Start Self-Discovery
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Assess your capabilities
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Qualifications, equipment, team skills
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Analyze market position</div>
                        <div className="text-sm text-muted-foreground">
                          Where you stand vs competitors
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Get personalized recommendations</div>
                        <div className="text-sm text-muted-foreground">
                          Paths matched to your profile
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TreeDeciduous className="h-5 w-5" />
              <span className="font-medium">FutureTree</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/pathmap" className="hover:text-foreground">
                PathMap
              </Link>
              <Link href="/discover" className="hover:text-foreground">
                Self-Discovery
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
