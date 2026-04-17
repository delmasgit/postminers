"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyEmail, error } = useAuthStore();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    // We use a ref or flag to prevent React strict mode from firing the API call twice in dev
    const [hasAttempted, setHasAttempted] = useState(false);

    useEffect(() => {
        const uid = searchParams.get("id");
        const token = searchParams.get("token");

        if (!uid || !token) {
            setStatus("error");
            return;
        }

        const verify = async () => {
            if (hasAttempted) return;
            setHasAttempted(true);

            try {
                await verifyEmail(uid, token);
                setStatus("success");

                // After successful verification, wait 3 seconds and push to login
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } catch (err) {
                setStatus("error");
            }
        };

        verify();
    }, [searchParams, verifyEmail, hasAttempted, router]);

    return (
        <div className="w-full flex flex-col items-center text-center py-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl tracking-tighter text-foreground">PostMiner</span>
            </div>

            {status === "loading" && (
                <>
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Verifying your email</h1>
                    <p className="text-muted-foreground">Please wait a moment while we securely verify your account...</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Email Verified!</h1>
                    <p className="text-muted-foreground mb-8">Your account is now active. Redirecting you to login...</p>
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </>
            )}

            {status === "error" && (
                <>
                    <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Verification Failed</h1>
                    <p className="text-muted-foreground mb-8">
                        {error || "This verification link is invalid, expired, or your email is already verified."}
                    </p>
                    <Link
                        href="/login"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        Go to Login
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </>
            )}
        </div>
    );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="w-full flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}