"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/lib/auth-utils";
import {
  Menu,
  Home,
  FolderOpen,
  Building2,
  Users,
  Plus,
  UserCog,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Search,
  Bell,
  LogOut
} from "lucide-react";

interface SideDrawerNavProps {
  userRole: UserRole;
  userName?: string;
  userEmail?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  requiredRole?: UserRole[];
}

// Reusable sidebar content component
function SidebarContent({ userRole, userName, userEmail, onNavClick }: SideDrawerNavProps & { onNavClick?: () => void }) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "admin" || userRole === "staff";

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Project overview and KPIs"
    },
    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: FolderOpen,
      description: "Manage construction projects"
    },
    {
      label: "Companies",
      href: "/dashboard/companies",
      icon: Building2,
      description: "Manage companies and contractors"
    },
    {
      label: "Contacts",
      href: "/dashboard/contacts",
      icon: Users,
      description: "Manage company contacts"
    },
    {
      label: "Create Project",
      href: "/dashboard/projects",
      icon: Plus,
      description: "Start a new project",
      requiredRole: ["admin", "staff"],
      badge: "New"
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      description: "Project reports and analytics",
      requiredRole: ["admin", "staff"],
      badge: "Coming Soon"
    },
    {
      label: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
      description: "Project deadlines and milestones",
      badge: "Coming Soon"
    },
    {
      label: "Search",
      href: "/dashboard/search",
      icon: Search,
      description: "Global search across all data",
      badge: "Coming Soon"
    },
    {
      label: "User Management",
      href: "/dashboard/admin/users",
      icon: UserCog,
      description: "Manage users and permissions",
      requiredRole: ["admin"]
    },
    {
      label: "System Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
      description: "Configure system settings",
      requiredRole: ["admin"],
      badge: "Coming Soon"
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(userRole);
  });

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Construction CRM</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Navigate quickly to any section
        </p>
      </div>

      {/* User Info Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {(userName || userEmail || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {userName || userEmail}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {userRole} Access
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        {/* Navigation Items */}
        <nav className="p-6 pb-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-3">
            Main Navigation
          </div>
          
          {filteredNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50 ${
                  isActive ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={isActive ? "font-medium" : "font-medium"}>{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badge === "New" ? "default" : "secondary"} className="text-xs ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Actions Section */}
          {isStaff && (
            <>
              <Separator className="my-6" />
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-3">
                Actions
              </div>
              
              {filteredNavItems.slice(4, 8).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavClick}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50 ${
                      isActive ? "bg-primary/10 text-primary font-medium" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={isActive ? "font-medium" : "font-medium"}>{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badge === "New" ? "default" : "secondary"} className="text-xs ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <Separator className="my-6" />
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-3">
                Administration
              </div>
              
              {filteredNavItems.slice(-2).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavClick}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-destructive/10 ${
                      isActive ? "bg-destructive/10 text-destructive font-medium" : "text-destructive"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="h-4"></div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 space-y-1 border-t bg-muted/20 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          onClick={onNavClick}
        >
          <Bell className="h-4 w-4" />
          <span className="flex-1 text-left">Notifications</span>
          <Badge variant="secondary" className="text-xs">
            Soon
          </Badge>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onNavClick}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function SideDrawerNav({ userRole, userName, userEmail }: SideDrawerNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-card lg:border-r">
        <SidebarContent 
          userRole={userRole} 
          userName={userName} 
          userEmail={userEmail}
        />
      </div>

      {/* Mobile Menu Button - Only visible on smaller screens */}
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-4 left-4 z-50"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </div>

      {/* Mobile Drawer - Only on smaller screens */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 lg:hidden">
          <SidebarContent 
            userRole={userRole} 
            userName={userName} 
            userEmail={userEmail}
            onNavClick={handleMobileNavClick}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}