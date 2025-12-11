'use client';

import Link from 'next/link';
import { ArrowRight, TreeDeciduous, Compass, TrendingUp, Target, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BlurRevealText,
  PremiumButton,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from '@/components/ui/premium';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Process step data
const processSteps = [
  {
    number: 1,
    title: 'Self-Discovery',
    description: 'Understand your market position, core competencies, infrastructure, and history.',
    icon: Compass,
    color: 'emerald',
  },
  {
    number: 2,
    title: 'Potentiality',
    description: 'See where similar businesses went and the paths they took to get there.',
    icon: Sparkles,
    color: 'blue',
  },
  {
    number: 3,
    title: 'Decision Tree',
    description: 'Choose your strategic path with data-backed insights and probability scores.',
    icon: Target,
    color: 'purple',
  },
  {
    number: 4,
    title: 'Roadmap',
    description: 'Execute with milestones, track progress, and iterate based on outcomes.',
    icon: TrendingUp,
    color: 'amber',
  },
];

// Social proof data
const socialProof = [
  { metric: '700+', label: 'Case Studies', description: 'Real transformations' },
  { metric: '87%', label: 'Success Rate', description: 'With recommended path' },
  { metric: '16mo', label: 'Avg Timeline', description: 'To goal achievement' },
];

// Feature highlights
const features = [
  {
    title: 'Qualified Specifications',
    description: 'Certifications, equipment, skills, and technical capabilities',
    icon: Target,
  },
  {
    title: 'Social Proof',
    description: 'Portfolio strength, testimonials, brand recognition',
    icon: Users,
  },
  {
    title: 'Infrastructure',
    description: 'Team capabilities, processes, and capacity',
    icon: TrendingUp,
  },
  {
    title: 'History',
    description: 'Past clients, industries served, notable projects',
    icon: Compass,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-path-vertical/5 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-[500px] w-[500px] rounded-full bg-path-content/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-900/5 dark:bg-white/10 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              <TreeDeciduous className="h-4 w-4" />
              Strategic Self-Discovery Platform
            </motion.div>

            {/* Main headline with blur reveal */}
            <BlurRevealText
              text="Discover where your business could go"
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
              delay={0.2}
            />

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl max-w-2xl mx-auto"
            >
              Not generic advice. Real proof from{' '}
              <span className="font-semibold text-gray-900 dark:text-white">700+ businesses</span>{' '}
              that achieved exactly what you want.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/discover">
                <PremiumButton size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Your Discovery
                </PremiumButton>
              </Link>
              <Link href="/pathmap">
                <PremiumButton variant="secondary" size="lg">
                  Explore Strategic Paths
                </PremiumButton>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {socialProof.map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {item.metric.includes('%') ? (
                      <>
                        <AnimatedCounter value={parseInt(item.metric)} />%
                      </>
                    ) : item.metric.includes('+') ? (
                      <>
                        <AnimatedCounter value={parseInt(item.metric)} />+
                      </>
                    ) : (
                      item.metric
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Magic Moment Preview */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                See Your Potentiality
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                The "aha" moment. Companies exactly like you that achieved exactly what you want.
              </p>
            </div>
          </ScrollReveal>

          {/* Preview Card - The Screenshot Moment */}
          <ScrollReveal delay={0.2}>
            <div className="mx-auto max-w-4xl">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative bg-gray-900 dark:bg-white rounded-2xl p-8 shadow-premium-lg overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-path-vertical/20 via-transparent to-path-content/20 pointer-events-none" />

                <div className="relative">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">We found</span>
                    <div className="text-5xl sm:text-6xl font-bold text-white dark:text-gray-900 my-2">
                      <AnimatedCounter value={15} /> companies
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      similar to you that reached your goal
                    </span>
                  </div>

                  {/* Three Paths Preview */}
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                      { name: 'Vertical Specialization', count: 8, rate: 87, color: 'emerald' },
                      { name: 'Content-Led Growth', count: 4, rate: 75, color: 'blue' },
                      { name: 'Partnership Model', count: 3, rate: 60, color: 'purple' },
                    ].map((path) => (
                      <div
                        key={path.name}
                        className={cn(
                          'rounded-xl p-4 text-center',
                          path.color === 'emerald' && 'bg-emerald-500/20 ring-2 ring-emerald-500',
                          path.color === 'blue' && 'bg-blue-500/10',
                          path.color === 'purple' && 'bg-purple-500/10'
                        )}
                      >
                        <div className="text-white dark:text-gray-900 font-semibold text-sm mb-2">
                          {path.name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                          {path.count} companies
                        </div>
                        <div
                          className={cn(
                            'text-2xl font-bold',
                            path.color === 'emerald' && 'text-emerald-400 dark:text-emerald-600',
                            path.color === 'blue' && 'text-blue-400 dark:text-blue-600',
                            path.color === 'purple' && 'text-purple-400 dark:text-purple-600'
                          )}
                        >
                          {path.rate}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">success rate</div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 dark:text-emerald-600 font-semibold text-sm mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      RECOMMENDED PATH
                    </div>
                    <div className="text-white dark:text-gray-900 font-bold">
                      Vertical Specialization → Healthcare
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      87% success rate • 16 months • +14% margin improvement
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works - Process Steps */}
      <section className="py-24 bg-gray-50/50 dark:bg-dark-surface/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Four Layers to Clarity
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                From "I don't know where to go" to "I see the path and I'm ready"
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => (
                <StaggerItem key={step.number}>
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="relative bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border h-full"
                  >
                    {/* Number badge */}
                    <div
                      className={cn(
                        'absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white',
                        step.color === 'emerald' && 'bg-emerald-500',
                        step.color === 'blue' && 'bg-blue-500',
                        step.color === 'purple' && 'bg-purple-500',
                        step.color === 'amber' && 'bg-amber-500'
                      )}
                    >
                      {step.number}
                    </div>

                    <step.icon
                      className={cn(
                        'h-8 w-8 mb-4 mt-2',
                        step.color === 'emerald' && 'text-emerald-500',
                        step.color === 'blue' && 'text-blue-500',
                        step.color === 'purple' && 'text-purple-500',
                        step.color === 'amber' && 'text-amber-500'
                      )}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Self-Discovery Inputs Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  What makes you <span className="text-path-vertical">you</span>?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Before we can show you where you could go, we need to understand where you are.
                  FutureTree analyzes the unique factors that define your business.
                </p>

                <div className="mt-8 space-y-6">
                  {features.map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900/5 dark:bg-white/10">
                        <feature.icon className="h-5 w-5 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card className="shadow-premium border-gray-200 dark:border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Business Profile</CardTitle>
                    <CardDescription>A snapshot of where you stand today</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Industry</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Video Production
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Annual Revenue
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">$650K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Team Size</span>
                      <span className="font-medium text-gray-900 dark:text-white">5 people</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Years in Business
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">7 years</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Market Position
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-elevated overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '60%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-2 rounded-full bg-path-vertical"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <span>Emerging</span>
                        <span>Established</span>
                        <span>Leader</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Expansion Options */}
      <section className="py-24 bg-gray-50/50 dark:bg-dark-surface/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Vertical or Horizontal?
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Every business has multiple paths forward. We help you see which ones match your
                capabilities.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgb(16 185 129 / 0.4)' }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-dark-surface rounded-2xl p-6 border-2 border-path-vertical/20 shadow-sm h-full"
              >
                <div className="text-sm font-medium text-path-vertical mb-2">
                  Vertical Expansion
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Go Deep in a Market
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Specialize in a specific industry and become the go-to expert.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {['Life sciences & biotech', 'Legal & professional services', 'Healthcare & medical', 'Real estate & construction'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-path-vertical" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgb(59 130 246 / 0.4)' }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-dark-surface rounded-2xl p-6 border-2 border-path-content/20 shadow-sm h-full"
              >
                <div className="text-sm font-medium text-path-content mb-2">
                  Horizontal Expansion
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Expand Your Offerings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add new capabilities and services to serve more client needs.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {['SaaS product development', 'Consulting & advisory', 'Nationwide team expansion', 'Agency partnerships'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-path-content" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TreeDeciduous className="h-12 w-12 text-path-vertical mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Ready to see your potentiality?
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Start with self-discovery and let FutureTree show you where businesses like yours
                have gone.
              </p>
              <div className="mt-10">
                <Link href="/discover">
                  <PremiumButton size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Begin Self-Discovery
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-border py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TreeDeciduous className="h-5 w-5" />
              <span className="font-medium">FutureTree</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Strategic Self-Discovery & Potentiality Engine
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
