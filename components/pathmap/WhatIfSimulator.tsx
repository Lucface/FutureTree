'use client';

import { useState, useCallback, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { X, RotateCcw, Save, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  type EmvInputs,
  type WhatIfAdjustments,
  calculateWhatIf,
  formatCurrency,
  formatPercent,
  getEmvChangeColor,
  DEFAULT_ADJUSTMENTS,
  ADJUSTMENT_LIMITS,
} from '@/lib/pathmap';

interface WhatIfSimulatorProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Node label for context */
  nodeLabel: string;
  /** Base inputs for EMV calculation */
  baseInputs: EmvInputs;
  /** Callback when simulation is saved */
  onSave?: (adjustments: WhatIfAdjustments) => void;
}

/**
 * What-If Simulator Modal
 *
 * Allows users to adjust cost, timeline, and success probability
 * to see how it affects Expected Monetary Value (EMV).
 */
export function WhatIfSimulator({
  open,
  onOpenChange,
  nodeLabel,
  baseInputs,
  onSave,
}: WhatIfSimulatorProps) {
  const [adjustments, setAdjustments] = useState<WhatIfAdjustments>(DEFAULT_ADJUSTMENTS);

  // Calculate what-if result
  const result = useMemo(
    () => calculateWhatIf(baseInputs, adjustments),
    [baseInputs, adjustments]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, []);

  // Save and close
  const handleSave = useCallback(() => {
    onSave?.(adjustments);
    onOpenChange(false);
  }, [adjustments, onSave, onOpenChange]);

  // Update individual adjustment
  const updateAdjustment = useCallback(
    (key: keyof WhatIfAdjustments, value: number) => {
      setAdjustments((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Determine trend icon
  const TrendIcon =
    result.emvChange > 0 ? TrendingUp : result.emvChange < 0 ? TrendingDown : Minus;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-background border rounded-xl shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                What-If Simulator
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                Adjust variables for: <span className="font-medium">{nodeLabel}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-2 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            {/* Cost Adjustment */}
            <SliderControl
              label="Cost Adjustment"
              value={adjustments.costDelta}
              onChange={(v) => updateAdjustment('costDelta', v)}
              min={ADJUSTMENT_LIMITS.costDelta.min}
              max={ADJUSTMENT_LIMITS.costDelta.max}
              step={ADJUSTMENT_LIMITS.costDelta.step}
              formatValue={(v) => formatPercent(v)}
              formatDisplay={(v) =>
                `${formatCurrency(baseInputs.cost)} ${v >= 0 ? '+' : ''}${v}%`
              }
            />

            {/* Timeline Adjustment */}
            <SliderControl
              label="Timeline Adjustment"
              value={adjustments.timelineDelta}
              onChange={(v) => updateAdjustment('timelineDelta', v)}
              min={ADJUSTMENT_LIMITS.timelineDelta.min}
              max={ADJUSTMENT_LIMITS.timelineDelta.max}
              step={ADJUSTMENT_LIMITS.timelineDelta.step}
              formatValue={(v) => `${v >= 0 ? '+' : ''}${v} weeks`}
              formatDisplay={(v) => `${v >= 0 ? '+' : ''}${v} weeks`}
            />

            {/* Success Probability Adjustment */}
            <SliderControl
              label="Success Probability"
              value={adjustments.successProbabilityDelta}
              onChange={(v) => updateAdjustment('successProbabilityDelta', v)}
              min={ADJUSTMENT_LIMITS.successProbabilityDelta.min}
              max={ADJUSTMENT_LIMITS.successProbabilityDelta.max}
              step={ADJUSTMENT_LIMITS.successProbabilityDelta.step}
              formatValue={(v) => `${v >= 0 ? '+' : ''}${v}pp`}
              formatDisplay={(v) =>
                `${(baseInputs.successProbability * 100).toFixed(0)}% ${v >= 0 ? '+' : ''}${v}pp`
              }
            />
          </div>

          {/* Results Comparison */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-4">Expected Monetary Value (EMV)</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(result.original.emv)}
                </p>
              </div>

              {/* Adjusted */}
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Adjusted</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(result.adjusted.emv)}
                </p>
              </div>
            </div>

            {/* Change Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-background border">
              <TrendIcon className={`h-5 w-5 ${getEmvChangeColor(result.emvChange)}`} />
              <span className={`text-lg font-semibold ${getEmvChangeColor(result.emvChange)}`}>
                {formatCurrency(result.emvChange)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({formatPercent(result.emvChangePercent, 1)})
              </span>
            </div>

            {/* Breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Value:</span>
                <span>{formatCurrency(result.adjusted.successValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failure Loss:</span>
                <span className="text-red-600 dark:text-red-400">
                  -{formatCurrency(result.adjusted.failureLoss)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <div className="flex gap-2">
              <Dialog.Close className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </Dialog.Close>
              {onSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save Scenario
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================
// Slider Control Sub-Component
// ============================================

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  formatDisplay: (value: number) => string;
}

function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  formatDisplay,
}: SliderControlProps) {
  const isNeutral = value === 0;
  const isPositive = value > 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span
          className={`text-sm font-medium ${
            isNeutral
              ? 'text-muted-foreground'
              : isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatDisplay(value)}
        </span>
      </div>
      <Slider.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center select-none touch-none w-full h-5"
      >
        <Slider.Track className="bg-muted relative grow rounded-full h-2">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-border -translate-x-1/2" />
          <Slider.Range
            className={`absolute h-full rounded-full ${
              isPositive ? 'bg-green-500' : isNeutral ? 'bg-primary' : 'bg-red-500'
            }`}
            style={{
              left: value >= 0 ? '50%' : `${((value - min) / (max - min)) * 100}%`,
              right: value >= 0 ? `${100 - ((value - min) / (max - min)) * 100}%` : '50%',
            }}
          />
        </Slider.Track>
        <Slider.Thumb
          className={`block w-5 h-5 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            isNeutral
              ? 'bg-primary focus:ring-primary'
              : isPositive
              ? 'bg-green-500 focus:ring-green-500'
              : 'bg-red-500 focus:ring-red-500'
          }`}
        />
      </Slider.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

export default WhatIfSimulator;
