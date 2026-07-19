"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateBook } from "@/actions/books";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditBookDialogProps {
  book: {
    id: string;
    title: string;
    isbn: string;
    callNumber: string | null;
    year: number | null;
    description: string | null;
    coverImage: string | null;
    totalCopies: number;
    availableCopies: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditBookDialog({
  book,
  open,
  onOpenChange,
  onSuccess,
}: EditBookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(book.title);
  const [isbn, setIsbn] = useState(book.isbn);
  const [callNumber, setCallNumber] = useState(book.callNumber || "");
  const [year, setYear] = useState(book.year?.toString() || "");
  const [description, setDescription] = useState(book.description || "");

  const resetForm = () => {
    setTitle(book.title);
    setIsbn(book.isbn);
    setCallNumber(book.callNumber || "");
    setYear(book.year?.toString() || "");
    setDescription(book.description || "");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("isbn", isbn.trim());
    formData.set("callNumber", callNumber.trim());
    formData.set("year", year.trim());
    formData.set("description", description.trim());
    formData.set("coverImage", book.coverImage || "");

    try {
      const result = await updateBook(book.id, formData);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-lg glass-card border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                ISBN: {book.isbn}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/30 bg-destructive/10"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              required
              className="h-10 bg-background/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-isbn">ISBN</Label>
              <Input
                id="edit-isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Enter ISBN"
                required
                className="h-10 bg-background/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-callNumber">Call Number</Label>
              <Input
                id="edit-callNumber"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="e.g. QA76.73"
                className="h-10 bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                type="number"
                className="h-10 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Copies</Label>
              <Input
                value={`${book.availableCopies} / ${book.totalCopies}`}
                disabled
                className="h-10 bg-muted/50 text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Copy count managed via circulation
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter book description"
              className="bg-background/50 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
