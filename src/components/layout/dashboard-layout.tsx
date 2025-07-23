import { ReactNode } from "react";
import { SideDrawerNav } from "@/components/navigation/side-drawer-nav";
import { UserRole } from "@/lib/auth-utils";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
  userEmail?: string;
}

export function DashboardLayout({ 
  children, 
  userRole, 
  userName, 
  userEmail 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SideDrawerNav 
        userRole={userRole} 
        userName={userName}
        userEmail={userEmail}
      />
      {/* Main content area - leave space for sidebar on desktop */}
      <main className="lg:pl-80">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}