"use client";

import { useState } from "react";
import { returnBook } from "@/actions/circulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReturnBookForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const barcode = formData.get("barcode") as string;

    if (!barcode) {
      toast.error("Barcode is required");
      return;
    }

    setLoading(true);
    try {
      const result = await returnBook(barcode);
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
        <Label htmlFor="barcode">Book Barcode</Label>
        <Input
          id="barcode"
          name="barcode"
          placeholder="e.g. LIB-0123-ABCD-0"
          required
        />
        <p className="text-xs text-muted-foreground">
          Scan or enter the book copy&apos;s barcode.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Processing..." : "Process Return"}
      </Button>
    </form>
  );
}
