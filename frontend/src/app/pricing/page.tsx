"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Check, X, ArrowRight, ChevronDown, Twitter, Linkedin, Instagram, Github } from "lucide-react";
import { useState } from "react";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const plans = [
  {
    name: "Free",
    desc: "Perfect for hobbyists and side projects",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get Started Free",
    ctaStyle: "bg-muted text-foreground hover:bg-muted/80 border border-border",
    popular: false,
    features: {
      "AI generations / month": "5",
      "Social channels": "1",
      "Canvas Studio": false,
      "Post scheduling": false,
      "Brand Safety AI": false,
      "Analytics dashboard": "Basic",
      "Multi-workspace": false,
      "Team members": "1",
      "API access": false,
      "Custom AI training": false,
      "SSO & SAML": false,
      "Dedicated support": false,
    },
  },
  {
    name: "Starter",
    desc: "For solopreneurs ready to grow",
    monthlyPrice: 19,
    yearlyPrice: 15,
    cta: "Start Free Trial",
    ctaStyle: "bg-muted text-foreground hover:bg-muted/80 border border-border",
    popular: false,
    features: {
      "AI generations / month": "50",
      "Social channels": "3",
      "Canvas Studio": true,
      "Post scheduling": true,
      "Brand Safety AI": false,
      "Analytics dashboard": "Standard",
      "Multi-workspace": false,
      "Team members": "2",
      "API access": false,
      "Custom AI training": false,
      "SSO & SAML": false,
      "Dedicated support": false,
    },
  },
  {
    name: "Pro",
    desc: "For growing teams and agencies",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: "Start Free Trial",
    ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    popular: true,
    features: {
      "AI generations / month": "Unlimited",
      "Social channels": "10",
      "Canvas Studio": true,
      "Post scheduling": true,
      "Brand Safety AI": true,
      "Analytics dashboard": "Advanced",
      "Multi-workspace": "3",
      "Team members": "10",
      "API access": true,
      "Custom AI training": false,
      "SSO & SAML": false,
      "Dedicated support": false,
    },
  },
  {
    name: "Enterprise",
    desc: "For organizations at scale",
    monthlyPrice: -1,
    yearlyPrice: -1,
    cta: "Contact Sales",
    ctaStyle: "bg-muted text-foreground hover:bg-muted/80 border border-border",
    popular: false,
    features: {
      "AI generations / month": "Unlimited",
      "Social channels": "Unlimited",
      "Canvas Studio": true,
      "Post scheduling": true,
      "Brand Safety AI": true,
      "Analytics dashboard": "Custom",
      "Multi-workspace": "Unlimited",
      "Team members": "Unlimited",
      "API access": true,
      "Custom AI training": true,
      "SSO & SAML": true,
      "Dedicated support": true,
    },
  },
];

const faqs = [
  { q: "Can I switch plans at any time?", a: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time from your Settings page. Changes are prorated to the day." },
  { q: "Is there a free trial?", a: "Yes! Every paid plan comes with a 14-day free trial. No credit card required to start. You only pay if you decide to continue." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and wire transfers for Enterprise plans." },
  { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact support and we'll process a full refund." },
  { q: "What counts as an AI generation?", a: "Each time the AI creates a set of 3 image variations + caption, that counts as 1 generation. Editing or re-generating the caption doesn't use extra credits." },
  { q: "Can I add more team members?", a: "Yes. Additional team members can be added to Pro and Enterprise plans for $5/member/month." },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden transition-colors duration-300">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>PostMiner</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-foreground font-semibold">Pricing</Link>
            <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="px-5 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-semibold">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HEADER ═══ */}
      <section className="pt-36 pb-12 text-center relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[160px] rounded-full -z-10" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto px-6">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">Choose the plan that&apos;s right for you</h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">Start free, upgrade when you&apos;re ready. All plans include a 14-day free trial. No credit card required.</p>

          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-muted border border-border shadow-inner">
            <button onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!yearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${yearly ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
              Yearly <span className="text-xs opacity-80 ml-1">Save 20%</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ═══ PLAN CARDS ═══ */}
      <section className="pb-20 md:pb-28">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.div key={plan.name} variants={fadeUp}
                className={`relative p-8 rounded-3xl border flex flex-col transition-all hover:-translate-y-1 duration-300 ${plan.popular ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10 lg:scale-[1.04]' : 'bg-card border-border shadow-sm hover:shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>

                <div className="mb-8">
                  {price === -1 ? (
                    <span className="text-5xl font-bold text-foreground">Custom</span>
                  ) : price === 0 ? (
                    <span className="text-5xl font-bold text-foreground">$0</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-foreground">${price}</span>
                      <span className="text-muted-foreground text-base">/mo</span>
                      {yearly && (
                        <div className="text-xs text-muted-foreground mt-1">Billed annually (${price * 12}/yr)</div>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {Object.entries(plan.features).map(([feature, value]) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      {value === false ? (
                        <X className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      )}
                      <span className={value === false ? "text-muted-foreground/50 line-through" : "text-foreground/90"}>
                        {typeof value === "string" ? `${feature}: ${value}` : feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === "Enterprise" ? "/#contact" : "/register"}
                  className={`w-full py-3.5 rounded-xl font-semibold text-center transition-all block ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 md:py-28 bg-card/30">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 border border-primary/20 text-center overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 relative z-10">Ready to transform your content?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto relative z-10">Join 10,000+ marketers who create and publish content 10x faster with PostMiner.</p>
            <Link href="/register"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-lg">
              Start your free trial <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border bg-card/30 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl tracking-tighter mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>PostMiner</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">The AI-powered content engine for modern marketers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
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
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border rounded-2xl overflow-hidden bg-card transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}
