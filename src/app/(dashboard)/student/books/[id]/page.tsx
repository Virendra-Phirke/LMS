import { requireStudent } from "@/lib/auth/session";
import { getBookById } from "@/actions/books";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReserveBookButton } from "@/components/circulation/reserve-book-button";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Book Details - LMS",
};

export default async function BookDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const authError = await requireStudent();
  if (authError) redirect("/login");

  const session = await getSession();
  if (!session) redirect("/login");

  const book = await getBookById(params.id);

  if (!book) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <p className="text-muted-foreground mt-2">
          The book you are looking for does not exist.
        </p>
        <Button render={<Link href="/student/books" />} className="mt-6">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/student/books" className="text-sm text-primary hover:underline flex items-center gap-2">
        <span>←</span> Back to Catalog
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image Placeholder */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="aspect-[2/3] bg-muted rounded-xl flex items-center justify-center border shadow-sm">
            <span className="text-muted-foreground/50 text-4xl">📚</span>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">ISBN: {book.isbn}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Publication Year</p>
              <p className="font-medium">{book.year || "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Copies</p>
              <p className="font-medium">{book.totalCopies}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Available Copies</p>
              <p className="font-medium">
                <span className={isAvailable ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                  {book.availableCopies}
                </span>
              </p>
            </div>
          </div>

          <div className="pt-6 border-t space-y-4">
            <p className="text-base leading-relaxed">
              {book.description || "No description available for this book."}
            </p>

            <div className="pt-4 flex gap-4">
              {isAvailable ? (
                <div className="bg-emerald-500/10 text-emerald-600 px-4 py-3 rounded-lg w-full text-center font-medium border border-emerald-500/20">
                  Currently Available in Library
                </div>
              ) : (
                <ReserveBookButton userId={session.sub} bookId={book.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
