'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface SurveyData {
  id: string;
  surveyType: '30day' | '60day' | '90day';
  status: string;
  pathName: string;
  config: {
    label: string;
    description: string;
    questions: Array<{
      id: string;
      type: string;
      label: string;
      min?: number;
      max?: number;
      options?: Array<{ value: string; label: string }>;
    }>;
  };
}

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form responses
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  // Fetch survey data
  useEffect(() => {
    async function fetchSurvey() {
      try {
        const res = await fetch(`/api/pathmap/surveys/${surveyId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Survey not found or already completed.');
          } else {
            setError('Failed to load survey.');
          }
          return;
        }
        const data = await res.json();
        const surveyData = data.survey;

        if (surveyData.status === 'completed') {
          setSubmitted(true);
        }

        setSurvey(surveyData);
      } catch {
        setError('Failed to load survey. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [surveyId]);

  // Update a response
  const updateResponse = (questionId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Submit the survey
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pathmap/surveys/${surveyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit survey');
      }

      setSubmitted(true);
    } catch {
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question: SurveyData['config']['questions'][0]) => {
    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <Switch
              id={question.id}
              checked={(responses[question.id] as boolean) || false}
              onCheckedChange={(checked: boolean) => updateResponse(question.id, checked)}
            />
            <Label htmlFor={question.id}>{question.label}</Label>
          </div>
        );

      case 'number':
      case 'rating':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.min ?? 0}</span>
              <span className="font-medium">{(responses[question.id] as number) ?? question.min ?? 0}</span>
              <span>{question.max ?? 100}</span>
            </div>
            <Slider
              min={question.min ?? 0}
              max={question.max ?? 100}
              step={1}
              value={[(responses[question.id] as number) ?? question.min ?? 0]}
              onValueChange={(values: number[]) => updateResponse(question.id, values[0])}
            />
          </div>
        );

      case 'currency':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="0.00"
              value={(responses[question.id] as number) ?? ''}
              onChange={(e) =>
                updateResponse(question.id, parseFloat(e.target.value) || 0)
              }
            />
          </div>
        );

      case 'select':
        return (
          <RadioGroup
            value={(responses[question.id] as string) ?? ''}
            onValueChange={(value: string) => updateResponse(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
      case 'textarea':
        return (
          <Textarea
            placeholder="Your response..."
            value={(responses[question.id] as string) ?? ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateResponse(question.id, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Survey</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your response has been recorded. This helps us improve PathMap for
              everyone.
            </p>
            <Button onClick={() => router.push('/pathmap')}>
              Back to PathMap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{survey.config.label}</CardTitle>
            <CardDescription>
              {survey.config.description}
              {survey.pathName && (
                <span className="block mt-1 font-medium text-foreground">
                  Path: {survey.pathName}
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {survey.config.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-base">
                  {index + 1}. {question.label}
                </Label>
                {renderQuestion(question)}
              </div>
            ))}

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/pathmap')}
              disabled={submitting}
            >
              Skip for Now
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Response'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
