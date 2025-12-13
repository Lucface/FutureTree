'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass } from 'lucide-react';
import { IntakeForm } from '@/components/pathmap/intake/IntakeForm';
import { usePathMapAnalytics } from '@/hooks/usePathMapAnalytics';

export default function IntakePage() {
  const router = useRouter();
  const analytics = usePathMapAnalytics({ mode: 'self-serve' });

  // Track when user starts the intake process
  useEffect(() => {
    analytics.trackIntakeStarted();
  }, [analytics]);

  const handleComplete = (contextId: string) => {
    // Navigate to PathMap with the new context
    router.push(`/pathmap?context=${contextId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Back Link */}
        <button
          onClick={() => router.push('/pathmap')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PathMap
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Let&apos;s Find Your Path
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Answer a few questions about your business to get personalized
            strategic path recommendations backed by real data.
          </p>
        </div>

        {/* Benefits */}
        <h2 className="sr-only">Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg border">
            <span className="text-2xl" aria-hidden="true">🎯</span>
            <div>
              <h3 className="font-medium text-sm">Personalized</h3>
              <p className="text-xs text-muted-foreground">
                Tailored to your industry and goals
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg border">
            <span className="text-2xl" aria-hidden="true">📊</span>
            <div>
              <h3 className="font-medium text-sm">Data-Backed</h3>
              <p className="text-xs text-muted-foreground">
                Based on real business outcomes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg border">
            <span className="text-2xl" aria-hidden="true">⏱️</span>
            <div>
              <h3 className="font-medium text-sm">Quick</h3>
              <p className="text-xs text-muted-foreground">
                Takes only 3-5 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <section aria-labelledby="intake-form-heading">
          <h2 id="intake-form-heading" className="sr-only">Business Profile Form</h2>
          <div className="bg-background rounded-xl border shadow-sm p-6 sm:p-8">
            <IntakeForm onComplete={handleComplete} />
          </div>
        </section>

        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is stored securely and used only to personalize your recommendations.
          <br />
          We never share your information with third parties.
        </p>
      </div>
    </div>
  );
}
