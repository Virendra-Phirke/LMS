import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { setupStudentProfile } from "@/actions/users";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/login");
  }

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!user) {
    await setupStudentProfile();
    // Re-fetch after creation
    [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);
    
    if (!user) redirect("/login");
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  return (
    <DashboardLayout
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profile
          ? { fullName: profile.fullName, avatar: profile.avatar }
          : null,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
