import ClientLayout from "@/components/editor/ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <TooltipProvider>
        <ClientLayout>{children}</ClientLayout>
      </TooltipProvider>
    </ThemeProvider>
  );
}
