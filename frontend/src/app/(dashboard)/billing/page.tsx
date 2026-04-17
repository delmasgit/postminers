import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full text-foreground transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, credits, and payment methods.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 p-8">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider border border-primary/20">
              Free Trial
            </span>
          </div>
          
          <h2 className="text-xl font-bold mb-6 text-foreground">Current Plan</h2>
          
          <div className="flex items-end gap-2 mb-8 text-foreground">
            <span className="text-5xl font-bold tracking-tighter">$0</span>
            <span className="text-muted-foreground mb-1">/ mo</span>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">AI Generation Credits</span>
              <span className="font-bold text-foreground">12 / 50</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary w-[24%]" />
            </div>
            <p className="text-xs text-muted-foreground">Credits reset on April 5, 2026</p>
          </div>

          <button className="px-6 py-3 bg-foreground text-background hover:opacity-90 font-semibold rounded-xl transition-opacity shadow-xl w-full">
            Upgrade via Stripe
          </button>
        </section>

        <section className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-colors duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment Method
          </h2>
          <p className="text-sm text-muted-foreground mb-6">No payment method on file. Upgrade to a paid plan to add one.</p>
          <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
            Add Payment Method
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-10 mb-4">Billing History</h3>
          <p className="text-sm text-muted-foreground">No past invoices available for this account.</p>
        </section>
      </div>
    </div>
  );
}
