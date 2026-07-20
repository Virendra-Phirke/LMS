import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/actions/auth";
import { setupStudentProfile } from "@/actions/users";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = await getCurrentUser();

  if (!user) {
    // Attempt to setup profile if missing (only works if they have a Clerk session but no DB record)
    await setupStudentProfile();
    user = await getCurrentUser();
    if (!user) redirect("/login");
  }

  return (
    <DashboardLayout
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
          ? { fullName: user.profile.fullName, avatar: user.profile.avatar }
          : null,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
