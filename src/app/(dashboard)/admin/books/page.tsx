import { Suspense } from "react";
import { getBooks, getAuthors, getCategories, getPublishers } from "@/actions/books";
import { BooksDataTable } from "@/components/books/books-data-table";
import { CreateBookDialog } from "@/components/books/create-book-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Books - LMS Admin",
};

export default async function AdminBooksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const authError = await requireAdmin();
  if (authError) redirect("/login");

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const [booksData, authors, categories, publishers] = await Promise.all([
    getBooks({ page, limit: 10, search }),
    getAuthors(),
    getCategories(),
    getPublishers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage library catalog, view availability, and add new books.
          </p>
        </div>
        <CreateBookDialog
          authors={authors}
          categories={categories}
          publishers={publishers}
        />
      </div>

      <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
        <BooksDataTable books={booksData.books} pagination={booksData.pagination} />
      </Suspense>
    </div>
  );
}
