"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Sparkles, Calendar, PenTool, ArrowRight, Zap, BarChart3, Shield, Layers, Globe, Users, Check, Star, Send, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Github, ChevronDown } from "lucide-react";
import { useRef, useState, useEffect, useCallback, MouseEvent } from "react";

/* ───────── Helpers ───────── */
function useCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return count;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

/* ───────── Main Page ───────── */
export default function LandingPage() {

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden transition-colors duration-300">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>PostMiner</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="px-5 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-semibold">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <HeroSection />

      {/* ═══ STATS BAR ═══ */}
      <StatsBar />

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to dominate social</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">From AI-powered generation to one-click publishing — PostMiner is your all-in-one content engine.</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Sparkles className="w-6 h-6" />} color="text-secondary" title="AI Template Engine" description="Input your idea once. Get 3 stunning visual variations with AI-written captions, instantly." />
            <FeatureCard icon={<PenTool className="w-6 h-6" />} color="text-primary" title="Premium Canvas Studio" description="Full-featured visual editor to add logos, edit vectors, and tweak layouts pixel-perfectly." />
            <FeatureCard icon={<Calendar className="w-6 h-6" />} color="text-accent" title="Smart Scheduler" description="Drag-and-drop your content onto a calendar and let our engine publish at peak engagement times." />
            <FeatureCard icon={<BarChart3 className="w-6 h-6" />} color="text-primary" title="Deep Analytics" description="Track impressions, clicks, and conversions across all platforms from a single dashboard." />
            <FeatureCard icon={<Shield className="w-6 h-6" />} color="text-accent" title="Brand Safety AI" description="Every post is scanned for tone consistency and potential brand risks before going live." />
            <FeatureCard icon={<Layers className="w-6 h-6" />} color="text-secondary" title="Multi-Workspace" description="Manage unlimited brands under one account. Switch contexts with a single click." />
          </motion.div>
        </div>
      </section>

      {/* ═══ ANIMATED POST MARQUEE ═══ */}
      <PostMarquee />

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Three steps to content freedom</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">From idea to published post in under five minutes.</motion.p>
          </motion.div>
          <div className="space-y-0 relative">
            <div className="absolute left-8 md:left-10 top-0 bottom-0 w-[2px] bg-border" />
            <TimelineStep num={1} title="Describe your idea" text="Type a simple prompt — our AI handles the rest, generating images and copy tailored to your brand voice." />
            <TimelineStep num={2} title="Pick & polish" text="Choose from 3 stunning variations. Fine-tune in our Canvas Studio or edit the caption directly." />
            <TimelineStep num={3} title="Schedule & publish" text="Drag onto the planner, pick your channels, and sit back. PostMiner publishes at optimal times automatically." />
          </div>
        </div>
      </section>

      {/* ═══ PRICING PREVIEW ═══ */}
      <PricingSection />

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection />

      {/* ═══ CONTACT FORM ═══ */}
      <ContactSection />

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════ */

/* ─── Stats Bar ─── */
function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const users = useCounter(10000, inView);
  const posts = useCounter(500000, inView);
  const brands = useCounter(2500, inView);
  const uptime = useCounter(99, inView);

  return (
    <section ref={ref} className="border-y border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <StatItem value={`${(users / 1000).toFixed(users >= 10000 ? 0 : 1)}K+`} label="Active Users" />
        <StatItem value={`${(posts / 1000).toFixed(posts >= 500000 ? 0 : 0)}K+`} label="Posts Generated" />
        <StatItem value={`${(brands / 1000).toFixed(brands >= 2500 ? 1 : 1)}K+`} label="Brands Managed" />
        <StatItem value={`${uptime}%`} label="Uptime SLA" />
      </div>
    </section>
  );
}
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode; color: string; title: string; description: string }) {
  return (
    <motion.div variants={fadeUp}
      className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all relative overflow-hidden group shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border ${color} transition-colors`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

/* ─── Post Marquee ─── */
function PostMarquee() {
  const posts = [
    { platform: "LinkedIn", handle: "@techstartup", text: "🚀 Just launched our new AI feature! The future of productivity is here.", likes: "2.4K", color: "from-[#0A66C2]/20 to-[#0A66C2]/5" },
    { platform: "Twitter / X", handle: "@sarahdesigns", text: "Design tip: Use contrast to guide the eye. Less is more, always. ✨", likes: "8.1K", color: "from-foreground/10 to-foreground/5" },
    { platform: "Instagram", handle: "@fitnessbrand", text: "New year, new goals 💪 What's your #1 health priority this quarter?", likes: "15K", color: "from-[#E1306C]/20 to-[#F77737]/5" },
    { platform: "LinkedIn", handle: "@cloudops", text: "We just hit 99.99% uptime 🎯 Here's how we did it (thread) →", likes: "5.7K", color: "from-[#0A66C2]/20 to-[#0A66C2]/5" },
    { platform: "Twitter / X", handle: "@airesearcher", text: "Breaking: GPT-5 benchmarks are incredible. Full analysis thread below 🧵", likes: "42K", color: "from-foreground/10 to-foreground/5" },
    { platform: "Instagram", handle: "@travelvibe", text: "Sunset in Santorini hits different 🌅 Where's your dream destination?", likes: "28K", color: "from-[#E1306C]/20 to-[#F77737]/5" },
  ];
  const doubled = [...posts, ...posts];

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Content in motion</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Posts that captivate, on autopilot</h2>
      </div>
      {/* Row 1 */}
      <div className="flex gap-6 mb-6 w-max animate-marquee">
        {doubled.map((p, i) => <PostCard key={`a-${i}`} {...p} />)}
      </div>
      {/* Row 2 reverse */}
      <div className="flex gap-6 w-max animate-marquee-reverse">
        {[...doubled].reverse().map((p, i) => <PostCard key={`b-${i}`} {...p} />)}
      </div>
    </section>
  );
}

function PostCard({ platform, handle, text, likes, color }: { platform: string; handle: string; text: string; likes: string; color: string }) {
  return (
    <div className={`w-80 shrink-0 p-6 rounded-2xl border border-border bg-gradient-to-br ${color} bg-card backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">{platform[0]}</div>
        <div>
          <div className="font-semibold text-sm text-foreground">{platform}</div>
          <div className="text-xs text-muted-foreground">{handle}</div>
        </div>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-4">{text}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="w-3.5 h-3.5 text-primary" /> {likes} engagements
      </div>
    </div>
  );
}

/* ─── Timeline Step ─── */
function TimelineStep({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: num * 0.15 }}
      className="relative pl-20 md:pl-24 pb-16 last:pb-0">
      <div className="absolute left-4 md:left-6 top-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/30 z-10">{num}</div>
      <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed max-w-xl">{text}</p>
    </motion.div>
  );
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    { name: "Free", price: 0, desc: "For trying things out", features: ["5 AI generations / month", "1 social channel", "Basic templates", "Community support"], cta: "Get Started Free", popular: false },
    { name: "Starter", price: yearly ? 15 : 19, desc: "For solopreneurs", features: ["50 AI generations / month", "3 social channels", "Canvas Studio access", "Post scheduling", "Email support"], cta: "Start Free Trial", popular: false },
    { name: "Pro", price: yearly ? 39 : 49, desc: "For growing teams", features: ["Unlimited generations", "10 social channels", "Advanced analytics", "Brand Safety AI", "Priority support", "Multi-workspace (3)"], cta: "Start Free Trial", popular: true },
    { name: "Enterprise", price: -1, desc: "For large organizations", features: ["Everything in Pro", "Unlimited workspaces", "Custom AI model training", "SSO & SAML", "Dedicated account manager", "SLA guarantee", "Custom integrations"], cta: "Contact Sales", popular: false },
  ];

  return (
    <section id="pricing" className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">Start free, scale when you&apos;re ready. No hidden fees.</motion.p>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-1 p-1 rounded-full bg-muted border border-border">
            <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Yearly <span className="text-xs opacity-80">(-20%)</span>
            </button>
          </motion.div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeUp}
              className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-1 duration-300 flex flex-col ${plan.popular ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10 scale-[1.02]' : 'bg-card border-border shadow-sm hover:shadow-lg'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">Most Popular</div>
              )}
              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <div className="mb-6">
                {plan.price === -1 ? (
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.name === "Enterprise" ? "#contact" : "/register"}
                className={`w-full py-3 rounded-xl font-semibold text-center transition-all block ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-muted text-foreground hover:bg-muted/80 border border-border'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center mt-10">
          <Link href="/pricing" className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors">
            Compare all features in detail <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah Chen", role: "CMO at Luminex", quote: "PostMiner cut our content creation time by 80%. The AI actually understands our brand voice — it's unreal.", avatar: "SC" },
    { name: "Marcus Rodriguez", role: "Founder, GrowthOps", quote: "We went from 3 posts/week to 3 posts/day. The scheduling + analytics combo is a game changer.", avatar: "MR" },
    { name: "Emily Park", role: "Social Lead at DevTools", quote: "The Canvas Studio alone replaced two other tools we were paying for. The ROI was immediate.", avatar: "EP" },
    { name: "David Kim", role: "CEO, BrandForge", quote: "Enterprise onboarding was seamless. Their team configured our custom AI model in under a week.", avatar: "DK" },
  ];

  return (
    <section className="py-28 md:py-36 bg-card/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Loved by marketers worldwide</motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUp}
              className="p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">{t.avatar}</div>
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
              </div>
              <p className="text-foreground/90 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Contact Section ─── */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Get in touch</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Let&apos;s build something great together</h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">Have questions about PostMiner? Want a custom demo? We&apos;d love to hear from you.</p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Mail className="w-5 h-5 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium text-foreground">hello@postminer.io</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Phone className="w-5 h-5 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium text-foreground">+1 (555) 000-0123</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Office</div>
                  <div className="font-medium text-foreground">San Francisco, CA</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-card border border-border">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6"><Check className="w-8 h-8 text-accent" /></div>
                <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
                <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="p-8 md:p-10 rounded-3xl bg-card border border-border shadow-sm space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <input required type="text" placeholder="Jane" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input required type="text" placeholder="Doe" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input required type="email" placeholder="jane@company.com" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea required rows={5} placeholder="Tell us how we can help..." className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>PostMiner</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">The AI-powered content engine for modern marketers. Generate, edit, schedule, publish — all in one place.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Changelog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 PostMiner SaaS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO SECTION — Interactive dots + template mockups
   ═══════════════════════════════════════════════════════ */

const DOT_GAP = 48;
const DOT_RADIUS = 1.8;
const GLOW_RADIUS = 180;

const templateCards = [
  { x: "5%",  y: "18%", rotate: -12, colors: "#583DFF,#8174FF",  w: 110, h: 150 },
  { x: "82%", y: "12%", rotate: 8,   colors: "#FF3D83,#FFCDD7",  w: 120, h: 160 },
  { x: "88%", y: "60%", rotate: -6,  colors: "#3DFFB9,#00A976",  w: 100, h: 140 },
  { x: "2%",  y: "65%", rotate: 10,  colors: "#E4FF3D,#3DFFB9",  w: 105, h: 145 },
  { x: "12%", y: "40%", rotate: -5,  colors: "#1B007B,#583DFF",  w: 95,  h: 130 },
  { x: "78%", y: "38%", rotate: 14,  colors: "#CD005F,#FF91AD",  w: 115, h: 155 },
];

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const drawDots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cols = Math.ceil(rect.width / DOT_GAP);
    const rows = Math.ceil(rect.height / DOT_GAP);
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * DOT_GAP + DOT_GAP / 2;
        const y = r * DOT_GAP + DOT_GAP / 2;
        const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
        const proximity = Math.max(0, 1 - dist / GLOW_RADIUS);

        // Base dot: very subtle
        const baseAlpha = 0.12;
        // Glow dot: uses primary color
        const glowAlpha = proximity * 0.9;

        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS + proximity * 2.5, 0, Math.PI * 2);

        if (glowAlpha > 0.01) {
          ctx.fillStyle = `rgba(88, 61, 255, ${glowAlpha})`;
        } else {
          ctx.fillStyle = `rgba(128, 128, 160, ${baseAlpha})`;
        }
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(drawDots);
  }, []);

  useEffect(() => {
    drawDots();
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawDots]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -9999, y: -9999 };
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden"
    >
      {/* Interactive dot grid — drawn on canvas for perf */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Animated background blobs */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/10 blur-[160px] rounded-full animate-pulse-glow" style={{ zIndex: 1 }} />
      <div className="absolute top-60 -left-40 w-[500px] h-[500px] bg-secondary/8 blur-[140px] rounded-full animate-pulse-glow" style={{ animationDelay: "2s", zIndex: 1 }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/8 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: "4s", zIndex: 1 }} />

      {/* Floating design template mockups */}
      {templateCards.map((card, i) => {
        const [from, to] = card.colors.split(",");
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
            className="absolute hidden md:block animate-float rounded-2xl shadow-2xl overflow-hidden"
            style={{
              left: card.x,
              top: card.y,
              width: card.w,
              height: card.h,
              transform: `rotate(${card.rotate}deg)`,
              background: `linear-gradient(135deg, ${from}, ${to})`,
              animationDelay: `${i * 0.8}s`,
              zIndex: 2,
              opacity: 0.7,
            }}
          >
            {/* Mini template UI skeleton */}
            <div className="p-3 flex flex-col justify-between h-full">
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.25)" }} />
              <div className="space-y-1.5">
                <div style={{ height: 5, width: "75%", borderRadius: 99, background: "rgba(255,255,255,0.3)" }} />
                <div style={{ height: 5, width: "50%", borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
                <div style={{ height: 7, width: "60%", borderRadius: 99, background: "rgba(255,255,255,0.25)", marginTop: 6 }} />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative" style={{ zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-primary text-sm mb-8 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>The Ultimate Content Engine is Live</span>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[1.05]">
          Automate your content<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            at the speed of thought.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Generate stunning visuals, write high-converting captions, and schedule a month of posts in minutes — powered by our Modular AI Engine.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register"
            className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-lg">
            Start your 14-day free trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features"
            className="flex items-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-full font-medium hover:bg-muted/50 transition-colors shadow-sm">
            See how it works
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
