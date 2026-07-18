import { getBooks, getCategories } from "@/actions/books";
import { BookCard } from "@/components/books/book-card";
import { requireStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Library Catalog - LMS",
};

export default async function StudentCatalogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const authError = await requireStudent();
  if (authError) redirect("/login");

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const [booksData, categories] = await Promise.all([
    getBooks({ page, limit: 12, search }),
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Discover new books, search by title, and reserve copies.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6 shrink-0">
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search Books</label>
              <Input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="Title or ISBN..."
                className="bg-background"
              />
            </div>
            
            <Button type="submit" className="w-full">Apply Filters</Button>
            {search && (
              <Link 
                href="/student/books"
                className={buttonVariants({ variant: "ghost", className: "w-full" })}
              >
                Clear Filters
              </Link>
            )}
          </form>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <li key={cat.id} className="hover:text-foreground cursor-pointer transition-colors">
                  {cat.name}
                </li>
              ))}
              {categories.length === 0 && <li>No categories found.</li>}
            </ul>
          </div>
        </div>

        {/* Book Grid */}
        <div className="flex-1">
          {booksData.books.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border rounded-xl border-dashed bg-card/50 text-muted-foreground">
              <p>No books found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {booksData.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
