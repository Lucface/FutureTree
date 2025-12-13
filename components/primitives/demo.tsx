'use client';

/**
 * Demo component showcasing all primitives
 *
 * This is for development/testing purposes only.
 * Import and render this component to verify all primitives work correctly.
 *
 * @example
 * // In a page:
 * import { PrimitivesDemo } from '@/components/primitives/demo';
 * export default function TestPage() {
 *   return <PrimitivesDemo />;
 * }
 */

import { Target, TrendingUp, Zap, Users } from 'lucide-react';
import { Surface } from './Surface';
import { MetricValue } from './MetricValue';
import { ProgressRing } from './ProgressRing';
import { Shimmer, ShimmerGroup } from './Shimmer';
import { Glow } from './Glow';
import { IconBadge } from './IconBadge';

export function PrimitivesDemo() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      <h1 className="font-display text-4xl font-bold">Primitives Demo</h1>

      {/* Surface Variants */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Surface</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Surface variant="default" padding="lg">
            <p className="font-medium">Default Surface</p>
            <p className="text-sm text-muted-foreground">Basic card container</p>
          </Surface>

          <Surface variant="raised" glow="primary" padding="lg">
            <p className="font-medium">Raised + Primary Glow</p>
            <p className="text-sm text-muted-foreground">Elevated with glow effect</p>
          </Surface>

          <Surface variant="interactive" glow="success" padding="lg">
            <p className="font-medium">Interactive + Success Glow</p>
            <p className="text-sm text-muted-foreground">Hover to see effect</p>
          </Surface>
        </div>
      </section>

      {/* MetricValue */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">MetricValue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricValue
            value={87}
            suffix="%"
            label="Success Rate"
            trend="up"
            trendValue="+5%"
            size="lg"
          />

          <MetricValue
            value={700}
            suffix="+"
            label="Case Studies"
            size="lg"
          />

          <MetricValue
            value={18}
            suffix=" mo"
            label="Avg Timeline"
            trend="down"
            trendValue="-2mo"
            size="lg"
          />

          <MetricValue
            prefix="$"
            value={2.5}
            suffix="M"
            label="Revenue Target"
            decimalPlaces={1}
            trend="neutral"
            size="lg"
          />
        </div>
      </section>

      {/* ProgressRing */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">ProgressRing</h2>
        <div className="flex flex-wrap gap-8">
          <ProgressRing value={87} size="lg" variant="success">
            <span className="font-mono text-2xl font-bold">87%</span>
            <span className="text-xs text-muted-foreground">success</span>
          </ProgressRing>

          <ProgressRing value={65} size="lg" variant="primary">
            <span className="font-mono text-2xl font-bold">65%</span>
            <span className="text-xs text-muted-foreground">progress</span>
          </ProgressRing>

          <ProgressRing value={30} size="lg" variant="warning">
            <span className="font-mono text-2xl font-bold">30%</span>
            <span className="text-xs text-muted-foreground">at risk</span>
          </ProgressRing>

          <ProgressRing value={15} size="lg" variant="danger">
            <span className="font-mono text-2xl font-bold">15%</span>
            <span className="text-xs text-muted-foreground">critical</span>
          </ProgressRing>
        </div>
      </section>

      {/* Shimmer Loading States */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Shimmer (Loading States)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Surface variant="default" padding="lg">
            <ShimmerGroup gap="md">
              <div className="flex items-center gap-4">
                <Shimmer variant="avatar" size="lg" />
                <div className="flex-1 space-y-2">
                  <Shimmer variant="heading" className="w-3/4" />
                  <Shimmer variant="text" className="w-1/2" />
                </div>
              </div>
              <Shimmer variant="paragraph" lines={3} />
              <div className="flex gap-2">
                <Shimmer variant="button" className="w-24" />
                <Shimmer variant="button" className="w-24" />
              </div>
            </ShimmerGroup>
          </Surface>

          <Surface variant="default" padding="lg">
            <ShimmerGroup gap="md">
              <Shimmer variant="image" className="h-32 w-full" />
              <Shimmer variant="heading" className="w-2/3" />
              <Shimmer variant="paragraph" lines={2} />
              <div className="flex gap-2">
                <Shimmer variant="badge" size="sm" />
                <Shimmer variant="badge" size="md" />
                <Shimmer variant="badge" size="lg" />
              </div>
            </ShimmerGroup>
          </Surface>
        </div>
      </section>

      {/* Glow */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Glow</h2>
        <div className="flex flex-wrap gap-8">
          <Glow variant="primary" intensity="medium">
            <Surface variant="default" padding="md">
              <p className="font-medium">Primary Glow</p>
            </Surface>
          </Glow>

          <Glow variant="success" intensity="strong">
            <Surface variant="default" padding="md">
              <p className="font-medium">Success Glow</p>
            </Surface>
          </Glow>

          <Glow variant="warning" intensity="medium" animated>
            <Surface variant="default" padding="md">
              <p className="font-medium">Animated Warning</p>
            </Surface>
          </Glow>
        </div>
      </section>

      {/* IconBadge */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">IconBadge</h2>
        <div className="flex flex-wrap gap-4">
          <IconBadge icon={Target} variant="primary" size="lg" />
          <IconBadge icon={TrendingUp} variant="success" size="lg" status="online" />
          <IconBadge icon={Zap} variant="warning" size="lg" status="busy" statusPulse />
          <IconBadge icon={Users} variant="info" size="lg" status="away" />
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <IconBadge icon={Target} variant="default" size="sm" />
          <IconBadge icon={Target} variant="default" size="md" />
          <IconBadge icon={Target} variant="default" size="lg" />
          <IconBadge icon={Target} variant="default" size="xl" />
        </div>
      </section>
    </div>
  );
}
