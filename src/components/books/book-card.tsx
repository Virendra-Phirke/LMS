import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { books } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Book = InferSelectModel<typeof books>;

export function BookCard({ book }: { book: Book }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <Link href={`/student/books/${book.id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-card/50 backdrop-blur-sm">
        {/* Cover Image Placeholder */}
        <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity">
          {book.coverImage ? (
            <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl opacity-20 mb-2">📚</span>
              <span className="text-xs text-muted-foreground font-medium line-clamp-3 px-2">
                {book.title}
              </span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            {isAvailable ? (
              <Badge variant="default" className="bg-emerald-500/90 hover:bg-emerald-500 backdrop-blur-sm text-white shadow-sm">
                Available
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/90 hover:bg-destructive backdrop-blur-sm text-white shadow-sm">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center mt-auto pt-4">
            <span className="font-mono">{book.isbn}</span>
            {book.year && <span>{book.year}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
