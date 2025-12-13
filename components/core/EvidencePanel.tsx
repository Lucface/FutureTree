'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  ExternalLink,
  TrendingUp,
  Shield,
  BookOpen,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Surface } from '@/components/primitives';
import { Shimmer, ShimmerGroup } from '@/components/primitives';

/**
 * EvidencePanel - Collapsible evidence/detail panel
 *
 * A flexible panel for displaying detailed evidence, metrics, and
 * supporting information with collapsible sections.
 *
 * @example
 * ```tsx
 * <EvidencePanel
 *   title="Market Analysis"
 *   sections={[
 *     { type: 'metrics', title: 'Key Metrics', items: [...] },
 *     { type: 'risks', title: 'Risk Factors', items: [...] },
 *   ]}
 *   onClose={handleClose}
 * />
 * ```
 */

const evidencePanelVariants = cva('', {
  variants: {
    variant: {
      sidebar: 'fixed right-0 top-0 h-full w-96 border-l shadow-xl z-50',
      drawer: 'fixed bottom-0 left-0 right-0 h-[60vh] border-t shadow-xl z-50 rounded-t-2xl',
      inline: 'relative w-full rounded-xl border',
      modal: 'fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] rounded-xl shadow-2xl z-50',
    },
  },
  defaultVariants: {
    variant: 'sidebar',
  },
});

// Section types
type SectionType = 'metrics' | 'list' | 'risks' | 'mitigations' | 'documents' | 'insights' | 'custom';

interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

interface ListItem {
  text: string;
  icon?: LucideIcon;
  href?: string;
}

interface DocumentItem {
  title: string;
  url: string;
  type?: string;
}

interface EvidenceSection {
  id: string;
  type: SectionType;
  title: string;
  icon?: LucideIcon;
  defaultExpanded?: boolean;
  // Type-specific content
  metrics?: MetricItem[];
  items?: ListItem[];
  documents?: DocumentItem[];
  customContent?: React.ReactNode;
  // Optional description
  description?: string;
}

export interface EvidencePanelProps extends VariantProps<typeof evidencePanelVariants> {
  /** Panel title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Sections to display */
  sections: EvidenceSection[];
  /** Show panel */
  isOpen?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Track document clicks */
  onDocumentClick?: (documentUrl: string, documentTitle: string) => void;
  /** Additional className */
  className?: string;
  /** Show overlay (for sidebar/drawer/modal) */
  showOverlay?: boolean;
}

export function EvidencePanel({
  title,
  subtitle,
  sections,
  variant = 'sidebar',
  isOpen = true,
  onClose,
  onDocumentClick,
  className,
  showOverlay = true,
}: EvidencePanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(() => {
    // Initialize with defaultExpanded sections
    const expanded = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultExpanded !== false) {
        expanded.add(section.id);
      }
    });
    return expanded;
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Animation variants
  const panelAnimation = {
    sidebar: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    drawer: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
    },
    inline: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    modal: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
  };

  const animation = panelAnimation[variant || 'sidebar'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && variant !== 'inline' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
          )}

          {/* Panel */}
          <motion.div
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(evidencePanelVariants({ variant }), className)}
          >
            <Surface
              variant="raised"
              padding="none"
              className={cn(
                'h-full flex flex-col overflow-hidden',
                variant === 'modal' && 'max-h-[80vh]'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b bg-muted/30">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-display text-lg font-semibold truncate">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {subtitle}
                    </p>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                    aria-label="Close panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {sections.map((section) => (
                    <CollapsibleSection
                      key={section.id}
                      section={section}
                      isExpanded={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      onDocumentClick={onDocumentClick}
                    />
                  ))}
                </div>
              </div>
            </Surface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Collapsible section component
interface CollapsibleSectionProps {
  section: EvidenceSection;
  isExpanded: boolean;
  onToggle: () => void;
  onDocumentClick?: (url: string, title: string) => void;
}

function CollapsibleSection({
  section,
  isExpanded,
  onToggle,
  onDocumentClick,
}: CollapsibleSectionProps) {
  const SectionIcon = section.icon || getSectionIcon(section.type);

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-3 text-left',
          'hover:bg-muted/50 transition-colors',
          isExpanded && 'bg-muted/30'
        )}
      >
        <SectionIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="flex-1 font-medium text-sm">{section.title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-4 pb-4 pt-1">
              {section.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {section.description}
                </p>
              )}

              {/* Render based on section type */}
              {section.type === 'metrics' && section.metrics && (
                <MetricsContent metrics={section.metrics} />
              )}

              {section.type === 'list' && section.items && (
                <ListContent items={section.items} />
              )}

              {section.type === 'risks' && section.items && (
                <RisksContent items={section.items} />
              )}

              {section.type === 'mitigations' && section.items && (
                <MitigationsContent items={section.items} />
              )}

              {section.type === 'documents' && section.documents && (
                <DocumentsContent
                  documents={section.documents}
                  onDocumentClick={onDocumentClick}
                />
              )}

              {section.type === 'insights' && section.items && (
                <InsightsContent items={section.items} />
              )}

              {section.type === 'custom' && section.customContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Section content renderers
function MetricsContent({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="p-3 bg-muted/50 rounded-lg"
        >
          <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-lg font-semibold',
                metric.color === 'success' && 'text-emerald-600 dark:text-emerald-400',
                metric.color === 'warning' && 'text-amber-600 dark:text-amber-400',
                metric.color === 'danger' && 'text-red-600 dark:text-red-400'
              )}
            >
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            )}
            {metric.trend && (
              <TrendingUp
                className={cn(
                  'h-3 w-3 ml-1',
                  metric.trend === 'up' && 'text-emerald-500',
                  metric.trend === 'down' && 'text-red-500 rotate-180',
                  metric.trend === 'neutral' && 'text-muted-foreground rotate-90'
                )}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListContent({ items }: { items: ListItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const ItemIcon = item.icon || ChevronRight;
        const content = (
          <li
            className={cn(
              'flex items-start gap-2 text-sm',
              item.href && 'group cursor-pointer hover:text-primary transition-colors'
            )}
          >
            <ItemIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>{item.text}</span>
            {item.href && (
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            )}
          </li>
        );

        if (item.href) {
          return (
            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          );
        }
        return <React.Fragment key={i}>{content}</React.Fragment>;
      })}
    </ul>
  );
}

function RisksContent({ items }: { items: ListItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md text-red-800 dark:text-red-200"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function MitigationsContent({ items }: { items: ListItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-md text-emerald-800 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function DocumentsContent({
  documents,
  onDocumentClick,
}: {
  documents: DocumentItem[];
  onDocumentClick?: (url: string, title: string) => void;
}) {
  return (
    <div className="space-y-2">
      {documents.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onDocumentClick?.(doc.url, doc.title)}
          className="flex items-center gap-2 p-2 bg-muted/50 hover:bg-muted rounded-md transition-colors text-sm group"
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{doc.title}</span>
          {doc.type && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background rounded">
              {doc.type}
            </span>
          )}
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

function InsightsContent({ items }: { items: ListItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-md text-blue-800 dark:text-blue-200"
        >
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

// Helper function to get default icon for section type
function getSectionIcon(type: SectionType): LucideIcon {
  const iconMap: Record<SectionType, LucideIcon> = {
    metrics: BarChart3,
    list: Info,
    risks: AlertTriangle,
    mitigations: Shield,
    documents: BookOpen,
    insights: Lightbulb,
    custom: Info,
  };
  return iconMap[type];
}

// Skeleton loader
export function EvidencePanelSkeleton({
  variant = 'sidebar',
  sectionCount = 4,
}: {
  variant?: 'sidebar' | 'drawer' | 'inline' | 'modal';
  sectionCount?: number;
}) {
  return (
    <div className={cn(evidencePanelVariants({ variant }), 'bg-card')}>
      <Surface variant="raised" padding="none" className="h-full flex flex-col">
        {/* Header skeleton */}
        <div className="px-5 py-4 border-b">
          <ShimmerGroup gap="sm">
            <Shimmer variant="heading" className="w-2/3 h-6" />
            <Shimmer variant="text" className="w-1/2" />
          </ShimmerGroup>
        </div>

        {/* Sections skeleton */}
        <div className="p-4 space-y-2">
          {Array.from({ length: sectionCount }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4">
              <ShimmerGroup gap="md">
                <div className="flex items-center gap-2">
                  <Shimmer variant="avatar" size="sm" className="rounded" />
                  <Shimmer variant="text" className="w-32 h-4" />
                </div>
                <div className="space-y-2 mt-3">
                  <Shimmer variant="text" className="w-full" />
                  <Shimmer variant="text" className="w-3/4" />
                </div>
              </ShimmerGroup>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

export type { EvidenceSection, MetricItem, ListItem, DocumentItem, SectionType };
