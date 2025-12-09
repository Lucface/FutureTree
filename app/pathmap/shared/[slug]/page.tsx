'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Lock, AlertCircle, Loader2, Clock, Eye, Share2 } from 'lucide-react';
import { TreeNavigator, type TreeNode } from '@/components/pathmap';

interface SharedPathData {
  path: {
    id: string;
    name: string;
    slug: string;
    summary: string;
    description: string | null;
    successRate: string | null;
    caseCount: number | null;
    timelineP25: number | null;
    timelineP75: number | null;
    capitalP25: string | null;
    capitalP75: string | null;
    riskScore: string | null;
    confidenceLevel: string | null;
    icon: string | null;
    color: string | null;
  };
  nodes: TreeNode[];
  state: {
    disclosureLevel: 1 | 2 | 3;
    expandedNodeIds: string[];
    selectedNodeId?: string;
    notes?: string;
  };
  shareInfo: {
    title: string | null;
    viewCount: number;
    maxViews: number | null;
    expiresAt: string;
  };
}

export default function SharedPathPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [status, setStatus] = useState<'loading' | 'password' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [pathData, setPathData] = useState<SharedPathData | null>(null);
  const [linkInfo, setLinkInfo] = useState<{
    title: string | null;
    pathName: string;
  } | null>(null);

  // Initial check for link validity
  useEffect(() => {
    const checkLink = async () => {
      try {
        const response = await fetch(`/api/pathmap/share?slug=${slug}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message);
          setStatus('error');
          return;
        }

        setLinkInfo({
          title: data.shareLink.title,
          pathName: data.shareLink.pathName,
        });

        if (data.shareLink.requiresPassword) {
          setRequiresPassword(true);
          setStatus('password');
        } else {
          // No password required, access directly
          await accessLink();
        }
      } catch {
        setError('Failed to load share link');
        setStatus('error');
      }
    };

    checkLink();
  }, [slug]);

  const accessLink = useCallback(async (pwd?: string) => {
    try {
      setStatus('loading');
      const response = await fetch('/api/pathmap/share/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          password: pwd,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setStatus('password');
          return;
        }
        setError(data.message);
        setStatus('error');
        return;
      }

      setPathData(data.data);
      setStatus('success');
    } catch {
      setError('Failed to access share link');
      setStatus('error');
    }
  }, [slug]);

  const handlePasswordSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    accessLink(password);
  }, [password, accessLink]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading shared path...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Unable to Load</h1>
          <p className="text-muted-foreground">{error}</p>
          <a
            href="/pathmap"
            className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to PathMap
          </a>
        </div>
      </div>
    );
  }

  // Password prompt
  if (status === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Password Required</h1>
            {linkInfo && (
              <p className="text-muted-foreground mt-2">
                {linkInfo.title || linkInfo.pathName}
              </p>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Access Path
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Success - show shared path
  if (status === 'success' && pathData) {
    const { path, nodes, state, shareInfo } = pathData;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold">
                    {shareInfo.title || path.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Shared Path View
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {shareInfo.viewCount} {shareInfo.maxViews && `/ ${shareInfo.maxViews}`}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Expires {new Date(shareInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Path Info */}
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 p-4 bg-background rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">{path.name}</h2>
            <p className="text-muted-foreground">{path.summary}</p>
            {path.description && (
              <p className="mt-2 text-sm">{path.description}</p>
            )}
          </div>

          {/* Notes from sharer */}
          {state.notes && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Notes from sharer
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {state.notes}
              </p>
            </div>
          )}

          {/* Tree Navigator */}
          <div className="bg-background rounded-lg border" style={{ height: '600px' }}>
            <TreeNavigator
              pathId={path.id}
              nodes={nodes}
              rootNodeId={nodes.find(n => !n.parentId)?.id}
              disclosureLevel={state.disclosureLevel}
              initialExpandedNodeIds={state.expandedNodeIds}
              initialSelectedNodeId={state.selectedNodeId}
              isReadOnly
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t mt-8 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <a href="/pathmap" className="text-primary hover:underline">
                FutureTree PathMap
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return null;
}
