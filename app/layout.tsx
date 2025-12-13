import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from '../components/PostHogProvider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SkipLink } from '@/components/accessibility';
import './globals.css';

export const metadata: Metadata = {
  title: 'FutureTree - Strategic Intelligence Platform',
  description:
    'Discover where your business could go. Real proof from 700+ businesses that achieved exactly what you want.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fontshare: Clash Display (headlines) + Satoshi (body) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />

        {/* Google Fonts: JetBrains Mono (code, metrics) */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <PostHogProvider>
              <SmoothScrollProvider>
                <SkipLink />
                <main id="main-content" className="min-h-screen">
                  {children}
                </main>
              </SmoothScrollProvider>
            </PostHogProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
