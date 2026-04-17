import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PostMiner Platform",
  description: "Modern content generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={['light', 'dark', 'system']}
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
