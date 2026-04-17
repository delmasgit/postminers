"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, MoreVertical, Image as ImageIcon, Edit3,
  Download, Trash2, Loader2, Plus, LayoutGrid, List, Eye,
  Calendar, Layers
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface DesignItem {
  id: string;
  canvas_width: number;
  canvas_height: number;
  preview_image_url: string | null;
  elements_count: number;
  created_at: string;
  updated_at: string;
}

export default function Library() {
  const [activeTab, setActiveTab] = useState<"templates" | "posts">("templates");
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/content-editor-studio/");
      setDesigns(data.data?.results || []);
    } catch (err: any) {
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/content-editor-studio/${id}/`);
      setDesigns(prev => prev.filter(d => d.id !== id));
      toast.success("Design deleted");
    } catch (err: any) {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
      setMenuOpen(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPresetLabel = (w: number, h: number) => {
    if (w === 1080 && h === 1080) return "Instagram Post";
    if (w === 1080 && h === 1920) return "Instagram Story";
    if (w === 1200 && h === 630) return "Facebook Post";
    if (w === 1200 && h === 675) return "Twitter / X";
    if (w === 1200 && h === 627) return "LinkedIn Post";
    if (w === 1280 && h === 720) return "YouTube Thumb";
    if (w === 1000 && h === 1500) return "Pinterest Pin";
    if (w === 1920 && h === 1080) return "Presentation";
    return `${w}x${h}`;
  };

  const filtered = designs.filter(d => {
    if (!searchQuery) return true;
    const label = getPresetLabel(d.canvas_width, d.canvas_height).toLowerCase();
    return label.includes(searchQuery.toLowerCase()) || d.id.includes(searchQuery);
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Asset Library</h1>
          <p className="text-sm text-muted-foreground">Manage all your designs, templates and content.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring w-48 md:w-64 transition-all"
            />
          </div>
          <div className="flex bg-muted rounded-lg p-0.5 border border-border">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link href="/studio" className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Design
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "templates" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          My Templates
          <span className="ml-1.5 text-xs text-muted-foreground">({designs.length})</span>
          {activeTab === "templates" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "posts" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          My Posts
          {activeTab === "posts" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      {activeTab === "templates" ? (
        <>
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading designs...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                  <Layers className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold mb-1">
                  {searchQuery ? "No matching designs" : "No designs yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term." : "Create your first design in the Canvas Studio."}
                </p>
                {!searchQuery && (
                  <Link href="/studio" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Create Design
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(design => (
                <div key={design.id} className="group rounded-2xl border border-border bg-card hover:border-primary/30 transition-all shadow-sm relative">
                  {/* Preview */}
                  <Link href={`/studio?id=${design.id}`} className="block">
                    <div className="aspect-[4/3] rounded-t-[15px] bg-gradient-to-br from-muted/50 to-muted/20 relative flex items-center justify-center overflow-hidden">
                      {design.preview_image_url ? (
                        <img src={design.preview_image_url} alt="Design preview" className="w-full h-full object-contain p-3" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
                          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium">No Preview</span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium shadow-lg">
                          <Edit3 className="w-3.5 h-3.5" /> Open in Studio
                        </div>
                      </div>
                      {/* Size badge */}
                      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-border text-[10px] font-medium text-muted-foreground">
                        {design.canvas_width}x{design.canvas_height}
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{getPresetLabel(design.canvas_width, design.canvas_height)}</h3>
                      <div className="flex gap-2 items-center mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(design.updated_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs text-muted-foreground">{design.elements_count} elements</span>
                      </div>
                    </div>
                    {/* Menu */}
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === design.id ? null : design.id)} className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === design.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 w-40 animate-in fade-in slide-in-from-top-1 duration-150">
                            <Link href={`/studio?id=${design.id}`} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors w-full text-left">
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <Link href={`/studio?id=${design.id}`} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors w-full text-left">
                              <Download className="w-3.5 h-3.5" /> Export
                            </Link>
                            <div className="h-px bg-border my-1" />
                            <button
                              onClick={() => handleDelete(design.id)}
                              disabled={deleting === design.id}
                              className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full text-left disabled:opacity-50"
                            >
                              {deleting === design.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-2.5 bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                <span>Design</span>
                <span>Size</span>
                <span>Elements</span>
                <span>Modified</span>
                <span></span>
              </div>
              {filtered.map(design => (
                <div key={design.id} className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors border-b border-border last:border-0 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/studio?id=${design.id}`} className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0 overflow-hidden hover:opacity-80">
                      {design.preview_image_url ? (
                        <img src={design.preview_image_url} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </Link>
                    <Link href={`/studio?id=${design.id}`} className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {getPresetLabel(design.canvas_width, design.canvas_height)}
                    </Link>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{design.canvas_width}x{design.canvas_height}</span>
                  <span className="text-xs text-muted-foreground">{design.elements_count} layers</span>
                  <span className="text-xs text-muted-foreground">{formatDate(design.updated_at)}</span>
                  <div className="flex justify-end gap-1 items-center">
                    <Link href={`/studio?id=${design.id}`} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(design.id)}
                      disabled={deleting === design.id}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deleting === design.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Posts tab — placeholder for now */
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold mb-1">Posts coming soon</h3>
            <p className="text-sm text-muted-foreground">Published posts will appear here once connected to social platforms.</p>
          </div>
        </div>
      )}
    </div>
  );
}
