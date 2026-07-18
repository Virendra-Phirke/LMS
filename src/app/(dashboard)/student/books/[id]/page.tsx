import { requireStudent } from "@/lib/auth/session";
import { getBookById } from "@/actions/books";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReserveBookButton } from "@/components/circulation/reserve-book-button";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link href="/student/books" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 w-fit group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image Placeholder */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="aspect-[2/3] bg-muted/30 rounded-xl flex items-center justify-center glass-card border-border/50 shadow-sm relative overflow-hidden">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="text-muted-foreground/30 w-24 h-24" />
            )}
            <div className="absolute top-4 right-4">
              {isAvailable ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 backdrop-blur-sm shadow-sm text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                  Available
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 backdrop-blur-sm shadow-sm text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-2 font-mono">ISBN: {book.isbn}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm glass-card p-6">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Publication Year</p>
              <p className="font-medium text-base">{book.year || "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Total Copies</p>
              <p className="font-medium text-base">{book.totalCopies}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Available Copies</p>
              <p className="font-medium text-base">
                <span className={isAvailable ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                  {book.availableCopies}
                </span>
              </p>
            </div>
            {book.callNumber && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Call Number</p>
                <p className="font-medium text-base font-mono">{book.callNumber}</p>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              {book.description || "No description available for this book."}
            </p>

            <div className="pt-6">
              {isAvailable ? (
                <div className="bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-xl w-full text-center font-medium border border-emerald-500/20">
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
