"use client";

import { useState } from "react";
import { THEMES, LAYOUT_PRESETS } from "@/lib/generateLibraryIDCard";
import { updateSystemSettings } from "@/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface IdCardSettingsFormProps {
  initialConfig: {
    libraryName: string;
    idCardTheme: string;
    idCardLayout: string;
  };
}

export function IdCardSettingsForm({ initialConfig }: IdCardSettingsFormProps) {
  const [libraryName, setLibraryName] = useState(initialConfig.libraryName);
  const [idCardTheme, setIdCardTheme] = useState(initialConfig.idCardTheme);
  const [idCardLayout, setIdCardLayout] = useState(initialConfig.idCardLayout);
  const [isLoading, setIsLoading] = useState(false);

  const themeKeys = Object.keys(THEMES);
  const layoutKeys = Object.keys(LAYOUT_PRESETS);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSystemSettings({
        libraryName,
        idCardTheme,
        idCardLayout,
      });
      toast.success("ID Card settings updated successfully.");
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Library ID Card Configuration</CardTitle>
        <CardDescription>
          Set the global design and layout for all generated student ID cards. 
          These settings apply immediately to any newly downloaded cards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="libraryName">Library Name (Header)</Label>
          <Input 
            id="libraryName"
            value={libraryName} 
            onChange={(e) => setLibraryName(e.target.value)}
            placeholder="e.g. City Central Library"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Color Theme</Label>
          <Select value={idCardTheme} onValueChange={setIdCardTheme}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {themeKeys.map(key => (
                <SelectItem key={key} value={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="layout">Layout Preset</Label>
          <Select value={idCardLayout} onValueChange={setIdCardLayout}>
            <SelectTrigger id="layout">
              <SelectValue placeholder="Select a layout" />
            </SelectTrigger>
            <SelectContent>
              {layoutKeys.map(key => (
                <SelectItem key={key} value={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
