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
        <div className="w-full md:w-64 space-y-6 shrink-0 glass-card p-6 h-fit sticky top-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search Books</label>
              <Input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="Title or ISBN..."
                className="bg-background/50 h-10"
              />
            </div>
            
            <Button type="submit" className="w-full h-10">Apply Filters</Button>
            {search && (
              <Link 
                href="/student/books"
                className={buttonVariants({ variant: "ghost", className: "w-full h-10" })}
              >
                Clear Filters
              </Link>
            )}
          </form>

          <div className="pt-6 border-t border-border/50">
            <h3 className="font-semibold mb-3 text-sm tracking-wide uppercase text-muted-foreground">Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id} className="hover:text-primary cursor-pointer transition-colors font-medium">
                  {cat.name}
                </li>
              ))}
              {categories.length === 0 && <li className="text-muted-foreground">No categories found.</li>}
            </ul>
          </div>
        </div>

        {/* Book Grid */}
        <div className="flex-1">
          {booksData.books.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center glass-card border-dashed bg-card/20 text-muted-foreground text-center p-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-lg font-medium text-foreground">No books found matching your criteria.</p>
              <p className="text-sm max-w-sm mt-1">Try adjusting your search terms or clearing the filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
