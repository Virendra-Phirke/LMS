"use client";

import { useAccessibility } from "@/components/providers/accessibility-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
  } = useAccessibility();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and accessibility settings.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color scheme.
                </p>
              </div>
              <Select value={theme} onValueChange={(val) => setTheme(val || "system")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>
              Adjust features to make the application easier to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast" className="text-base">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increases border visibility and uses pure colors for better readability.
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion" className="text-base">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Disables animations and transitions across the interface.
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Text Size</Label>
                <p className="text-sm text-muted-foreground">
                  Scale the overall text size of the application.
                </p>
              </div>
              <Select value={fontSize} onValueChange={(v) => setFontSize((v as "normal" | "large" | "x-large") || "normal")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="x-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
