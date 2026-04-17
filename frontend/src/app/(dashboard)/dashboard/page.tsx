"use client";

import { Sparkles, BarChart2, Calendar, FileImage } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome to PostMiner</h1>
        <p className="text-muted-foreground">Here's a quick overview of your workspace today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Generated Assets" value="24" text="+4 this week" icon={<FileImage className="w-5 h-5 text-primary" />} />
        <StatCard title="Scheduled Posts" value="8" text="Next out: Tomorrow 9AM" icon={<Calendar className="w-5 h-5 text-secondary" />} />
        <StatCard title="Engagement Lift" value="+22%" text="Since using AI hooks" icon={<BarChart2 className="w-5 h-5 text-accent" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group transition-colors duration-300">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3 text-foreground">Create New Post</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Use our 3-step engine to generate variations, write a caption, and send it to your queue instantly.</p>
            <Link 
              href="/ai-generation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              Launch Engine
            </Link>
          </div>
          <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Studio Shortcut */}
        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm transition-colors duration-300">
          <h3 className="text-xl font-bold mb-4 text-foreground">Recent Library Assets</h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted border border-border overflow-hidden flex flex-col group cursor-pointer transition-colors duration-300">
                <div className="flex-1 bg-gradient-to-br from-muted/50 to-muted group-hover:opacity-80 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-mono text-muted-foreground">Generated Graphic {i}</span>
                </div>
                <div className="p-3 text-xs text-muted-foreground border-t border-border bg-card">
                  Created yesterday
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, text, icon }: any) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="text-muted-foreground font-medium text-sm">{title}</span>
        <div className="p-2 bg-muted rounded-lg border border-border">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
