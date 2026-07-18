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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Edit, BookX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { books } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Book = InferSelectModel<typeof books>;

export function BooksDataTable({ 
  books, 
  pagination 
}: { 
  books: Book[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

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

      <div className="rounded-md border bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{book.title}</span>
                      {book.callNumber && (
                        <span className="text-xs text-muted-foreground">Call #: {book.callNumber}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
                  <TableCell>
                    {book.availableCopies > 0 ? (
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">
                        {book.availableCopies} of {book.totalCopies} Available
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20">
                        Out of Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{book.year || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />
                        }
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </TooltipTrigger>
                      <TooltipContent>Edit book</TooltipContent>
                    </Tooltip>
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
    </div>
  );
}
