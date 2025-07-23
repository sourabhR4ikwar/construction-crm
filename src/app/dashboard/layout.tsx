import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = (user.role as UserRole) || "readonly";

  return (
    <DashboardLayout
      userRole={userRole}
      userName={user.name || undefined}
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}