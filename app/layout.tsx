import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from '../components/PostHogProvider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FutureTree - Strategic Intelligence Platform',
  description:
    'Discover where your business could go. Real proof from 700+ businesses that achieved exactly what you want.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PostHogProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
