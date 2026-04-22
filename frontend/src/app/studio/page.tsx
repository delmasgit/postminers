"use client";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import * as fabric from "fabric";
import {
  Save, Download, Type, Square, Circle, Triangle, Minus, Image as ImageIcon,
  Eraser, Loader2, LayoutTemplate, ChevronDown, Bold, Italic, AlignLeft,
  AlignCenter, AlignRight, Layers, ZoomIn, ZoomOut, Undo2, Redo2,
  Palette, Move, MousePointer2, Star, PenTool, Trash2, Copy, Lock,
  Unlock, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Check
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

function ensureHex(color: any): string {
  if (!color || typeof color !== "string") return "#000000";
  if (color.startsWith("#")) {
    if (color.length === 4) return "#" + color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
    if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
    if (color.length >= 7) return color.substring(0, 7);
  }
  if (color.startsWith("rgb")) {
    const m = color.match(/\d+/g);
    if (m && m.length >= 3) return "#" + m.slice(0,3).map((x:string)=>parseInt(x).toString(16).padStart(2,"0")).join("");
  }
  return "#000000";
}
const uid = () => Math.random().toString(36).substring(2, 12);

const PRESETS = [
  { label: "Instagram Post",    w: 1080, h: 1080, cat: "Social" },
  { label: "Instagram Story",   w: 1080, h: 1920, cat: "Social" },
  { label: "Instagram Reel",    w: 1080, h: 1920, cat: "Social" },
  { label: "Facebook Post",     w: 1200, h: 630,  cat: "Social" },
  { label: "Twitter / X",       w: 1200, h: 675,  cat: "Social" },
  { label: "LinkedIn Post",     w: 1200, h: 627,  cat: "Social" },
  { label: "YouTube Thumbnail", w: 1280, h: 720,  cat: "Video" },
  { label: "Pinterest Pin",     w: 1000, h: 1500, cat: "Social" },
  { label: "Presentation",      w: 1920, h: 1080, cat: "Other" },
  { label: "A4 Document",       w: 2480, h: 3508, cat: "Print" },
];

const COLORS_PALETTE = [
  "#000000","#ffffff","#f44336","#e91e63","#9c27b0","#673ab7",
  "#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50",
  "#8bc34a","#cddc39","#ffeb3b","#ffc107","#ff9800","#ff5722",
  "#795548","#607d8b","#583DFF","#FF3D83","#3DFFB9","#E4FF3D",
];

function StudioContent() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const ci = useRef<fabric.Canvas | null>(null);
  const [fc, setFc] = useState<fabric.Canvas | null>(null);
  const { theme } = useTheme();
  const sp = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [designId, setDesignId] = useState<string|null>(sp.get("id"));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(!!sp.get("id"));
  const [uploading, setUploading] = useState(false);
  const [sel, setSel] = useState<fabric.Object|null>(null);
  const [tick, setTick] = useState(0);

  const [cw, setCw] = useState(1080);
  const [ch, setCh] = useState(1080);
  const [vs, setVs] = useState(1);
  const [presetOpen, setPresetOpen] = useState(false);
  const [selPreset, setSelPreset] = useState(0);
  const [activeTool, setActiveTool] = useState("select");

  // Left panel tab
  const [leftTab, setLeftTab] = useState<"tools"|"layers"|"presets">("tools");
  // Canvas bg color
  const [canvasBg, setCanvasBg] = useState("#ffffff");

  const calcScale = useCallback(() => {
    if (!containerRef.current) return;
    const pad = 60;
    const w = containerRef.current.clientWidth - pad;
    const h = containerRef.current.clientHeight - pad;
    setVs(Math.max(0.05, Math.min(1, Math.min(w / cw, h / ch))));
  }, [cw, ch]);

  useEffect(() => { calcScale(); window.addEventListener("resize", calcScale); return () => window.removeEventListener("resize", calcScale); }, [calcScale]);

  // Init canvas
  useEffect(() => {
    if (typeof window === "undefined" || !canvasElRef.current || ci.current) return;
    const c = new fabric.Canvas(canvasElRef.current, { width: cw, height: ch, backgroundColor: "#ffffff", preserveObjectStacking: true });
    ci.current = c; setFc(c);
    return () => { c.dispose(); ci.current = null; };
  }, []);

  // Resize canvas
  useEffect(() => { if (!fc) return; fc.setDimensions({ width: cw, height: ch }); fc.renderAll(); calcScale(); }, [cw, ch, fc]);

  // Selection
  useEffect(() => {
    if (!fc) return;
    const u = () => { const a = fc.getActiveObjects(); setSel(a.length === 1 ? a[0] : null); };
    fc.on("selection:created", u); fc.on("selection:updated", u); fc.on("selection:cleared", u); fc.on("object:modified", u);
    return () => { fc.off("selection:created", u); fc.off("selection:updated", u); fc.off("selection:cleared", u); fc.off("object:modified", u); };
  }, [fc]);

  // Load design
  useEffect(() => {
    if (!fc) return;
    if (canvasElRef.current?.getAttribute("data-loaded")) return;
    canvasElRef.current?.setAttribute("data-loaded", "true");
    if (!designId) {
      fc.clear(); fc.backgroundColor = "#ffffff"; setCanvasBg("#ffffff");
      fc.renderAll(); setLoading(false); return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/content-editor-studio/${designId}/`);
        const d = data.data; fc.clear();
        const bg = d.background_url?.startsWith("#") ? d.background_url : "#ffffff";
        fc.backgroundColor = bg; setCanvasBg(bg);
        if (d.canvas) { setCw(d.canvas.width || 1080); setCh(d.canvas.height || 1080); fc.setDimensions({ width: d.canvas.width || 1080, height: d.canvas.height || 1080 }); }
        if (d.elements_json && Array.isArray(d.elements_json)) {
          for (const el of d.elements_json) {
            if (el.type === "text") {
              const t = new fabric.IText(el.content?.text || "Text", { left: el.x, top: el.y, angle: el.rotation || 0, fill: el.style?.color || "#000", fontFamily: el.style?.font_family || "arial", fontSize: el.style?.font_size || 40, fontWeight: el.style?.font_weight === "bold" ? "bold" : "normal", fontStyle: el.style?.font_style === "italic" ? "italic" : "normal", textAlign: el.style?.text_align || "left", opacity: el.style?.opacity ?? 1 });
              (t as any).id = el.id; fc.add(t);
            } else if (el.type === "shape") {
              const base = { left: el.x, top: el.y, width: el.width, height: el.height, angle: el.rotation || 0, fill: el.style?.color || "#583DFF", opacity: el.style?.opacity ?? 1, stroke: el.style?.stroke_color || undefined, strokeWidth: el.style?.stroke_width || 0 };
              let s: fabric.Object | null = null;
              const sh = el.content?.shape || "rectangle";
              if (sh === "rectangle" || sh === "rounded_rectangle") s = new fabric.Rect({ ...base, rx: el.style?.border_radius || 0, ry: el.style?.border_radius || 0 });
              else if (sh === "circle") s = new fabric.Circle({ ...base, radius: (el.width || 100) / 2 });
              else if (sh === "triangle") s = new fabric.Triangle({ ...base });
              else if (sh === "line") s = new fabric.Line([0, 0, el.width || 200, 0], { ...base, stroke: el.style?.color || "#583DFF", strokeWidth: el.style?.stroke_width || 3 });
              if (s) { (s as any).id = el.id; fc.add(s); }
            } else if (el.type === "image") {
              try { const img = await fabric.Image.fromURL(el.content?.url, { crossOrigin: "anonymous" }); img.set({ left: el.x, top: el.y, angle: el.rotation || 0, opacity: el.style?.opacity ?? 1 }); img.scaleToWidth(el.width || 300); (img as any).id = el.id; (img as any).src = el.content?.url; fc.add(img); } catch (e) {}
            }
          }
        }
        fc.renderAll();
      } catch (e: any) { toast.error(e.response?.data?.message || "Load failed"); }
      finally { setLoading(false); }
    })();
  }, [fc, designId]);

  // Tools
  const addText = () => { if (!fc) return; const t = new fabric.IText("Type here", { left: cw/2-100, top: ch/2-25, fill: "#94a3b8", fontFamily: "arial", fontSize: 48, fontWeight: "normal" }); (t as any).id = uid(); fc.add(t); fc.setActiveObject(t); fc.renderAll(); setActiveTool("select"); };
  const addShape = (type: string) => {
    if (!fc) return; let s: fabric.Object; const cx = cw/2-75, cy = ch/2-75;
    if (type === "rect") s = new fabric.Rect({ left:cx,top:cy,width:150,height:150,fill:"#94a3b8",rx:8,ry:8 });
    else if (type === "circle") s = new fabric.Circle({ left:cx,top:cy,radius:75,fill:"#94a3b8" });
    else if (type === "triangle") s = new fabric.Triangle({ left:cx,top:cy,width:150,height:150,fill:"#94a3b8" });
    else if (type === "star") { const pts: {x:number,y:number}[] = []; for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2;const r=i%2===0?75:35;pts.push({x:75+r*Math.cos(a),y:75+r*Math.sin(a)});} s = new fabric.Polygon(pts,{left:cx,top:cy,fill:"#94a3b8",stroke:"#64748b",strokeWidth:1}); }
    else s = new fabric.Line([0,0,250,0],{left:cx,top:cy,stroke:"#94a3b8",strokeWidth:4});
    (s as any).id = uid(); fc.add(s); fc.setActiveObject(s); fc.renderAll(); setActiveTool("select");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !fc) return; setUploading(true);
    const fd = new FormData(); fd.append("image", file);
    try {
      const { data } = await api.post("/content-editor-studio/upload/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url = data.data.url;
      const img = await fabric.Image.fromURL(url, { crossOrigin: "anonymous" });
      img.scaleToWidth(Math.min(400, cw * 0.5)); img.set({ left: cw/4, top: ch/4 });
      (img as any).id = uid(); (img as any).src = url; fc.add(img); fc.setActiveObject(img); fc.renderAll();
    } catch (e: any) { toast.error("Upload failed"); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const clearCanvas = () => { if (!fc) return; fc.clear(); fc.backgroundColor = canvasBg; fc.renderAll(); setSel(null); };
  const deleteSelected = () => { if (!fc || !sel) return; fc.remove(sel); fc.discardActiveObject(); fc.renderAll(); setSel(null); };
  const duplicateSelected = () => {
    if (!fc || !sel) return;
    sel.clone().then((cloned: fabric.Object) => { cloned.set({ left: (sel.left||0)+20, top: (sel.top||0)+20 }); (cloned as any).id = uid(); fc.add(cloned); fc.setActiveObject(cloned); fc.renderAll(); });
  };

  const upd = (k: string, v: any) => { if (!fc || !sel) return; if (k === "fill" && sel.type === "line") sel.set("stroke", v); else sel.set(k, v); fc.renderAll(); setTick(t => t+1); };
  const changeBg = (c: string) => { if (!fc) return; fc.backgroundColor = c; setCanvasBg(c); fc.renderAll(); };

  const applyPreset = (i: number) => { setCw(PRESETS[i].w); setCh(PRESETS[i].h); setSelPreset(i); setPresetOpen(false); };

  // Payload
  const payload = () => {
    if (!fc) return null;
    const els: any[] = [];
    fc.getObjects().forEach((obj, idx) => {
      const id = (obj as any).id || uid(); (obj as any).id = id;
      const x = Math.round(obj.left || 0), y = Math.round(obj.top || 0);
      const w = Math.round((obj.width||100)*(obj.scaleX||1)), h = Math.round((obj.height||100)*(obj.scaleY||1));
      const rot = Math.round(obj.angle || 0);
      if (obj.type === "i-text" || obj.type === "text") {
        const t = obj as fabric.IText;
        els.push({ id, type:"text", x, y, width:w, height:h, rotation:rot, z_index:idx,
          style:{ font_size:Math.round(t.fontSize||30), font_family:t.fontFamily||"arial", font_weight:t.fontWeight==="bold"?"bold":"normal", font_style:t.fontStyle==="italic"?"italic":"normal", color:ensureHex(t.fill), opacity:t.opacity??1, text_align:t.textAlign||"left", line_height:t.lineHeight||1.2 },
          content:{ text:t.text||"" }});
      } else if (["rect","circle","triangle","polygon","line"].includes(obj.type||"")) {
        let shape = "rectangle";
        if (obj.type==="circle") shape="circle"; else if (obj.type==="triangle") shape="triangle"; else if (obj.type==="polygon") shape="star"; else if (obj.type==="line") shape="line";
        els.push({ id, type:"shape", x, y, width:w, height:h, rotation:rot, z_index:idx,
          style:{ color:ensureHex(obj.type==="line"?obj.stroke:obj.fill), opacity:obj.opacity??1, stroke_color:obj.stroke&&obj.type!=="line"?ensureHex(obj.stroke):null, stroke_width:obj.strokeWidth||0, border_radius:(obj as any).rx||0 },
          content:{ shape }});
      } else if (obj.type==="image") {
        els.push({ id, type:"image", x, y, width:w, height:h, rotation:rot, z_index:idx,
          style:{ opacity:obj.opacity??1, border_radius:0 },
          content:{ url:(obj as any).src||"" }});
      }
    });
    
    fc.discardActiveObject();
    fc.renderAll();
    const preview_data_url = fc.toDataURL({ format: "png", quality: 0.8, multiplier: 1, width: cw, height: ch, left: 0, top: 0 });

    return { design_id: designId||undefined, background: canvasBg, canvas:{ width:cw, height:ch }, elements: els, preview_data_url };
  };

  const handleSave = async () => {
    const p = payload(); if (!p) return; setSaving(true);
    try {
      const { data } = await api.post("/content-editor-studio/edit/", p);
      toast.success("Saved with preview!"); if (!designId && data.data?.design_id) { setDesignId(data.data.design_id); window.history.replaceState({},"",`/studio?id=${data.data.design_id}`); }
    } catch (e: any) { console.error("Save error:", e.response?.data); toast.error(e.response?.data?.message || "Save failed"); } finally { setSaving(false); }
  };

  const handleExport = async () => {
    if (!fc) return; setExporting(true);
    try {
      const p = payload();
      if (p) { try { const { data } = await api.post("/content-editor-studio/save/", p); if (!designId && data.data?.design_id) { setDesignId(data.data.design_id); window.history.replaceState({},"",`/studio?id=${data.data.design_id}`); } } catch(e){} }
      const url = fc.toDataURL({ format:"png", quality:1, multiplier:1, width:cw, height:ch, left:0, top:0 });
      const a = document.createElement("a"); a.download = `design-${cw}x${ch}.png`; a.href = url; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success(`Exported ${cw}x${ch} PNG`);
    } catch (e: any) { toast.error("Export failed"); } finally { setExporting(false); }
  };

  const layers = fc ? [...fc.getObjects()].reverse() : [];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden select-none">
      {/* ═══ TOP BAR ═══ */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-3 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors">Back</Link>
          <div className="w-px h-4 bg-muted"/>
          {/* Preset button */}
          <div className="relative">
            <button onClick={()=>setPresetOpen(!presetOpen)} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 hover:bg-muted rounded-lg text-xs transition-all border border-border">
              <LayoutTemplate className="w-3.5 h-3.5 text-primary"/>
              <span className="font-medium">{PRESETS[selPreset].label}</span>
              <span className="text-muted-foreground text-[10px]">{cw}x{ch}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground"/>
            </button>
            {presetOpen && (
              <div className="absolute top-full left-0 mt-1.5 bg-popover border border-border rounded-xl shadow-2xl shadow-sm p-1.5 z-[100] w-72 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Post Formats</div>
                {PRESETS.map((p,i)=>(
                  <button key={i} onClick={()=>applyPreset(i)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all group ${selPreset===i?"bg-primary/15 text-primary":"hover:bg-muted/50 text-foreground/90"}`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${selPreset===i?"bg-primary/30 text-primary":"bg-muted/50 text-muted-foreground group-hover:bg-muted"}`}>
                      {p.label.charAt(0)}
                    </div>
                    <span className="flex-1 text-left font-medium">{p.label}</span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">{p.w}x{p.h}</span>
                    {selPreset===i && <Check className="w-3 h-3 text-primary"/>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Center: zoom */}
        <div className="flex items-center gap-1">
          <button onClick={()=>setVs(Math.max(0.1,vs-0.1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted/50 text-muted-foreground"><ZoomOut className="w-3.5 h-3.5"/></button>
          <span className="text-[10px] text-muted-foreground w-10 text-center tabular-nums">{Math.round(vs*100)}%</span>
          <button onClick={()=>setVs(Math.min(2,vs+0.1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted/50 text-muted-foreground"><ZoomIn className="w-3.5 h-3.5"/></button>
        </div>
        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={handleSave} disabled={saving||exporting} className="px-3 py-1.5 flex items-center gap-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs font-medium transition-all border border-border disabled:opacity-40">
            {saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>} Save
          </button>
          <button onClick={handleExport} disabled={saving||exporting} className="px-3 py-1.5 flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/80 rounded-lg text-xs font-medium transition-all disabled:opacity-40 shadow-lg shadow-primary/20">
            {exporting?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Download className="w-3.5 h-3.5"/>} Export PNG
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="w-[72px] bg-card/50 border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 z-20">
          <SideBtn icon={<MousePointer2 className="w-[18px] h-[18px]"/>} label="Select" active={activeTool==="select"} onClick={()=>{setActiveTool("select");fc?.discardActiveObject();fc?.renderAll();}}/>
          <div className="w-8 h-px bg-muted/50 my-1"/>
          <SideBtn icon={<Type className="w-[18px] h-[18px]"/>} label="Text" active={activeTool==="text"} onClick={()=>{addText();setActiveTool("text");}}/>
          <SideBtn icon={<Square className="w-[18px] h-[18px]"/>} label="Rectangle" onClick={()=>addShape("rect")}/>
          <SideBtn icon={<Circle className="w-[18px] h-[18px]"/>} label="Circle" onClick={()=>addShape("circle")}/>
          <SideBtn icon={<Triangle className="w-[18px] h-[18px]"/>} label="Triangle" onClick={()=>addShape("triangle")}/>
          <SideBtn icon={<Star className="w-[18px] h-[18px]"/>} label="Star" onClick={()=>addShape("star")}/>
          <SideBtn icon={<Minus className="w-[18px] h-[18px]"/>} label="Line" onClick={()=>addShape("line")}/>
          <div className="w-8 h-px bg-muted/50 my-1"/>
          <div className="relative">
            <SideBtn icon={uploading?<Loader2 className="w-[18px] h-[18px] animate-spin"/>:<ImageIcon className="w-[18px] h-[18px]"/>} label="Image" onClick={()=>fileRef.current?.click()}/>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload}/>
          </div>
          <div className="mt-auto"/>
          <SideBtn icon={<Eraser className="w-[18px] h-[18px] text-destructive"/>} label="Clear All" onClick={clearCanvas}/>
        </aside>

        {/* ═══ CANVAS AREA ═══ */}
        <main ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center relative">
          {loading && <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>}
          {/* Checkerboard pattern behind canvas */}
          <div style={{transform:`scale(${vs})`,transformOrigin:"center center",transition:"transform 0.2s ease"}} className="relative">
            <div className="shadow-2xl shadow-md ring-1 ring-border/50" style={{width:cw,height:ch}}>
              <canvas ref={canvasElRef}/>
            </div>
          </div>
          {/* Bottom info bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-border text-[10px] text-muted-foreground">
            <span className="tabular-nums">{cw} x {ch}px</span>
            <div className="w-px h-3 bg-muted"/>
            <span className="tabular-nums">{Math.round(vs*100)}%</span>
            <div className="w-px h-3 bg-muted"/>
            <span>{fc?.getObjects().length || 0} objects</span>
          </div>
        </main>

        {/* ═══ RIGHT PANEL ═══ */}
        <aside className="w-[280px] bg-card/50 border-l border-border flex flex-col shrink-0 z-20 overflow-hidden">
          {/* Panel tabs */}
          <div className="flex border-b border-border shrink-0">
            <button onClick={()=>setLeftTab("tools")} className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-semibold transition-colors ${leftTab==="tools"?"text-primary border-b-2 border-primary":"text-muted-foreground hover:text-foreground/90"}`}>Design</button>
            <button onClick={()=>setLeftTab("layers")} className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-semibold transition-colors ${leftTab==="layers"?"text-primary border-b-2 border-primary":"text-muted-foreground hover:text-foreground/90"}`}>Layers</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
            {leftTab === "tools" ? (<>
              {/* Canvas Background */}
              <Section title="Canvas Background">
                <div className="grid grid-cols-8 gap-1">
                  {COLORS_PALETTE.slice(0,16).map(c=>(
                    <button key={c} onClick={()=>changeBg(c)} className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 ${canvasBg===c?"border-primary scale-110":"border-transparent"}`} style={{background:c}}/>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input type="color" value={canvasBg} onChange={e=>changeBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"/>
                  <input type="text" value={canvasBg} onChange={e=>changeBg(e.target.value)} className="flex-1 bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs text-foreground/90 font-mono"/>
                </div>
              </Section>

              {!sel ? (
                <div className="text-center py-8">
                  <MousePointer2 className="w-8 h-8 mx-auto text-muted-foreground/70 mb-2"/>
                  <p className="text-xs text-muted-foreground">Select an element to edit its properties</p>
                </div>
              ) : (<>
                {/* ── Quick Actions ── */}
                <Section title="Actions">
                  <div className="flex gap-1">
                    <MiniBtn icon={<Copy className="w-3.5 h-3.5"/>} label="Duplicate" onClick={duplicateSelected}/>
                    <MiniBtn icon={<Trash2 className="w-3.5 h-3.5 text-destructive"/>} label="Delete" onClick={deleteSelected}/>
                    <MiniBtn icon={<ArrowUp className="w-3.5 h-3.5"/>} label="Forward" onClick={()=>{if(fc&&sel){fc.bringObjectForward(sel);fc.renderAll();}}}/>
                    <MiniBtn icon={<ArrowDown className="w-3.5 h-3.5"/>} label="Back" onClick={()=>{if(fc&&sel){fc.sendObjectBackwards(sel);fc.renderAll();}}}/>
                  </div>
                </Section>

                {/* ── Position & Size ── */}
                <Section title="Transform">
                  <div className="grid grid-cols-2 gap-2">
                    <NumInput label="X" value={Math.round(sel.left||0)} onChange={v=>upd("left",v)}/>
                    <NumInput label="Y" value={Math.round(sel.top||0)} onChange={v=>upd("top",v)}/>
                    <NumInput label="W" value={Math.round((sel.width||0)*(sel.scaleX||1))} onChange={v=>{sel.set({scaleX:v/(sel.width||100)});fc?.renderAll();setTick(t=>t+1);}}/>
                    <NumInput label="H" value={Math.round((sel.height||0)*(sel.scaleY||1))} onChange={v=>{sel.set({scaleY:v/(sel.height||100)});fc?.renderAll();setTick(t=>t+1);}}/>
                    <NumInput label="Angle" value={Math.round(sel.angle||0)} onChange={v=>upd("angle",v)}/>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Opacity</label>
                      <input type="range" min={0} max={1} step={0.05} value={sel.opacity??1} onChange={e=>upd("opacity",parseFloat(e.target.value))} className="w-full accent-primary h-1"/>
                    </div>
                  </div>
                </Section>

                {/* ── TEXT PROPS ── */}
                {(sel.type==="i-text"||sel.type==="text") && (<>
                  <Section title="Typography">
                    <textarea value={(sel as any).text||""} onChange={e=>upd("text",e.target.value)} rows={2}
                      className="w-full bg-muted/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground/90 resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"/>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <NumInput label="Size" value={(sel as any).fontSize||30} onChange={v=>upd("fontSize",v)}/>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Weight</label>
                        <div className="flex gap-1">
                          <button onClick={()=>upd("fontWeight",(sel as any).fontWeight==="bold"?"normal":"bold")}
                            className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition-all ${(sel as any).fontWeight==="bold"?"bg-primary/20 text-primary border border-primary/30":"bg-muted/50 text-muted-foreground border border-border hover:bg-muted"}`}>
                            <Bold className="w-3.5 h-3.5"/>
                          </button>
                          <button onClick={()=>upd("fontStyle",(sel as any).fontStyle==="italic"?"normal":"italic")}
                            className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition-all ${(sel as any).fontStyle==="italic"?"bg-primary/20 text-primary border border-primary/30":"bg-muted/50 text-muted-foreground border border-border hover:bg-muted"}`}>
                            <Italic className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {(["left","center","right"] as const).map(a=>(
                        <button key={a} onClick={()=>upd("textAlign",a)}
                          className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition-all ${(sel as any).textAlign===a?"bg-primary/20 text-primary":"bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                          {a==="left"?<AlignLeft className="w-3.5 h-3.5"/>:a==="center"?<AlignCenter className="w-3.5 h-3.5"/>:<AlignRight className="w-3.5 h-3.5"/>}
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Text Color">
                    <ColorPicker value={ensureHex(sel.fill)} onChange={v=>upd("fill",v)}/>
                  </Section>
                </>)}

                {/* ── SHAPE PROPS ── */}
                {["rect","circle","triangle","polygon","line"].includes(sel.type||"") && (
                  <Section title="Fill Color">
                    <ColorPicker value={ensureHex(sel.type==="line"?sel.stroke:sel.fill)} onChange={v=>upd("fill",v)}/>
                  </Section>
                )}
              </>)}
            </>) : (
              /* ── LAYERS TAB ── */
              <div className="space-y-1">
                {layers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No layers yet</p>
                ) : layers.map((obj, i) => {
                  const isActive = sel === obj;
                  const name = obj.type === "i-text" ? `"${((obj as any).text||"").substring(0,16)}"` : obj.type === "image" ? "Image" : obj.type || "Object";
                  return (
                    <button key={i} onClick={()=>{fc?.setActiveObject(obj);fc?.renderAll();}}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${isActive?"bg-primary/15 text-primary ring-1 ring-primary/20":"hover:bg-muted/50 text-muted-foreground"}`}>
                      <Layers className="w-3.5 h-3.5 shrink-0"/>
                      <span className="flex-1 text-left truncate font-medium capitalize">{name}</span>
                      <span className="text-[10px] text-muted-foreground/70">{layers.length - i}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══ SUBCOMPONENTS ═══ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

function SideBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className={`w-11 h-11 flex flex-col items-center justify-center rounded-xl transition-all gap-0.5 group ${active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground/90"}`}>
      {icon}
      <span className="text-[8px] leading-none opacity-70">{label.length > 6 ? label.substring(0,5) : label}</span>
    </button>
  );
}

function MiniBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className="flex-1 h-8 flex items-center justify-center rounded-lg bg-muted/50 hover:bg-muted border border-border transition-all text-muted-foreground hover:text-foreground/90">
      {icon}
    </button>
  );
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
      <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground/90 tabular-nums focus:border-primary/50 outline-none transition-all"/>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-8 gap-1 mb-2">
        {COLORS_PALETTE.map(c => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-full aspect-square rounded border-2 transition-all hover:scale-110 ${value === c ? "border-primary scale-110" : "border-transparent"}`}
            style={{ background: c }}/>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"/>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs text-foreground/90 font-mono"/>
      </div>
    </div>
  );
}

export default function StudioEditor() {
  return <Suspense fallback={<div className="h-screen bg-background"/>}><StudioContent/></Suspense>;
}
