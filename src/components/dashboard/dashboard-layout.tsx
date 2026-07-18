"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

// ─── Navigation Config ───────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Books", href: "/admin/books", icon: "📚" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ],
  LIBRARIAN: [
    { label: "Dashboard", href: "/librarian", icon: "📊" },
    { label: "Students", href: "/librarian/students", icon: "🎓" },
    { label: "Book Stock", href: "/librarian/books", icon: "📦" },
    { label: "Borrow", href: "/librarian/borrow", icon: "📖" },
    { label: "Returns", href: "/librarian/returns", icon: "↩️" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: "📊" },
    { label: "Catalog", href: "/student/books", icon: "📚" },
    { label: "Profile", href: "/profile", icon: "👤" },
    { label: "Reservations", href: "/reservations", icon: "📋" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  LIBRARIAN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  STUDENT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    role: string;
    profile: { fullName: string; avatar: string | null } | null;
  };
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = NAV_ITEMS[user.role] || [];
  const initials =
    user.profile?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-lg">📚</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-primary">Library</span>
              <span className="text-muted-foreground font-light">MS</span>
            </h1>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${user.role.toLowerCase()}` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User card at bottom */}
      <div className="p-4 pt-2">
        <Separator className="opacity-50 mb-4" />
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.profile?.fullName || "User"}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[user.role]}`}
            >
              {user.role}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 flex px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 flex-col border-r border-border/50 bg-card/50">
        {renderSidebarContent()}
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger
              className="lg:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          {/* Breadcrumb-like path */}
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              {pathname
                .split("/")
                .filter(Boolean)
                .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
                .join(" / ")}
            </p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex items-center gap-2 cursor-pointer"
              >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.profile?.fullName || "User"}
                  </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">
                      {user.profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
