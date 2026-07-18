import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
