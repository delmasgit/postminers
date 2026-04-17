"use client";

import { CheckCircle2, Link2, Share2, AlertCircle } from "lucide-react";

export default function Socials() {
  const connections = [
    { name: "LinkedIn", status: "Connected", handle: "Jane Doe", icon: "in" },
    { name: "Twitter / X", status: "Connected", handle: "@janedoe", icon: "𝕏" },
    { name: "Instagram", status: "Disconnected", handle: "", icon: "ig" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto h-full text-foreground transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Share2 className="text-primary w-8 h-8" />
          The Pipe (Social Connections)
        </h1>
        <p className="text-muted-foreground">Connect your accounts to enable one-click publishing.</p>
      </header>

      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 mb-8 transition-colors">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-primary mb-1">OAuth Connections are secure</h4>
          <p className="text-sm text-primary/80">We do not store your passwords. We use official APIs to securely schedule posts on your behalf. You can revoke access at any time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {connections.map((conn, idx) => (
          <div key={idx} className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm transition-colors hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-xl text-foreground">
                {conn.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{conn.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {conn.status === "Connected" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">Connected as {conn.handle}</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
            </div>
            
            <button className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
              conn.status === "Connected" 
                ? 'bg-muted text-foreground hover:bg-muted/80 border border-border' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
            }`}>
              {conn.status === "Connected" ? "Manage" : "Connect Account"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
