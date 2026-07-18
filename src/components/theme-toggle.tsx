"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle theme"
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground"
    >
      <Moon className="w-5 h-5 dark:hidden" />
      <Sun className="w-5 h-5 hidden dark:inline-block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
