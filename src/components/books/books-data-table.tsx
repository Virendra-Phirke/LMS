"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditBookDialog } from "./edit-book-dialog";
import { useState } from "react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreHorizontal, Pencil, Trash2, BookX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { books } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { deleteBook } from "@/actions/books";
import { toast } from "sonner";

type Book = InferSelectModel<typeof books>;

export function BooksDataTable({
  books,
  pagination,
}: {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteBook(deleteTarget.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete book");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <Input
          placeholder="Search by title or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background/50"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
              <TableHead>Title</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BookX className="h-10 w-10 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No books found</p>
                    <p className="text-sm">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow
                  key={book.id}
                  className="group hover:bg-accent/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{book.title}</span>
                      {book.callNumber && (
                        <span className="text-xs text-muted-foreground">
                          Call #: {book.callNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {book.isbn}
                  </TableCell>
                  <TableCell>
                    {book.availableCopies > 0 ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5"
                      >
                        {book.availableCopies} of {book.totalCopies} Available
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{book.year || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => setEditBook(book)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Book
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          onClick={() => setDeleteTarget(book)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Book
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        limit={pagination.limit}
      />

      {/* Edit Book Dialog */}
      {editBook && (
        <EditBookDialog
          book={editBook}
          open={!!editBook}
          onOpenChange={(val) => {
            if (!val) setEditBook(null);
          }}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmationDialog
          open={!!deleteTarget}
          onOpenChange={(val) => {
            if (!val) setDeleteTarget(null);
          }}
          title="Delete Book Permanently"
          description={`This will permanently delete "${deleteTarget.title}" and all associated copies, borrow records, and reservations. This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          variant="destructive"
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
