"use client";

import { SignIn } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Mobile branding */}
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-sm">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">Library</span>
          <span className="text-primary font-light">MS</span>
        </h1>
      </div>

      <div className="flex justify-center">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none border-0 p-0 w-full",
              headerTitle: "text-3xl font-bold tracking-tight text-foreground",
              headerSubtitle: "text-base text-muted-foreground",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-lg",
              formFieldInput:
                "h-12 bg-background/50 border-border/50 focus:bg-background rounded-lg",
              formFieldLabel: "text-sm font-medium text-foreground",
              footerActionLink:
                "text-primary hover:text-primary/80 font-medium",
              identityPreview: "bg-card border-border/50",
              card__signIn: "gap-6",
            },
          }}
        />
      </div>
    </div>
  );
}
