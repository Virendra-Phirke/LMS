"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LogOut,
  BookOpen,
  Settings,
  Users,
  BookMarked,
  Library,
  LayoutDashboard,
  BarChart,
  ClipboardList,
  BookDown,
  BookUp,
  UserCircle
} from "lucide-react";

// ─── Navigation Config ───────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Books", href: "/admin/books", icon: BookMarked },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  LIBRARIAN: [
    { label: "Dashboard", href: "/librarian", icon: LayoutDashboard },
    { label: "Students", href: "/librarian/students", icon: Users },
    { label: "Book Stock", href: "/librarian/books", icon: BookMarked },
    { label: "Borrow", href: "/librarian/borrow", icon: BookUp },
    { label: "Returns", href: "/librarian/returns", icon: BookDown },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Catalog", href: "/student/books", icon: Library },
    { label: "Profile", href: "/profile", icon: UserCircle },
    { label: "Reservations", href: "/reservations", icon: ClipboardList },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-500/15 text-rose-500 border-rose-500/30 dark:text-rose-400",
  LIBRARIAN: "bg-amber-500/15 text-amber-500 border-amber-500/30 dark:text-amber-400",
  STUDENT: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 dark:text-emerald-400",
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
  const router = useRouter();
  const { signOut } = useClerk();
  const navItems = NAV_ITEMS[user.role] || [];
  const initials =
    user.profile?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r-0">
        <SidebarHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight leading-tight">
                <span className="text-foreground">Library</span>
                <span className="text-primary font-light">MS</span>
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                {user.role} Portal
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== `/${user.role.toLowerCase()}` &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className={`h-11 px-4 transition-all duration-200 rounded-xl ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-sm border border-primary/10"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                        <span className="text-[15px]">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50 border border-border/50 mb-3 shadow-sm">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                {user.profile?.fullName || "User"}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 uppercase mt-0.5 ${ROLE_COLORS[user.role]}`}
              >
                {user.role}
              </Badge>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => signOut(() => router.push("/login"))}
                className="h-11 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="text-[15px]">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background/95">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-card/40 backdrop-blur-md px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="w-px h-6 bg-border mx-2 hidden lg:block" />
            {/* Breadcrumb-like path */}
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="text-foreground">LibraryMS</span>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-primary/80">
                  {pathname
                    .split("/")
                    .filter(Boolean)
                    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
                    .join(" / ")}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 border-border/50 shadow-xl">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {user.profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="cursor-pointer py-2 flex items-center w-full">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="cursor-pointer py-2 flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut(() => router.push("/login"))}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="absolute inset-0 bg-grain opacity-5 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
