'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  TreeDeciduous,
  Building2,
  Award,
  CheckCircle2,
  Sparkles,
  Target,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Step configuration
const steps = [
  {
    id: 'identity',
    title: 'Business Identity',
    description: 'Tell us about your company',
    icon: Building2,
  },
  {
    id: 'capabilities',
    title: 'Capabilities',
    description: 'What can you do?',
    icon: Award,
  },
  {
    id: 'history',
    title: 'Track Record',
    description: 'Where have you been?',
    icon: Briefcase,
  },
  {
    id: 'position',
    title: 'Current Position',
    description: 'Where are you now?',
    icon: MapPin,
  },
];

// Industry options
const industries = [
  { value: 'video_production', label: 'Video Production' },
  { value: 'photography', label: 'Photography' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing_agency', label: 'Marketing Agency' },
  { value: 'software_development', label: 'Software Development' },
  { value: 'design_agency', label: 'Design Agency' },
  { value: 'legal_services', label: 'Legal Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

// Sub-industries per industry
const subIndustries: Record<string, { value: string; label: string }[]> = {
  video_production: [
    { value: 'corporate', label: 'Corporate Video' },
    { value: 'commercial', label: 'Commercials & Ads' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'wedding', label: 'Wedding & Events' },
    { value: 'music_video', label: 'Music Videos' },
    { value: 'social_content', label: 'Social Media Content' },
  ],
  architecture: [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'interior', label: 'Interior Design' },
    { value: 'landscape', label: 'Landscape Architecture' },
  ],
  consulting: [
    { value: 'management', label: 'Management Consulting' },
    { value: 'strategy', label: 'Strategy Consulting' },
    { value: 'it', label: 'IT Consulting' },
    { value: 'hr', label: 'HR Consulting' },
    { value: 'financial', label: 'Financial Advisory' },
  ],
};

// Revenue ranges
const revenueRanges = [
  { value: 'under_100k', label: 'Under $100K' },
  { value: '100k_250k', label: '$100K - $250K' },
  { value: '250k_500k', label: '$250K - $500K' },
  { value: '500k_1m', label: '$500K - $1M' },
  { value: '1m_2.5m', label: '$1M - $2.5M' },
  { value: '2.5m_5m', label: '$2.5M - $5M' },
  { value: '5m_plus', label: '$5M+' },
];

// Team sizes
const teamSizes = [
  { value: 'solo', label: 'Solo / Freelancer' },
  { value: '2_5', label: '2-5 people' },
  { value: '6_10', label: '6-10 people' },
  { value: '11_25', label: '11-25 people' },
  { value: '26_50', label: '26-50 people' },
  { value: '50_plus', label: '50+ people' },
];

interface FormData {
  // Identity
  companyName: string;
  industry: string;
  subIndustry: string;
  yearsInBusiness: string;
  teamSize: string;
  location: string;

  // Capabilities
  coreServices: string;
  equipment: string;
  certifications: string;
  specializations: string;

  // History
  notableClients: string;
  portfolioHighlights: string;
  awards: string;
  caseStudies: string;

  // Position
  currentRevenue: string;
  revenueGrowth: string;
  biggestChallenge: string;
  growthGoal: string;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    subIndustry: '',
    yearsInBusiness: '',
    teamSize: '',
    location: '',
    coreServices: '',
    equipment: '',
    certifications: '',
    specializations: '',
    notableClients: '',
    portfolioHighlights: '',
    awards: '',
    caseStudies: '',
    currentRevenue: '',
    revenueGrowth: '',
    biggestChallenge: '',
    growthGoal: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const data = await response.json();
      router.push(data.redirectTo || `/discover/results/${data.profile.id}`);
    } catch (error) {
      console.error('Error submitting:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <TreeDeciduous className="h-6 w-6 text-primary" />
            <span className="font-semibold">FutureTree</span>
          </Link>
          <Badge variant="outline" className="gap-2 bg-primary/5 border-primary/20">
            <Sparkles className="h-3 w-3" />
            Self-Discovery
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Discover Your Business Potential
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions about your business. We will analyze your
            position and show you where similar companies have gone.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isComplete
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isComplete ? 'bg-primary' : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${
                  index === currentStep
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <div className="hidden sm:block">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {(() => {
                const Icon = steps[currentStep].icon;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Business Identity */}
            {currentStep === 0 && (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Blue Barn Creative"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Austin, TX"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => {
                        updateField('industry', value);
                        updateField('subIndustry', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.industry && subIndustries[formData.industry] && (
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Select
                        value={formData.subIndustry}
                        onValueChange={(value) => updateField('subIndustry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {subIndustries[formData.industry].map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Years in Business</Label>
                    <Select
                      value={formData.yearsInBusiness}
                      onValueChange={(value) => updateField('yearsInBusiness', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0_1">Less than 1 year</SelectItem>
                        <SelectItem value="1_3">1-3 years</SelectItem>
                        <SelectItem value="3_5">3-5 years</SelectItem>
                        <SelectItem value="5_10">5-10 years</SelectItem>
                        <SelectItem value="10_plus">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Select
                      value={formData.teamSize}
                      onValueChange={(value) => updateField('teamSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Capabilities */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coreServices">Core Services</Label>
                  <Textarea
                    id="coreServices"
                    placeholder="What are your primary services? e.g., Corporate video production, brand films, social media content"
                    value={formData.coreServices}
                    onChange={(e) => updateField('coreServices', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment & Tools</Label>
                  <Textarea
                    id="equipment"
                    placeholder="What tools/equipment do you use? e.g., RED cameras, DaVinci Resolve, professional audio gear"
                    value={formData.equipment}
                    onChange={(e) => updateField('equipment', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      placeholder="e.g., FAA Part 107, Adobe Certified"
                      value={formData.certifications}
                      onChange={(e) => updateField('certifications', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specializations">Special Capabilities</Label>
                    <Input
                      id="specializations"
                      placeholder="e.g., Drone work, live streaming, 4K HDR"
                      value={formData.specializations}
                      onChange={(e) => updateField('specializations', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Track Record */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="notableClients">Notable Clients</Label>
                  <Textarea
                    id="notableClients"
                    placeholder="Who have you worked with? e.g., Fortune 500 companies, local businesses, startups"
                    value={formData.notableClients}
                    onChange={(e) => updateField('notableClients', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioHighlights">Portfolio Highlights</Label>
                  <Textarea
                    id="portfolioHighlights"
                    placeholder="What are your best projects? What industries have you served?"
                    value={formData.portfolioHighlights}
                    onChange={(e) => updateField('portfolioHighlights', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="awards">Awards & Recognition</Label>
                    <Input
                      id="awards"
                      placeholder="e.g., Telly Award, Best of Austin"
                      value={formData.awards}
                      onChange={(e) => updateField('awards', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caseStudies">Documented Case Studies</Label>
                    <Input
                      id="caseStudies"
                      placeholder="How many? e.g., 0, 5, 10+"
                      value={formData.caseStudies}
                      onChange={(e) => updateField('caseStudies', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Current Position */}
            {currentStep === 3 && (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Current Annual Revenue</Label>
                    <Select
                      value={formData.currentRevenue}
                      onValueChange={(value) => updateField('currentRevenue', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {revenueRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Revenue Growth (YoY)</Label>
                    <Select
                      value={formData.revenueGrowth}
                      onValueChange={(value) => updateField('revenueGrowth', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select growth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="declining">Declining</SelectItem>
                        <SelectItem value="flat">Flat (0-5%)</SelectItem>
                        <SelectItem value="moderate">Moderate (5-15%)</SelectItem>
                        <SelectItem value="strong">Strong (15-30%)</SelectItem>
                        <SelectItem value="rapid">Rapid (30%+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biggestChallenge">Biggest Challenge</Label>
                  <Textarea
                    id="biggestChallenge"
                    placeholder="The #1 thing holding your business back, e.g., Finding new clients, scaling operations, increasing prices"
                    value={formData.biggestChallenge}
                    onChange={(e) => updateField('biggestChallenge', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growthGoal">Growth Goal (12-24 months)</Label>
                  <Textarea
                    id="growthGoal"
                    placeholder="Where do you want to be? e.g., Double revenue, expand to new market, hire key team members"
                    value={formData.growthGoal}
                    onChange={(e) => updateField('growthGoal', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Preview of what they'll get */}
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">What you will discover:</div>
                      <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                        <li>• Your market position relative to similar businesses</li>
                        <li>• Case studies from companies who started where you are</li>
                        <li>• Viable expansion paths (vertical vs horizontal)</li>
                        <li>• Personalized strategic recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  See My Potential
                </>
              )}
            </Button>
          )}
        </div>

        {/* Side note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Your information is used only to find relevant case studies and recommendations.
          We never share your data.
        </p>
      </div>
    </div>
  );
}
