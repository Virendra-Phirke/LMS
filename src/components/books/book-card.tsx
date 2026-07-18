import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { books } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { BookMarked } from "lucide-react";

type Book = InferSelectModel<typeof books>;

export function BookCard({ book }: { book: Book }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <Link href={`/student/books/${book.id}`} className="group block h-full">
      <Card className="h-full flex flex-col glass-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Cover Image Placeholder */}
        <div className="aspect-[2/3] w-full bg-muted/30 flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity">
          {book.coverImage ? (
            <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <BookMarked className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <span className="text-xs text-muted-foreground font-medium line-clamp-3 px-2">
                {book.title}
              </span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
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
