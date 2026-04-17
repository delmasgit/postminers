"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGoogleLogin } from '@react-oauth/google';
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

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register, googleLogin, isLoading, error, clearError } = useAuthStore();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 🚀 Initialize the Google Login Hook for Registration
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
        router.push("/onboarding");
      } catch {
        toast.error(useAuthStore.getState().error || "Google registration failed.");
      }
    },
    onError: () => {
      toast.error('Google Registration Failed');
      console.error('Google Registration Failed');
    },
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s-]+$/.test(firstName.trim())) {
      errors.firstName = "First name can only contain letters, spaces, and hyphens.";
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s-]+$/.test(lastName.trim())) {
      errors.lastName = "Last name can only contain letters, spaces, and hyphens.";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // 🚀 CHANGED: We only pass the password once now!
      await register(firstName.trim(), lastName.trim(), email.trim(), password);

      const state = useAuthStore.getState();
      if (state.isAuthenticated) {
        router.push("/onboarding");
      } else {
        setRegistrationSuccess(true);
      }
    } catch {
      toast.error(useAuthStore.getState().error || "Registration failed.");
    }
  };

  if (registrationSuccess) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="font-bold text-lg tracking-tighter text-foreground">PostMiner</span>
        </div>
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Verify your email</h1>
          <p className="text-muted-foreground mb-8">
            We&apos;ve sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-secondary" />
        <span className="font-bold text-lg tracking-tighter text-foreground">PostMiner</span>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Create your account</h1>
      <p className="text-muted-foreground text-sm mb-5">14 days free · No credit card required</p>

      {/* Error Message */}

      {/* Google Button */}
      <button
        type="button"
        onClick={() => handleGoogleAuth()} // 🚀 Trigger the hook
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-card border border-border rounded-xl font-medium text-sm text-foreground hover:bg-muted/50 transition-colors shadow-sm mb-4"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form
        className="space-y-3"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">First name</label>
            <input type="text" placeholder="Jane" required
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearError(); setFieldErrors(prev => ({ ...prev, firstName: '' })); }}
              className={`w-full bg-input border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.firstName ? 'border-destructive' : 'border-border'}`} />
            {fieldErrors.firstName && <p className="text-destructive text-[11px] mt-1">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Last name</label>
            <input type="text" placeholder="Doe" required
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); clearError(); setFieldErrors(prev => ({ ...prev, lastName: '' })); }}
              className={`w-full bg-input border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.lastName ? 'border-destructive' : 'border-border'}`} />
            {fieldErrors.lastName && <p className="text-destructive text-[11px] mt-1">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Work email</label>
          <input type="email" placeholder="jane@company.com" required
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); setFieldErrors(prev => ({ ...prev, email: '' })); }}
            className={`w-full bg-input border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.email ? 'border-destructive' : 'border-border'}`} />
          {fieldErrors.email && <p className="text-destructive text-[11px] mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              required minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); setFieldErrors(prev => ({ ...prev, password: '' })); }}
              className={`w-full bg-input border rounded-lg px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.password ? 'border-destructive' : 'border-border'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-destructive text-[11px] mt-1">{fieldErrors.password}</p>}
        </div>

        <button type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm mt-1 disabled:opacity-60">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By signing up you agree to our{" "}
          <Link href="#" className="text-primary hover:underline">Terms</Link> &{" "}
          <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      {/* Footer */}
      <p className="text-center text-muted-foreground text-sm mt-5">
        Have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
