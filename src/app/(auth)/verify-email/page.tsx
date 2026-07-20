"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { setupStudentProfile } from "@/actions/users";

function VerifyEmailForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!otp) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Setup DB profile
        const setupResult = await setupStudentProfile();
        if (setupResult.success) {
          toast.success("Email verified and profile created!");
          router.push("/student");
        } else {
          toast.error(setupResult.message || "Failed to setup profile");
        }
      } else {
        toast.error("Verification failed or further steps required.");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
          className="h-12 bg-background/50 text-center text-lg tracking-widest"
        />
      </div>
      <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading || !isLoaded}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify Email
      </Button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-sm">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">Library</span>
          <span className="text-primary font-light">MS</span>
        </h1>
      </div>

      <Card className="w-full bg-transparent border-0 shadow-none lg:bg-card lg:border lg:shadow-sm">
        <CardHeader className="px-0 lg:px-6">
          <CardTitle className="text-3xl font-bold">Verify your email</CardTitle>
          <CardDescription>We've sent a 6-digit code to your email address.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 lg:px-6">
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
            <VerifyEmailForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
