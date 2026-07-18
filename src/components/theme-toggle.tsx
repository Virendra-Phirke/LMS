"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle high contrast theme"
      aria-label="Toggle high contrast theme"
      className="h-9 w-9 rounded-md"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline-block">☀️</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
