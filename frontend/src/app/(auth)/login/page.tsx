"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  // Smart post-auth redirect: existing users → dashboard, new users → onboarding
  const smartRedirect = async (explicitNext?: string) => {
    if (explicitNext && explicitNext !== '/onboarding') {
      router.push(explicitNext);
      return;
    }
    try {
      await fetchWorkspace();
      const { workspace } = useWorkspaceStore.getState();
      router.push(workspace ? '/dashboard' : '/onboarding');
    } catch {
      router.push('/onboarding');
    }
  };

  // 🚀 Initialize the Google Login Hook
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
        const next = searchParams.get("next") || undefined;
        await smartRedirect(next);
      } catch {
        toast.error(useAuthStore.getState().error || "Google login failed.");
      }
    },
    onError: () => {
      toast.error('Google Login Failed');
      console.error('Google Login Failed');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const next = searchParams.get("next") || undefined;
      await smartRedirect(next);
    } catch {
      toast.error(useAuthStore.getState().error || "Login failed.");
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Sparkles className="w-6 h-6 text-primary" />
        <span className="font-bold text-xl tracking-tighter text-foreground">PostMiner</span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Welcome back</h1>
      <p className="text-muted-foreground mb-8">Sign in to your account to continue creating.</p>

      {/* Error Message */}

      {/* Google Button */}
      <button
        type="button"
        onClick={() => handleGoogleAuth()} // 🚀 Trigger the hook
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-card border border-border rounded-xl font-medium text-foreground hover:bg-muted/50 transition-colors shadow-sm mb-6"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-muted-foreground text-sm mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
          Start free trial
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <LoginPageContent />
    </Suspense>
  );
}
