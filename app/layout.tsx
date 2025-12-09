import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "../components/PostHogProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FutureTree - Strategic Intelligence Platform",
  description: "AI-powered strategic planning for small business growth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
