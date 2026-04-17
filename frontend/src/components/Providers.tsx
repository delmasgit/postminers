"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
    // We fall back to an empty string to prevent build errors if the env var is missing
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}