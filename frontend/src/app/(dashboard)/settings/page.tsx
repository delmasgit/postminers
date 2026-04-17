"use client";

import { Shield, User, Bell, Palette, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Prevent hydration styling mismatch for next-themes
  useEffect(() => setMounted(true), []);

  return (
    <div className="p-8 max-w-5xl mx-auto h-full text-foreground transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings & Preferences</h1>
        <p className="text-muted-foreground">Manage your workspace preferences, profile, and security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <NavBtn 
            icon={<User className="w-4 h-4" />} 
            label="Profile" 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
          />
          <NavBtn 
            icon={<Palette className="w-4 h-4" />} 
            label="Appearance" 
            active={activeTab === "appearance"} 
            onClick={() => setActiveTab("appearance")} 
          />
          <NavBtn 
            icon={<Shield className="w-4 h-4" />} 
            label="Security" 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")} 
          />
          <NavBtn 
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications" 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")} 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <section className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <input type="text" defaultValue="Jane" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <input type="email" defaultValue="jane@company.com" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
              </div>

              <div className="space-y-2 mb-8 invisible">
                <label className="text-sm font-medium text-muted-foreground">Avatar</label>
              </div>

              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors shadow-lg shadow-primary/20">
                Save Changes
              </button>
            </section>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <section className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Appearance
              </h2>
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">Choose how you prefer to view the platform.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ThemeCard 
                    id="light" 
                    icon={<Sun className="w-6 h-6" />} 
                    label="Light Theme" 
                    current={mounted ? theme : undefined} 
                    setTheme={setTheme} 
                  />
                  <ThemeCard 
                    id="dark" 
                    icon={<Moon className="w-6 h-6" />} 
                    label="Dark Theme" 
                    current={mounted ? theme : undefined} 
                    setTheme={setTheme} 
                  />
                  <ThemeCard 
                    id="system" 
                    icon={<Laptop className="w-6 h-6" />} 
                    label="System Sync" 
                    current={mounted ? theme : undefined} 
                    setTheme={setTheme} 
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <section className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Security & Password
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <button className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium rounded-xl transition-colors">
                  Update Password
                </button>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <section className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Email Notifications
              </h2>
              <p className="text-sm font-medium text-muted-foreground mb-8">Manage what emails you receive from us.</p>
              
              <div className="space-y-4">
                {[
                  { title: "Product Updates", desc: "News about product and feature updates." },
                  { title: "Weekly Digest", desc: "A weekly summary of your content performance." },
                  { title: "Billing Alerts", desc: "Invoices and subscription renewal notices." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                    <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-muted text-foreground ring-1 ring-border shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ThemeCard({ id, icon, label, current, setTheme }: any) {
  const isActive = current === id;
  return (
    <button 
      onClick={() => setTheme(id)}
      className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 lg:mb-0 ${
        isActive 
          ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(88,61,255,0.15)]' 
          : 'bg-transparent border-input text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className={`p-3 rounded-full ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  );
}
