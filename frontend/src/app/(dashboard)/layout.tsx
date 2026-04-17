"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles, FolderOpen, Calendar,
  UserCircle, Settings, Share2, CreditCard,
  PanelLeftClose, PanelLeft, Bookmark, Plus,
  ChevronRight, RefreshCw, ChevronDown,
  LogOut
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";

const navGroups = [
  {
    label: "Main",
    items: [
      { name: "AI Generator", href: "/ai-generation", icon: Sparkles },
      { name: "Library", href: "/library", icon: FolderOpen },
      { name: "Planner", href: "/planner", icon: Calendar },
    ],
  },
  {
    label: "Setup",
    items: [
      { name: "Brand Personas", href: "/persona", icon: UserCircle },
      { name: "Channels", href: "/socials", icon: Share2 },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Billing", href: "/billing", icon: CreditCard },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/* page name lookup */
function getPageTitle(path: string) {
  const map: Record<string, string> = {
    "/ai-generation": "AI Generator",
    "/library": "Library",
    "/planner": "Planner",
    "/persona": "Brand Personas",
    "/socials": "Channels",
    "/billing": "Billing",
    "/settings": "Settings",
    "/dashboard": "Dashboard",
  };
  return map[path] || "Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pageTitle = getPageTitle(pathname);

  const { logout, user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const router = useRouter();

  const workspaceName = workspace?.workspace_name ?? 'My Workspace';
  const userInitials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : '??';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">

        {/* ═══ SIDEBAR ═══ */}
        <aside
          className={`${sidebarOpen ? "w-[220px]" : "w-[64px]"} border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 transition-all duration-300 z-50 overflow-hidden`}
        >
          {/* Workspace Header */}
          <div className={`h-14 flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-0'} border-b border-border shrink-0`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{workspaceName[0]?.toUpperCase() ?? 'W'}</span>
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{workspaceName}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">free plan</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Nav Groups */}
          <div className={`flex-1 overflow-y-auto py-4 ${sidebarOpen ? 'px-3 space-y-6' : 'px-2 space-y-4'} scrollbar-hide`}>
            {navGroups.map((group) => (
              <div key={group.label}>
                {sidebarOpen && (
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    {group.label}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href + item.name}
                        href={item.href}
                        title={!sidebarOpen ? item.name : undefined}
                        className={`flex items-center ${sidebarOpen ? 'gap-2.5 px-2.5 py-[7px]' : 'justify-center w-10 h-10 mx-auto'} rounded-lg text-[13px] font-medium transition-all ${isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 ">
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* ═══ MAIN AREA ═══ */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-[220px]" : "ml-[64px]"}`}
        >
          {/* Top Bar */}
          <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{pageTitle}</span>
                <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
                <span>Overview</span>
              </nav>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                Settings
              </Link>
              <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
              <Link
                href="/studio"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                New Design
              </Link>
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary ml-1">
                {userInitials}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 bg-background transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
