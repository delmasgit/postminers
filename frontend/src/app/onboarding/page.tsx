"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Building2, GraduationCap, Laptop, UserCircle, Globe, ChevronRight, ChevronDown, CheckCircle2, Upload, Twitter, Linkedin, Instagram, Info } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";

// --- Types ---
type Category = 'ecommerce_retail' | 'local_business' | 'education_coaching' | 'software_tech' | 'creator_brand' | 'other_custom' | null;

interface OnboardingState {
  category: Category;
  customCategory: string;
  workspaceName: string;
  toneOfVoice: string;
  primaryColors: string[];
  websiteUrl: string;
  contactEmail: string;
  phoneNumber: string;
  physicalAddress: string;
  dynamicFields: Record<string, string>;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);

  // Guard: if user already has a workspace, skip onboarding
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWorkspace().then(() => {
      const { workspace: ws } = useWorkspaceStore.getState();
      if (ws) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  const [formData, setFormData] = useState<OnboardingState>({
    category: null,
    customCategory: "",
    workspaceName: "",
    toneOfVoice: "",
    primaryColors: ["#583DFF"],
    websiteUrl: "",
    contactEmail: "",
    phoneNumber: "",
    physicalAddress: "",
    dynamicFields: {},
  });

  const [socials, setSocials] = useState({
    x: false,
    linkedin: false,
    pinterest: false,
    instagram: false,
  });

  const [showContactInfo, setShowContactInfo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateForm = (updates: Partial<OnboardingState>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleStep2Submit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post('/workspaces/onboarding/', {
        workspace_name: formData.workspaceName,
        category: formData.category,
        custom_category: formData.customCategory,
        tone_of_voice: formData.toneOfVoice,
        primary_colors: formData.primaryColors,
        website_url: formData.websiteUrl,
        contact_email: formData.contactEmail,
        phone_number: formData.phoneNumber,
        physical_address: formData.physicalAddress,
        dynamic_fields: formData.dynamicFields
      });
      // Update the global workspace store so the sidebar shows the new name immediately
      useWorkspaceStore.getState().fetchWorkspace();
      // Success, move to step 3
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.response?.data?.workspace_name?.[0] || err.response?.data?.category?.[0] || err.response?.data?.detail || "Failed to save workspace. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => router.push('/dashboard');

  // Show spinner while checking for existing workspace
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-10 px-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10 relative bg-background px-2 transition-colors duration-300">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-500 shadow-xl ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            </div>
          ))}
          <div className="absolute top-5 left-12 right-12 h-[2px] bg-border -z-10 transition-colors duration-300">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card/80 backdrop-blur-2xl border border-border p-10 rounded-[2rem] shadow-2xl min-h-[500px] relative overflow-hidden transition-colors duration-300">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Identity
                key="step1"
                formData={formData}
                updateForm={updateForm}
                onNext={handleNext}
                onSkip={handleNext}
              />
            )}
            {step === 2 && (
              <Step2CoreInfo
                key="step2"
                formData={formData}
                updateForm={updateForm}
                onNext={handleStep2Submit}
                onBack={handleBack}
                showContactInfo={showContactInfo}
                setShowContactInfo={setShowContactInfo}
                onSkip={handleNext}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
            {step === 3 && (
              <Step3Socials
                key="step3"
                socials={socials}
                setSocials={setSocials}
                onFinish={handleFinish}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Step 1 ---
function Step1Identity({ formData, updateForm, onNext, onSkip }: any) {
  const categories = [
    { id: 'ecommerce_retail', icon: ShoppingBag, title: 'E-commerce & Retail', desc: 'Physical products, clothing, or digital storefronts.' },
    { id: 'local_business', icon: Building2, title: 'Local Business', desc: 'Agencies, salons, clinics, or physical locations.' },
    { id: 'education_coaching', icon: GraduationCap, title: 'Education & Coaching', desc: 'Schools, online courses, tutors, or bootcamps.' },
    { id: 'software_tech', icon: Laptop, title: 'Software & Tech', desc: 'SaaS products, apps, or tech startups.' },
    { id: 'creator_brand', icon: UserCircle, title: 'Creator & Solopreneur', desc: 'Personal brands, freelancers, or influencers.' },
    { id: 'other_custom', icon: Globe, title: 'Other / General', desc: 'Triggers the custom input text box.' },
  ];

  const isValid = formData.category && (formData.category !== 'other_custom' || formData.customCategory.trim().length > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">What are you creating content for?</h2>
        <p className="text-muted-foreground">Select the category that best fits your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = formData.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => updateForm({ category: cat.id })}
              className={`p-4 rounded-2xl border text-left transition-all group flex items-start gap-4 ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(88,61,255,0.15)] ring-1 ring-primary/50' : 'bg-muted/50 border-border hover:border-primary/50 hover:bg-muted'}`}
            >
              <div className={`p-2 rounded-xl mt-1 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground group-hover:text-foreground group-hover:bg-primary/20'} transition-colors`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-foreground mb-1">{cat.title}</div>
                <div className={`text-sm ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`}>{cat.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {formData.category === 'other_custom' && (
          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="mb-8 overflow-hidden">
            <label className="block text-sm font-medium text-muted-foreground mb-2">How would you describe your brand/industry?</label>
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => updateForm({ customCategory: e.target.value })}
              placeholder="e.g., Non-Profit, Dog Walking, Event Planning"
              className="w-full bg-input border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto flex justify-between items-center pt-8 border-t border-border">
        <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Skip this step</button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(88,61,255,0.3)]"
        >
          Save & Continue <ChevronRight className="w-4 h-4 text-primary-foreground/70" />
        </button>
      </div>
    </motion.div>
  );
}

// --- Step 2 ---
function Step2CoreInfo({ formData, updateForm, onNext, onBack, showContactInfo, setShowContactInfo, onSkip, isSubmitting, submitError }: any) {
  const isValid = formData.workspaceName.trim().length > 0;

  const handleDynamicChange = (key: string, value: string) => {
    updateForm({ dynamicFields: { ...formData.dynamicFields, [key]: value } });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Let&apos;s set up your workspace.</h2>
        <p className="text-muted-foreground">Tell the AI a bit about your business so it can write the perfect posts for you.</p>

        {submitError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            {submitError}
          </div>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto pr-2 max-h-[60vh] custom-scrollbar pb-10">
        {/* Section A: The Basics */}
        <div className="bg-muted/50 border border-border p-6 rounded-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Workspace Name <span className="text-destructive">*</span></label>
            <input
              type="text" value={formData.workspaceName} onChange={(e) => updateForm({ workspaceName: e.target.value })}
              placeholder="e.g., JDMart Secure Designs"
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Upload Logo or Profile Picture <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-background/50 hover:bg-muted hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-sm font-medium text-foreground">Drag and drop, or click to browse.</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Website URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input
              type="text" value={formData.websiteUrl} onChange={(e) => updateForm({ websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring outline-none transition-all"
            />
          </div>
        </div>

        {/* Section B: The AI Fuel */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 p-6 rounded-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24 stroke-primary" strokeWidth="1"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <h3 className="text-primary font-medium text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span> AI Configuration
          </h3>

          {formData.category === 'ecommerce_retail' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">What is your primary product line?</label>
                <input type="text" value={formData.dynamicFields.primary_product_line || ''} onChange={(e) => handleDynamicChange('primary_product_line', e.target.value)} placeholder="e.g., High-end bridal jewelry" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">What is your main selling point?</label>
                <input type="text" value={formData.dynamicFields.main_selling_point || ''} onChange={(e) => handleDynamicChange('main_selling_point', e.target.value)} placeholder="e.g., Handcrafted exclusivity" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          {formData.category === 'local_business' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Specific Service</label>
                <input type="text" value={formData.dynamicFields.specific_service || ''} onChange={(e) => handleDynamicChange('specific_service', e.target.value)} placeholder="e.g., Emergency plumbing" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Local Advantage</label>
                <input type="text" value={formData.dynamicFields.local_advantage || ''} onChange={(e) => handleDynamicChange('local_advantage', e.target.value)} placeholder="e.g., 24/7 availability in downtown" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          {formData.category === 'education_coaching' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target Student</label>
                <input type="text" value={formData.dynamicFields.target_student || ''} onChange={(e) => handleDynamicChange('target_student', e.target.value)} placeholder="e.g., Mid-career professionals" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Core Promise</label>
                <input type="text" value={formData.dynamicFields.core_promise || ''} onChange={(e) => handleDynamicChange('core_promise', e.target.value)} placeholder="e.g., Land a dev job in 6 months" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          {formData.category === 'software_tech' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Software Function</label>
                <input type="text" value={formData.dynamicFields.software_function || ''} onChange={(e) => handleDynamicChange('software_function', e.target.value)} placeholder="e.g., AI-powered scheduling" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Problem Solved</label>
                <input type="text" value={formData.dynamicFields.problem_solved || ''} onChange={(e) => handleDynamicChange('problem_solved', e.target.value)} placeholder="e.g., Eliminates email ping-pong" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          {formData.category === 'creator_brand' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content Niche</label>
                <input type="text" value={formData.dynamicFields.content_niche || ''} onChange={(e) => handleDynamicChange('content_niche', e.target.value)} placeholder="e.g., Tech reviews & productivity" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Unique Angle</label>
                <input type="text" value={formData.dynamicFields.unique_angle || ''} onChange={(e) => handleDynamicChange('unique_angle', e.target.value)} placeholder="e.g., Minimalist aesthetic & honest opinions" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          {formData.category === 'other_custom' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Custom Industry Name <span className="text-destructive">*</span></label>
                <input type="text" value={formData.dynamicFields.custom_industry_name || ''} onChange={(e) => handleDynamicChange('custom_industry_name', e.target.value)} placeholder="e.g., Pet Grooming" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Standout Feature</label>
                <input type="text" value={formData.dynamicFields.standout_feature || ''} onChange={(e) => handleDynamicChange('standout_feature', e.target.value)} placeholder="e.g., Mobile van comes to you" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tone of Voice <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <textarea
              value={formData.toneOfVoice} onChange={(e) => updateForm({ toneOfVoice: e.target.value })}
              placeholder="e.g., Professional, witty, and highly educational."
              rows={3}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Section C: Visuals & Contact */}
        <div className="bg-muted/50 border border-border p-6 rounded-2xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Primary Colors <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <div className="flex flex-wrap gap-4">
              {formData.primaryColors.map((color: string, index: number) => (
                <div key={index} className="flex gap-2 items-center bg-input border border-border p-2 rounded-xl">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...formData.primaryColors];
                      newColors[index] = e.target.value;
                      updateForm({ primaryColors: newColors });
                    }}
                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                  />
                  <div className="px-2 font-mono text-xs text-muted-foreground">{color.toUpperCase()}</div>
                  {formData.primaryColors.length > 1 && (
                    <button
                      onClick={() => updateForm({ primaryColors: formData.primaryColors.filter((_: any, i: number) => i !== index) })}
                      className="text-muted-foreground hover:text-destructive transition-colors mr-1"
                      title="Remove Color"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => updateForm({ primaryColors: [...formData.primaryColors, '#ffffff'] })}
                className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors bg-background/50"
                title="Add Color"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm"
          >
            Add Contact Info & Address (Optional) <ChevronDown className={`w-4 h-4 transition-transform ${showContactInfo ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showContactInfo && (
              <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 24 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="overflow-hidden space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Email</label>
                  <input type="email" value={formData.contactEmail} onChange={(e) => updateForm({ contactEmail: e.target.value })} placeholder="support@workspace.com" className="w-full bg-input border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-ring text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                  <input type="text" value={formData.phoneNumber} onChange={(e) => updateForm({ phoneNumber: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full bg-input border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-ring text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Physical Address</label>
                  <textarea value={formData.physicalAddress} onChange={(e) => updateForm({ physicalAddress: e.target.value })} placeholder="123 Main St, City, Country" rows={2} className="w-full bg-input border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-ring text-sm outline-none resize-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center pt-8 border-t border-border bg-card/80 backdrop-blur-2xl absolute bottom-0 left-0 right-0 p-10 rounded-b-[2rem]">
        <div className="flex gap-6 items-center w-full">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2">Back</button>
          <div className="flex-1" />
          <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Skip</button>
          <button
            onClick={onNext}
            disabled={!isValid || isSubmitting}
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(88,61,255,0.3)] ml-4"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> Saving...</>
            ) : (
              <>Save & Continue <ChevronRight className="w-4 h-4 text-primary-foreground/70" /></>
            )}
          </button>
        </div>
      </div>

      {/* Spacer to push content above absolute footer */}
      <div className="h-14"></div>
    </motion.div>
  );
}

// --- Step 3 ---
function Step3Socials({ socials, setSocials, onFinish }: any) {
  const isAnyConnected = Object.values(socials).some(Boolean);

  const toggleSocial = (platform: keyof typeof socials) => {
    // Mock OAuth flow by just toggling state to green immediately
    setSocials((prev: typeof socials) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Connect your distribution channels.</h2>
        <p className="text-muted-foreground">Where do you want to publish your content? We use secure OAuth, meaning we never see your passwords.</p>
      </div>

      {/* Socials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SocialButton
          id="x" icon={<Twitter className="w-6 h-6" />} name="𝕏" connected={socials.x}
          onClick={() => toggleSocial("x")}
          baseColor="bg-black text-white hover:bg-zinc-900 border-zinc-800" text="Connect 𝕏"
        />
        <SocialButton
          id="linkedin" icon={<Linkedin className="w-6 h-6" />} name="LinkedIn" connected={socials.linkedin}
          onClick={() => toggleSocial("linkedin")}
          baseColor="bg-[#0A66C2] text-white hover:bg-[#004182] border-transparent" text="Connect LinkedIn"
        />
        <SocialButton
          id="pinterest" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z" /></svg>} name="Pinterest" connected={socials.pinterest}
          onClick={() => toggleSocial("pinterest")}
          baseColor="bg-[#E60023] text-white hover:bg-[#ad001a] border-transparent" text="Connect Pinterest"
        />
        <SocialButton
          id="instagram" icon={<Instagram className="w-6 h-6" />} name="Instagram" connected={socials.instagram}
          onClick={() => toggleSocial("instagram")}
          baseColor="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 border-transparent" text="Connect Instagram"
        />
      </div>

      <div className="bg-muted/50 border border-border rounded-xl p-4 flex gap-3 text-sm text-foreground/80 mt-2 mb-8">
        <Info className="w-5 h-5 shrink-0 text-blue-500" />
        <p>Note: Instagram requires you to have a Professional/Business account linked to a Facebook Page to use third-party publishing tools.</p>
      </div>

      <div className="mt-auto flex justify-between items-center pt-8 border-t border-border">
        <button onClick={onFinish} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Skip for now, I&apos;ll connect them later</button>
        <button
          onClick={onFinish}
          disabled={!isAnyConnected}
          className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(88,61,255,0.3)]"
        >
          Finish Setup & Go to Dashboard <ChevronRight className="w-4 h-4 text-primary-foreground/70" />
        </button>
      </div>
    </motion.div>
  );
}

function SocialButton({ id, icon, name, connected, onClick, baseColor, text }: any) {
  if (connected) {
    return (
      <button
        onClick={onClick}
        className="p-6 rounded-2xl border border-[#2e5e3b] bg-[#1a3a25] text-white flex items-center justify-between transition-all group relative overflow-hidden h-[90px]"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-[#2e5e3b] rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <div className="font-bold text-lg mb-0.5">✅ Connected</div>
            <div className="text-sm text-[#8fbc9f]">as @{name.toLowerCase()}_brand</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[#3a6b48] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <span className="font-bold">Disconnect</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl border ${baseColor} flex items-center gap-4 transition-all hover:-translate-y-1 shadow-sm h-[90px]`}
    >
      <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="font-bold text-lg">{text}</div>
    </button>
  );
}
