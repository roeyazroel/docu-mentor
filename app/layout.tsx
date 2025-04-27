import ClerkWrapper from "@/components/clerkWrapper";
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkWrapper>
      <html lang="en" suppressHydrationWarning className={cn("antialiased", inter.variable)}>
        <head>
          <title>DocuMentor</title>
          <meta name="description" content="AI-powered document editor" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkWrapper>
  );
}
