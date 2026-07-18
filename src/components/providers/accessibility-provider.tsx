"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type FontSize = "normal" | "large" | "x-large";

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSize: FontSize;
  setFontSize: (val: FontSize) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const storedContrast = localStorage.getItem("lms-high-contrast") === "true";
    const storedFontSize = (localStorage.getItem("lms-font-size") as FontSize) || "normal";
    const storedMotion = localStorage.getItem("lms-reduced-motion") === "true";

    setTimeout(() => {
      setHighContrast(storedContrast);
      setFontSize(storedFontSize);
      setReducedMotion(storedMotion);
      setMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply High Contrast
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    localStorage.setItem("lms-high-contrast", String(highContrast));

    // Apply Font Size
    root.classList.remove("text-normal", "text-large", "text-x-large");
    root.classList.add(`text-${fontSize}`);
    if (fontSize === "normal") root.style.fontSize = "16px";
    if (fontSize === "large") root.style.fontSize = "18px";
    if (fontSize === "x-large") root.style.fontSize = "20px";
    localStorage.setItem("lms-font-size", fontSize);

    // Apply Reduced Motion
    if (reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
    localStorage.setItem("lms-reduced-motion", String(reducedMotion));
  }, [highContrast, fontSize, reducedMotion, mounted]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
