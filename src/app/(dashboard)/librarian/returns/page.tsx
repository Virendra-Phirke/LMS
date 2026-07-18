import { requireLibrarian } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ReturnBookForm } from "@/components/circulation/return-book-form";

export const metadata = {
  title: "Return Book - LMS",
};

export default async function ReturnPage() {
  const authError = await requireLibrarian();
  if (authError) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Return Book</h1>
        <p className="text-muted-foreground mt-1">
          Scan or enter a book barcode to return a book to the library.
        </p>
      </div>
      <div className="border rounded-xl p-6 bg-card">
        <ReturnBookForm />
      </div>
    </div>
  );
}
