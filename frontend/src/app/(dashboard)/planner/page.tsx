"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function Planner() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1);

  // Mock scheduled posts
  const posts = [
    { date: 12, title: "Product Launch", platform: "LinkedIn", time: "09:00 AM" },
    { date: 15, title: "Cyberpunk Post", platform: "Twitter", time: "12:30 PM" },
    { date: 15, title: "Company Culture", platform: "Instagram", time: "05:00 PM" },
    { date: 28, title: "Monthly Wrap-up", platform: "LinkedIn", time: "10:00 AM" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col text-foreground transition-colors duration-300">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Planner</h1>
          <p className="text-muted-foreground">Schedule your generated assets directly to your social channels.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-2 transition-colors">
            <button className="text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-medium min-w-[120px] text-center text-foreground">March 2026</span>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </header>

      <div className="border border-border rounded-2xl overflow-hidden bg-card/60 backdrop-blur-sm flex-1 flex flex-col shadow-sm transition-colors">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {days.map((day) => (
            <div key={day} className="py-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider border-r border-border last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1">
          {dates.map((date, i) => {
            const dayPosts = posts.filter(p => p.date === date);
            const isToday = date === 10;
            
            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 border-b border-r border-border relative hover:bg-muted/30 transition-colors group
                ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
              >
                <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {date > 31 ? date - 31 : date}
                </span>
                
                <div className="mt-2 flex flex-col gap-2">
                  {dayPosts.map((post, idx) => (
                    <div key={idx} className="px-2 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-xs cursor-grab hover:bg-primary/20 transition-colors">
                      <div className="font-semibold text-primary truncate">{post.title}</div>
                      <div className="flex justify-between items-center text-primary/70 mt-1">
                        <span>{post.platform}</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
