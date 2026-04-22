"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AIGeneration() {
  const [step, setStep] = useState<"prompt" | "generating_images">("prompt");
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();
  const userName = user?.first_name || 'there';

  useEffect(() => {
    if (step === "generating_images") {
      const generateDesigns = async () => {
        try {
          await api.post("/ai-engine/generate/", { prompt });
          toast.success("Templates generated successfully!");
          router.push('/library');
        } catch (error: any) {
          console.error("AI Generation Error:", error);
          toast.error(error.response?.data?.message || "Failed to generate designs. Check your AI configuration.");
          setStep("prompt");
        }
      };
      generateDesigns();
    }
  }, [step, prompt, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 text-foreground transition-colors duration-300">
      <AnimatePresence mode="wait">

        {/* ═══ STEP 1: GREETING + PROMPT ═══ */}
        {step === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            {/* Greeting */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight leading-snug">
              <span className="text-muted-foreground">{getGreeting()}</span>
              <span className="text-foreground">, {userName}.</span>
              <br />
              <span className="text-foreground">Let&apos;s create something.</span>
            </h1>

            {/* Prompt Box */}
            <div className="w-full bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-colors">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What's the core message today?"
                className="w-full bg-transparent px-5 pt-5 pb-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none text-[15px] leading-relaxed min-h-[90px]"
              />
              <div className="flex items-center justify-between px-4 pb-4">
                <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStep("generating_images")}
                  disabled={!prompt}
                  className="flex items-center gap-2 px-5 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ STEP 2: GENERATING IMAGES ═══ */}
        {step === "generating_images" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 relative mb-6">
              <div className="absolute inset-0 border-[3px] border-primary/20 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
              />
              <Sparkles className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Dreaming up concepts...</h2>
            <p className="text-muted-foreground text-sm">Generating 3 distinct visual styles. Redirecting to Library...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
