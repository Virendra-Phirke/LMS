import { Suspense } from "react";
import { getBooks } from "@/actions/books";
import { BooksDataTable } from "@/components/books/books-data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { requireLibrarian } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Stock - LMS Librarian",
};

export default async function LibrarianBooksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const authError = await requireLibrarian();
  if (authError) redirect("/login");

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const booksData = await getBooks({ page, limit: 10, search });

  return (
    <div className="space-y-6" role="main" aria-label="Book Stock Management">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Library Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Browse books and manage physical stock availability.
        </p>
      </header>

      <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
        <BooksDataTable books={booksData.books} pagination={booksData.pagination} />
      </Suspense>
    </div>
  );
}
