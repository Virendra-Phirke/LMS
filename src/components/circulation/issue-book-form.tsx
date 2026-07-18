"use client";

import { useState } from "react";
import { issueBook } from "@/actions/circulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function IssueBookForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;
    const barcode = formData.get("barcode") as string;

    if (!userId || !barcode) {
      toast.error("Both User ID and Barcode are required");
      return;
    }

    setLoading(true);
    try {
      const result = await issueBook(userId, barcode);
      if (result.success) {
        toast.success(result.message);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch { 
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">Student User ID</Label>
        <Input
          id="userId"
          name="userId"
          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          required
          className="bg-background/50 h-10"
        />
        <p className="text-xs text-muted-foreground">
          Enter the student&apos;s unique UUID.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="barcode">Book Barcode</Label>
        <Input
          id="barcode"
          name="barcode"
          placeholder="e.g. LIB-0123-ABCD-0"
          required
          className="bg-background/50 h-10"
        />
        <p className="text-xs text-muted-foreground">
          Scan or enter the book copy&apos;s barcode.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full gap-2">
        <ArrowUpRight className="w-4 h-4" />
        {loading ? "Issuing..." : "Issue Book"}
      </Button>
    </form>
  );
}
