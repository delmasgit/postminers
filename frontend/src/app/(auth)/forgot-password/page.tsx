"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, MailCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await forgotPassword(email);
      setIsEmailSent(true);
    } catch {
      toast.error(useAuthStore.getState().error || "Failed to send reset email.");
    }
  };

  const handleResend = async () => {
    setIsEmailSent(false);
    try {
      await forgotPassword(email);
      setIsEmailSent(true);
    } catch {
      toast.error(useAuthStore.getState().error || "Failed to resend reset email.");
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Sparkles className="w-6 h-6 text-primary" />
        <span className="font-bold text-xl tracking-tighter text-foreground">PostMiner</span>
      </div>

      {!isEmailSent ? (
        <>
          {/* Header */}
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground mb-8">Enter your email address and we&apos;ll send you a link to reset your password.</p>

          {/* Error Message */}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
              <input
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to login
             </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <MailCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Check your email</h1>
          <p className="text-muted-foreground mb-8">
            We&apos;ve sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
          </p>

          <Link
            href="/login"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center mb-4"
          >
            Back to login
          </Link>

          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Didn't receive the email? Click to resend"}
          </button>
        </div>
      )}
    </div>
  );
}
