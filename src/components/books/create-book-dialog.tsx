"use client";

import { useActionState, useEffect, useState } from "react";
import { createBook } from "@/actions/books";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { BookPlus } from "lucide-react";
import type { ActionResult } from "@/types";

interface Props {
  authors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  publishers: { id: string; name: string }[];
}

export function CreateBookDialog({ authors, categories, publishers }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createBook,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setTimeout(() => setOpen(false), 0);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="gap-2 bg-primary/90 hover:bg-primary shadow-sm backdrop-blur-sm">
            <BookPlus className="w-4 h-4" /> Add New Book
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto glass-card border-border/50">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Enter the details of the new book to add it to the catalog.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6 pt-4">
          {state?.success === false && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Book title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input id="isbn" name="isbn" required placeholder="13-digit ISBN" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="callNumber">Call Number</Label>
              <Input id="callNumber" name="callNumber" placeholder="e.g. QA76.73" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Publication Year</Label>
              <Input id="year" name="year" type="number" placeholder="2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total Copies</Label>
              <Input id="totalCopies" name="totalCopies" type="number" defaultValue="1" min="1" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisherId">Publisher</Label>
            <select
              id="publisherId"
              name="publisherId"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a publisher...</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Authors</Label>
              <ScrollArea className="h-32 border rounded-md p-3 bg-muted/20">
                <div className="space-y-3">
                  {authors.map((author) => (
                    <div key={author.id} className="flex items-center space-x-2">
                      <Checkbox id={`author-${author.id}`} name="authorIds" value={author.id} />
                      <label
                        htmlFor={`author-${author.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {author.name}
                      </label>
                    </div>
                  ))}
                  {authors.length === 0 && <span className="text-xs text-muted-foreground">No authors available</span>}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <Label>Categories</Label>
              <ScrollArea className="h-32 border rounded-md p-3 bg-muted/20">
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox id={`cat-${cat.id}`} name="categoryIds" value={cat.id} />
                      <label
                        htmlFor={`cat-${cat.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cat.name}
                      </label>
                    </div>
                  ))}
                  {categories.length === 0 && <span className="text-xs text-muted-foreground">No categories available</span>}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief summary of the book..."
              className="resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
