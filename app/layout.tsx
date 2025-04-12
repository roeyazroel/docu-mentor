import type React from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>DocuMentor</title>
        <meta name="description" content="AI-powered document editor" />
      </head>
      <body>{children}</body>
    </html>
  );
}
