import type { Metadata } from "next";

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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-primary">Library</span>
              <span className="text-muted-foreground font-light">MS</span>
            </h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage Your Library
            <br />
            <span className="text-primary">Effortlessly</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            A comprehensive system for managing books, users, reservations,
            and more — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["Book Management", "User Roles", "Reservations", "Reports"].map(
              (feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {feature}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Auth Form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
