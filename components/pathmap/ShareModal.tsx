'use client';

import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, Link2, Lock, Calendar, Eye, Loader2 } from 'lucide-react';
import type { ExplorationState, ShareLink } from '@/lib/pathmap/types';

interface ShareModalProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Path ID to share */
  pathId: string;
  /** Current exploration state to preserve */
  state: ExplorationState;
  /** Path name for display */
  pathName: string;
}

/**
 * Share Modal
 *
 * Allows users to create shareable links with customizable options:
 * - Expiration period
 * - View limit
 * - Optional password protection
 */
export function ShareModal({
  open,
  onOpenChange,
  pathId,
  state,
  pathName,
}: ShareModalProps) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pathmap/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathId,
          state: {
            disclosureLevel: state.disclosureLevel,
            expandedNodeIds: state.expandedNodeIds,
            selectedNodeId: state.selectedNodeId,
            notes: state.notes,
          },
          expiresInDays,
          maxViews: maxViews || undefined,
          password: password || undefined,
          title: title || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create share link');
      }

      setShareLink(data.shareLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [pathId, state, expiresInDays, maxViews, password, title]);

  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareLink]);

  const handleReset = useCallback(() => {
    setShareLink(null);
    setExpiresInDays(7);
    setMaxViews(undefined);
    setPassword('');
    setTitle('');
    setError(null);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border rounded-xl shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <Dialog.Title className="text-lg font-semibold">
                Share Path
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full p-2 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            Create a shareable link for <span className="font-medium">{pathName}</span>
          </Dialog.Description>

          {!shareLink ? (
            <>
              {/* Options Form */}
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Link Title <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q1 Strategy Review"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expires After
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 7, 30, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setExpiresInDays(days)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          expiresInDays === days
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {days === 1 ? '1 day' : `${days} days`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Limit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Limit <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={maxViews || ''}
                    onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Unlimited"
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              {/* Create Button */}
              <button
                type="button"
                onClick={handleCreateLink}
                disabled={isLoading}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Create Share Link
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Share link created successfully!
                  </p>
                </div>

                {/* Link Display */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink.url}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-muted text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Link Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <p className="font-medium">
                      {new Date(shareLink.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Views:</span>
                    <p className="font-medium">
                      {shareLink.maxViews ? `0 / ${shareLink.maxViews}` : 'Unlimited'}
                    </p>
                  </div>
                </div>

                {shareLink.hasPassword && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password protected
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Create Another
                </button>
                <Dialog.Close className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Done
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ShareModal;
