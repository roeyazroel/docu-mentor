"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export default function ClerkWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [actualTheme, setActualTheme] = useState<string | undefined>("system");

  useEffect(() => {
    console.log("theme", theme);
    if (theme === "system" && actualTheme !== theme) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    } else {
      setActualTheme(theme);
    }
  }, [theme, actualTheme]);

  useEffect(() => {
    if (theme === "system" && actualTheme !== theme) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    } else {
      setActualTheme(theme);
    }
  }, []);

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      appearance={{
        baseTheme: actualTheme === "dark" ? dark : undefined,
        userButton: {
          elements: {
            userButtonTrigger: "shadow-none focus:shadow-none",
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
