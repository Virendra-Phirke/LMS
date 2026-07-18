import { requireLibrarian } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { IssueBookForm } from "@/components/circulation/issue-book-form";

export const metadata = {
  title: "Issue Book - LMS",
};

export default async function BorrowPage() {
  const authError = await requireLibrarian();
  if (authError) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue Book</h1>
        <p className="text-muted-foreground mt-1">
          Scan or enter a book barcode and student ID to issue a book.
        </p>
      </div>
      <div className="border rounded-xl p-6 bg-card">
        <IssueBookForm />
      </div>
    </div>
  );
}
