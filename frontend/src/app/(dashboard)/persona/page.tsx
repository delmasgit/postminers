"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, PaintBucket, MessageSquareQuote, Target, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspaceStore";

// ─── Skeleton Components ──────────────────────────────────────────────────────
function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />;
}

function SectionSkeleton({ rows = 2, sidebar = false }: { rows?: number; sidebar?: boolean }) {
  return (
    <div className={`bg-card border border-border p-${sidebar ? '6' : '8'} rounded-2xl shadow-sm space-y-5`}>
      <SkeletonLine className="h-6 w-40 mb-6" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} className={`h-11 w-full ${i === 0 && !sidebar ? 'md:w-1/2' : ''}`} />
      ))}
    </div>
  );
}

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium
        ${type === 'success'
          ? 'bg-emerald-950/90 border-emerald-800/60 text-emerald-300'
          : 'bg-red-950/90 border-red-800/60 text-red-300'
        }`}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />
      }
      {message}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PersonaSettings() {
  const { workspace, isLoading, isSaving, error, saveSuccess, updateWorkspace, clearError } = useWorkspaceStore();

  const [localForm, setLocalForm] = useState({
    workspace_name: "",
    tone_of_voice: "",
    target_audience: "",
    brand_guidelines: "",
    primary_colors: ["#583DFF"],
  });

  // Sync form when workspace loads
  useEffect(() => {
    if (workspace) {
      setLocalForm({
        workspace_name: workspace.workspace_name ?? "",
        tone_of_voice: workspace.tone_of_voice ?? "",
        target_audience: workspace.target_audience ?? "",
        brand_guidelines: workspace.brand_guidelines ?? "",
        primary_colors: workspace.primary_colors?.length ? workspace.primary_colors : ["#583DFF"],
      });
    }
  }, [workspace]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    clearError();
    await updateWorkspace({
      workspace_name: localForm.workspace_name,
      tone_of_voice: localForm.tone_of_voice,
      target_audience: localForm.target_audience,
      brand_guidelines: localForm.brand_guidelines,
      primary_colors: localForm.primary_colors,
    });
  };

  const isDirty = workspace && (
    localForm.workspace_name !== (workspace.workspace_name ?? "") ||
    localForm.tone_of_voice !== (workspace.tone_of_voice ?? "") ||
    localForm.target_audience !== (workspace.target_audience ?? "") ||
    localForm.brand_guidelines !== (workspace.brand_guidelines ?? "") ||
    JSON.stringify(localForm.primary_colors) !== JSON.stringify(workspace.primary_colors ?? [])
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 text-foreground font-sans transition-colors duration-300">
      {/* Toast Notifications */}
      {saveSuccess && <Toast type="success" message="Brand identity saved successfully!" />}
      {error && <Toast type="error" message={error} />}

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Brand Persona</h1>
        <p className="text-muted-foreground">
          Configure your workspace&apos;s brand identity. The AI uses this context to generate perfectly aligned content.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main Form ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Core Identity */}
          {isLoading ? <SectionSkeleton rows={3} /> : (
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Core Identity
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Workspace / Brand Name
                    </label>
                    <input
                      type="text"
                      name="workspace_name"
                      value={localForm.workspace_name}
                      onChange={handleChange}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Industry / Category
                    </label>
                    <div className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-muted-foreground text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {workspace?.category_label ?? '—'}
                      <span className="ml-auto text-xs opacity-60">set during onboarding</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Target Audience Demographics
                  </label>
                  <textarea
                    name="target_audience"
                    value={localForm.target_audience}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Young adults 18–35, tech enthusiasts, small business owners"
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                  />
                </div>
              </div>
            </motion.section>
          )}

          {/* Voice & Communication */}
          {isLoading ? <SectionSkeleton rows={3} /> : (
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-secondary" /> Voice &amp; Communication
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Tone of Voice
                  </label>
                  <textarea
                    name="tone_of_voice"
                    value={localForm.tone_of_voice}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Professional, witty, and highly educational."
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Brand Guidelines &amp; Do Not&apos;s
                  </label>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Hard rules for the AI — e.g., &quot;Never use slang&quot;, &quot;Always mention our money-back guarantee&quot;.
                  </p>
                  <textarea
                    name="brand_guidelines"
                    value={localForm.brand_guidelines}
                    onChange={handleChange}
                    rows={4}
                    placeholder="e.g., Always capitalize our brand name. Avoid using emojis in professional posts."
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                  />
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {/* ── Sidebar: Visual Assets ── */}
        <div className="space-y-8">

          {/* Logo */}
          {isLoading ? <SectionSkeleton sidebar rows={1} /> : (
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" /> Brand Logo
              </h2>
              {workspace?.logo_url ? (
                <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={workspace.logo_url} alt="Brand logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-input/50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 hover:border-border/80 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload brand logo</p>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
            </motion.section>
          )}

          {/* Brand Palette */}
          {isLoading ? <SectionSkeleton sidebar rows={2} /> : (
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <PaintBucket className="w-4 h-4 text-orange-400" /> Brand Palette
              </h2>
              <div className="space-y-3">
                {localForm.primary_colors.map((color, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-input p-2 rounded-xl border border-border transition-colors duration-300">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...localForm.primary_colors];
                        newColors[idx] = e.target.value;
                        setLocalForm(prev => ({ ...prev, primary_colors: newColors }));
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0 overflow-hidden shrink-0"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...localForm.primary_colors];
                        newColors[idx] = e.target.value;
                        setLocalForm(prev => ({ ...prev, primary_colors: newColors }));
                      }}
                      className="bg-transparent border-0 text-sm font-mono focus:ring-0 text-foreground w-full uppercase"
                    />
                    {localForm.primary_colors.length > 1 && (
                      <button
                        onClick={() => setLocalForm(prev => ({ ...prev, primary_colors: prev.primary_colors.filter((_, i) => i !== idx) }))}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove"
                      >×</button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setLocalForm(prev => ({ ...prev, primary_colors: [...prev.primary_colors, "#000000"] }))}
                  className="w-full py-2.5 bg-muted hover:bg-muted/80 border border-dashed border-border rounded-xl text-sm font-medium transition-colors text-foreground"
                >
                  + Add color
                </button>
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* ── Save Bar ── */}
      <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
        {isDirty && !isSaving && (
          <p className="text-xs text-amber-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            You have unsaved changes
          </p>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !workspace}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Brand Identity</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
