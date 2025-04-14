import ClientLayout from "@/components/editor/ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import type React from "react";
import "../globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClientLayout>{children}</ClientLayout>
    </ThemeProvider>
  );
}
