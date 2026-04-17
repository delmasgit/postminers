"use client";

import { useAuthStore } from "@/stores/authStore";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/* ─────────────────────────────────────────────────
   Template data — each row is a strip of cards
   ───────────────────────────────────────────────── */
const rows = [
  ["#583DFF,#8174FF", "#FF3D83,#FFCDD7", "#3DFFB9,#00A976", "#E4FF3D,#3DFFB9", "#1B007B,#583DFF", "#CD005F,#FF91AD", "#583DFF,#FF3D83", "#00D495,#E4FF3D"],
  ["#FF91AD,#583DFF", "#00A976,#1B007B", "#8174FF,#FFCDD7", "#E4FF3D,#FF3D83", "#3400D3,#3DFFB9", "#FF3D83,#E4FF3D", "#D3D0FF,#583DFF", "#00D495,#8174FF"],
  ["#1B007B,#FF3D83", "#3DFFB9,#583DFF", "#FFCDD7,#E4FF3D", "#583DFF,#00D495", "#CD005F,#3400D3", "#AAA3FF,#FF91AD", "#FF3D83,#1B007B", "#E4FF3D,#00A976"],
  ["#8174FF,#3DFFB9", "#FF3D83,#FFCDD7", "#3400D3,#E4FF3D", "#00D495,#FF3D83", "#583DFF,#CD005F", "#AAA3FF,#00A976", "#1B007B,#E4FF3D", "#FFCDD7,#583DFF"],
  ["#00A976,#583DFF", "#E4FF3D,#CD005F", "#FF91AD,#3DFFB9", "#3400D3,#FFCDD7", "#583DFF,#E4FF3D", "#FF3D83,#00D495", "#8174FF,#CD005F", "#3DFFB9,#1B007B"],
  ["#583DFF,#3DFFB9", "#CD005F,#FFCDD7", "#00D495,#8174FF", "#E4FF3D,#583DFF", "#FF91AD,#1B007B", "#3400D3,#FF3D83", "#00A976,#E4FF3D", "#8174FF,#FF91AD"],
];

function TemplateCard({ colors }: { colors: string }) {
  const [from, to] = colors.split(",");
  return (
    <div
      className="shrink-0 rounded-2xl shadow-lg relative overflow-hidden"
      style={{
        width: 140,
        height: 190,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {/* Fake template inner UI */}
      <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
        <div
          className="rounded-lg"
          style={{ width: 28, height: 28, background: "rgba(255,255,255,0.2)" }}
        />
        <div className="space-y-1.5">
          <div
            className="rounded-full"
            style={{ height: 6, width: "72%", background: "rgba(255,255,255,0.3)" }}
          />
          <div
            className="rounded-full"
            style={{ height: 6, width: "50%", background: "rgba(255,255,255,0.2)" }}
          />
          <div
            className="rounded-full"
            style={{ height: 8, width: "60%", marginTop: 8, background: "rgba(255,255,255,0.25)" }}
          />
        </div>
      </div>
    </div>
  );
}

function DiagonalSlider() {
  return (
    <div className="w-full h-full overflow-hidden rounded-3xl bg-muted/30 relative">
      {/* The whole grid container is rotated -35deg */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-35deg)",
          width: 2400,
          height: 1800,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {rows.map((row, rowIndex) => {
          const doubled = [...row, ...row];
          const isEven = rowIndex % 2 === 0;
          const speed = 28 + rowIndex * 5;

          return (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                gap: 20,
                width: "max-content",
                animation: `${isEven ? "marquee" : "marquee-reverse"} ${speed}s linear infinite`,
              }}
            >
              {doubled.map((colors, i) => (
                <TemplateCard key={`${rowIndex}-${i}`} colors={colors} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Edge fading overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 20%, transparent 80%, var(--background) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, var(--background) 0%, transparent 15%, transparent 85%, var(--background) 100%)",
        }}
      />

      {/* Branding */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="font-bold text-lg tracking-tighter text-foreground/50">PostMiner</span>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen h-screen bg-background text-foreground flex transition-colors duration-300 overflow-hidden">
      {/* LEFT — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto scrollbar-hide">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>

      {/* RIGHT — Diagonal slider */}
      <div className="hidden lg:block w-1/2 h-screen p-4">
        <DiagonalSlider />
      </div>
    </div>
  );
}
