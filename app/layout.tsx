import ClerkWrapper from "@/components/clerkWrapper";
import { LiveBlocksWrapper } from "@/components/liveblocks/providers";
import type React from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Documentor</title>
          <meta name="description" content="AI-powered document editor" />
          <link rel="icon" href="/favicon.png" sizes="any" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkWrapper>
  );
}
