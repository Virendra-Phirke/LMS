import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export default async function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "LIBRARIAN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  return <>{children}</>;
}
