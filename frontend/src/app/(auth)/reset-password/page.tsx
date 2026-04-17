"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

function ResetPasswordPageContent() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  // uid and token come from the email reset link
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (!uid || !token) {
      setPasswordError("Invalid reset link. Please request a new one.");
      return;
    }

    try {
      // 🚀 CHANGED: Local UI confirms they match, so we only send it once to the backend
      await resetPassword(uid, token, newPassword);
      router.push('/login');
    } catch {
      toast.error(useAuthStore.getState().error || "Password reset failed.");
    }
  };

  const displayError = passwordError;

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Sparkles className="w-6 h-6 text-primary" />
        <span className="font-bold text-xl tracking-tighter text-foreground">PostMiner</span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Set new password</h1>
      <p className="text-muted-foreground mb-8">Your new password must be different to previously used passwords.</p>

      {/* Error Message */}
      {displayError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {displayError}
        </div>
      )}

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); clearError(); setPasswordError(""); }}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError(); setPasswordError(""); }}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
              Reset Password
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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
