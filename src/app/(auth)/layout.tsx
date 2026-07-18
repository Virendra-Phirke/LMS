import type { Metadata } from "next";
import { BookOpen, ShieldCheck, Layers, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — LibraryMS",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* ─── Left Panel — Branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-grain">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/5 to-background" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-chart-5/10 rounded-full blur-[120px] animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-20">
          <div className="flex items-center gap-4 mb-10 hover-scale cursor-default w-fit">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg backdrop-blur-md">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-foreground">Library</span>
              <span className="text-primary font-light">MS</span>
            </h1>
          </div>

          <h2 className="text-5xl font-bold leading-[1.1] mb-6">
            Manage Your Library
            <br />
            <span className="text-gradient">Effortlessly</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
            A comprehensive system for managing books, users, reservations,
            and more — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { text: "Book Management", icon: BookOpen },
              { text: "User Roles", icon: ShieldCheck },
              { text: "Reservations", icon: Layers },
              { text: "Reports", icon: Activity },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover-scale cursor-default backdrop-blur-md"
                >
                  <Icon className="w-4 h-4" />
                  {feature.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Auth Form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        <div className="absolute inset-0 bg-grain opacity-50 dark:opacity-10" />
        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">{children}</div>
      </div>
    </div>
  );
}
