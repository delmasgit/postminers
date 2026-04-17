"use client";
import { useState } from 'react';

export default function CreateContentStudio() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setIsGenerating(true);
    
    // MOCK API CALL
    setTimeout(() => {
      setVariants([
        {
          id: 1,
          text: `🚀 Exciting news about ${topic}! We're thrilled to share our latest insights.`,
          image_placeholder: "bg-primary/20"
        },
        {
          id: 2,
          text: `Did you know about ${topic}? Here are 3 tips to help your business grow! 👇`,
          image_placeholder: "bg-secondary/20"
        },
        {
          id: 3,
          text: `The future of ${topic} is here. Find out why it matters. #growth`,
          image_placeholder: "bg-accent/20"
        }
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Creation Studio</h1>
          <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Back to Dashboard</a>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Prompt Section */}
          <aside className="w-full lg:w-1/3 space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">What's on your mind?</h2>
              <form onSubmit={handleGenerate}>
                <textarea 
                  className="w-full p-4 border border-input rounded-lg bg-input focus:ring-2 focus:ring-ring outline-none transition-all mb-4 text-foreground placeholder:text-muted-foreground"
                  rows={5}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. A thread about the new Meta API limits..."
                  required
                />
                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg shadow transition-colors flex justify-center items-center"
                >
                  {isGenerating ? "Consulting AI Engine..." : "Generate 3 Variants"}
                </button>
              </form>
            </div>
          </aside>

          {/* Canvas & Selection Section */}
          <main className="w-full lg:w-2/3 bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Generated Variants</h2>
            
            {variants.length === 0 ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground bg-muted/20">
                Awaiting your prompt...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map(variant => (
                  <div 
                    key={variant.id} 
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`cursor-pointer border-2 p-4 rounded-xl transition-all bg-background ${selectedVariant === variant.id ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center ${variant.image_placeholder}`}>
                       <span className="text-foreground/80 font-medium text-sm">Auto-Generated Image</span>
                    </div>
                    <p className="text-sm text-foreground">{variant.text}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow transition-colors" onClick={() => alert("Added to scheduling queue!")}>
                  Send to Publishing Queue
                </button>
              </div>
            )}
          </main>
        </div>
        
      </div>
    </div>
  );
}
