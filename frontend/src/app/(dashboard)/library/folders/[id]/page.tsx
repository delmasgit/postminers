"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, Edit3, Trash2, Image as ImageIcon, X, Instagram, Facebook, Linkedin, Sparkles } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function FolderDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const folderId = unwrappedParams.id;
  
  const folderName = folderId === "1" ? "Cyberpunk Campaign" : "Generated Templates";
  const targetPrompt = "A sleek, futuristic cyberpunk city at night with neon lights and flying cars. Bold vibrant colors like pink, cyan, and deep purple.";
  
  const [templates, setTemplates] = useState([
    { id: 1, label: "Concept 1" },
    { id: 2, label: "Concept 2" },
    { id: 3, label: "Concept 3" },
  ]);

  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<{ id: string, role: "user" | "ai", content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    // Load published posts
    const storedPosts = localStorage.getItem("mock_published_posts");
    if (storedPosts) {
      setPublishedPosts(JSON.parse(storedPosts));
    }

    // Load folder-specific chat state
    const storedChat = localStorage.getItem(`mock_folder_chat_${folderId}`);
    if (storedChat) {
      setChatHistory(JSON.parse(storedChat));
    } else {
      setChatHistory([
        { id: "init", role: "ai", content: "Hi! I generated these templates based on your target prompt. Need any tweaks? (e.g., 'Make the neon colors brighter', 'Swap to a daytime scene')" }
      ]);
    }
  }, [folderId]);

  const handleDelete = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const newMsg = { id: Date.now().toString(), role: "user" as const, content: chatInput };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);
    localStorage.setItem(`mock_folder_chat_${folderId}`, JSON.stringify(updatedHistory));
    setChatInput("");
    setIsAiTyping(true);

    // Simulate AI regenerating templates
    setTimeout(() => {
      const aiResponse = { id: (Date.now() + 1).toString(), role: "ai" as const, content: "Done! I've regenerated the templates based on your request. Let me know if you need any other changes." };
      const finalHistory = [...updatedHistory, aiResponse];
      setChatHistory(finalHistory);
      localStorage.setItem(`mock_folder_chat_${folderId}`, JSON.stringify(finalHistory));
      setIsAiTyping(false);
    }, 1500);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [modalStep, setModalStep] = useState<"platform" | "compose">("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [regenPrompt, setRegenPrompt] = useState("");

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, ratio: "aspect-square", defaultCaption: "Cyberpunk vibes are here! ✨🌆 Step into the neon future. #neon #cyberpunk" },
    { id: "facebook", name: "Facebook", icon: Facebook, ratio: "aspect-video", defaultCaption: "Check out our new futuristic cyberpunk campaign! Let us know what you think below." },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, ratio: "aspect-video", defaultCaption: "Innovation meets aesthetics. We are thrilled to unveil our latest campaign concept exploring future urban environments. #innovation #design" },
    { id: "pinterest", name: "Pinterest", icon: ImageIcon, ratio: "aspect-[2/3]", defaultCaption: "Cyberpunk City Nights Inspiration ✨ #cyberpunk #inspiration" },
  ];

  const handleReadyToPost = (template: any) => {
    setActiveTemplate(template);
    setModalStep("platform");
    setIsModalOpen(true);
  };

  const selectPlatform = (platformId: string) => {
    const plat = platforms.find(p => p.id === platformId);
    setSelectedPlatform(platformId);
    
    // Check if already published
    const existing = publishedPosts.find(p => p.templateId === activeTemplate.id && p.platform === platformId);
    if (existing) {
       setCaption(existing.caption);
    } else {
       setCaption(plat?.defaultCaption || "");
    }

    setModalStep("compose");
  };

  const handlePublish = (schedule: boolean = false) => {
    if (!activeTemplate || !selectedPlatform) return;
    
    const newPost = {
      id: Date.now(),
      templateId: activeTemplate.id,
      templateLabel: activeTemplate.label,
      folderName: folderName,
      platform: selectedPlatform,
      caption: caption,
      date: schedule ? "Scheduled" : "Just now",
      type: "Published"
    };

    const updated = [...publishedPosts.filter(p => !(p.templateId === activeTemplate.id && p.platform === selectedPlatform)), newPost];
    setPublishedPosts(updated);
    localStorage.setItem("mock_published_posts", JSON.stringify(updated));
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] text-foreground overflow-hidden">
      
      {/* ═══ LEFT MAIN CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto p-8 relative flex flex-col">
        <div className="max-w-5xl mx-auto w-full">
          <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{folderName}</h1>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm max-w-4xl">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target Prompt</h3>
              <p className="text-sm font-medium leading-relaxed italic text-foreground">&quot;{targetPrompt}&quot;</p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const publishedForTemplate = publishedPosts.filter(p => p.templateId === template.id);
              const hasPublished = publishedForTemplate.length > 0;

              return (
                <div key={template.id} className="group rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-sm flex flex-col h-full hover:border-border/80">
                  <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 to-transparent relative flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-primary/20" />
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-xs font-semibold shadow-sm">
                      {template.label}
                    </div>
                    {hasPublished && (
                      <div className="absolute top-4 right-4 flex gap-1">
                        {publishedForTemplate.map(p => {
                          const Icon = platforms.find(pl => pl.id === p.platform)?.icon || ImageIcon;
                          return <div key={p.platform} className="w-6 h-6 bg-background rounded-full flex items-center justify-center border border-border"><Icon className="w-3.5 h-3.5 text-primary" /></div>;
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col gap-3 mt-auto border-t border-border bg-card">
                    <button 
                      onClick={() => handleReadyToPost(template)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      {hasPublished ? "Post to another platform" : "Ready to post"}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/studio" className="flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-sm font-medium transition-colors">
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(template.id)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {templates.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
                No templates left in this folder.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT COMPANION SIDEBAR ═══ */}
      <div className="w-[320px] lg:w-[380px] border-l border-border bg-card/50 flex flex-col shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="p-5 border-b border-border bg-card flex items-center gap-2.5 shadow-sm z-10">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Edit with AI</h3>
            <p className="text-[11px] text-muted-foreground">Adjust templates naturally</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] p-3.5 text-[13px] leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                  : "bg-background border border-border rounded-2xl rounded-tl-sm text-foreground"
              }`}>
                 {msg.content}
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-background border border-border p-3.5 rounded-2xl rounded-tl-sm text-sm flex items-center gap-1.5 shadow-sm">
                 <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                 <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-100" />
                 <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="E.g., Make it darker..." 
              className="w-full bg-input border border-border rounded-xl pl-4 pr-12 py-3.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isAiTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-opacity"
            >
              <Send className="w-3.5 h-3.5 -ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ═══ COMPOSE POST MODAL ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-4xl rounded-[2rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/10">
              <h2 className="text-xl font-bold">
                {modalStep === "platform" ? "Select Platform" : `Compose for ${platforms.find(p=>p.id===selectedPlatform)?.name}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {modalStep === "platform" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {platforms.map(platform => {
                    const isPosted = publishedPosts.some(p => p.templateId === activeTemplate?.id && p.platform === platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => selectPlatform(platform.id)}
                        className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all group ${isPosted ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/80 hover:bg-muted/50 hover:shadow-lg"}`}
                      >
                        <platform.icon className={`w-12 h-12 mb-5 transition-transform group-hover:scale-110 ${isPosted ? 'text-primary' : 'text-foreground'}`} />
                        <span className="font-bold text-sm">{platform.name}</span>
                        {isPosted && <span className="text-[10px] mt-3 bg-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">Edit Post</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Image Preview */}
                  <div className="w-full md:w-1/2 flex items-center justify-center bg-muted/30 rounded-3xl border border-border p-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                    <div className={`w-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden backdrop-blur-sm z-10 ${platforms.find(p=>p.id===selectedPlatform)?.ratio}`}>
                       <ImageIcon className="w-16 h-16 text-foreground/20 z-10" />
                       <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full shadow-sm z-10 border border-border">
                         {platforms.find(p=>p.id===selectedPlatform)?.ratio.replace('aspect-', 'Aspect ')}
                       </div>
                    </div>
                  </div>

                  {/* Right: Caption & Regenerate */}
                  <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Generated Caption
                      </label>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full h-44 bg-input border border-border p-5 rounded-2xl text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all leading-relaxed shadow-sm"
                      />
                    </div>
                    
                    <div className="bg-muted/50 border border-border rounded-2xl p-5 mb-auto">
                      <label className="block text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Tweak Caption</label>
                      <div className="flex gap-2 relative">
                        <input
                           type="text"
                           placeholder="Make it shorter and punchy..."
                           value={regenPrompt}
                           onChange={(e) => setRegenPrompt(e.target.value)}
                           className="flex-1 bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                        />
                        <button 
                          onClick={() => setCaption("Wait, this new caption is even better! Less words, more impact. 🚀 #short #punchy")}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-2">
                       <button onClick={() => setModalStep("platform")} className="px-5 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all mr-auto">
                         Back
                       </button>
                       <button onClick={() => handlePublish(true)} className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-sm">
                         Schedule
                       </button>
                       <button onClick={() => handlePublish(false)} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                         <Send className="w-4 h-4" /> Publish Now
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
