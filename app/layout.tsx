import ClerkWrapper from "@/components/clerkWrapper";
import Navbar from "@/components/landing/Navbar";
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
      <LiveBlocksWrapper>
        <html lang="en" suppressHydrationWarning>
          <head>
            <title>DocuMentor</title>
            <meta name="description" content="AI-powered document editor" />
          </head>
          <Navbar />
          <body>{children}</body>
        </html>
      </LiveBlocksWrapper>
    </ClerkWrapper>
  );
}
