"use client";

import { User, Mail, Phone, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { toast } from "sonner";

const ContactFormSection = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        await new Promise(r => setTimeout(r, 1500));
        toast.success("Query Received!", {
            description: "Our security analyst will reach out to you within 24 hours.",
        });
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <section id="contact" className="section-padding bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-50 border-l border-zinc-200 hidden lg:block" />
            
            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
                    
                    {/* Left Side: Content */}
                    <AnimatedSection animation="slide-right" className="flex flex-col justify-center py-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-6">
                            Consultation Desk
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-zinc-900 mb-8 tracking-tighter italic uppercase leading-[0.9]">
                            Schedule a <br /><span className="text-zinc-400">Security Audit</span>
                        </h2>
                        <p className="text-lg text-zinc-500 max-w-xl font-medium leading-relaxed mb-12">
                            Ready to strengthen your enterprise defense? Provide your basic contact information and our core team will architect a tailored training curriculum for your workforce.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 bg-zinc-50 rounded-3xl border border-zinc-200">
                                <ShieldCheck className="w-6 h-6 text-zinc-900 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 mb-1">Confidential Inquiry</h4>
                                    <p className="text-xs text-zinc-400 font-medium">Your data is stored on encrypted enterprise nodes and never shared with third-party vendors.</p>
                                </div>
                            </div>
                            <div className="px-8 py-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Operations Global Hub</p>
                                <p className="text-sm font-bold text-zinc-900 italic">24/7 Digital Awareness Support</p>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Right Side: Form */}
                    <AnimatedSection animation="slide-left" className="lg:bg-white lg:p-12 lg:rounded-[3rem] lg:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.08)] lg:border lg:border-zinc-100">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Identity / Name</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Utsav Vachhani" 
                                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-2xl pl-14 pr-6 text-sm font-bold placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Work Email Protocol</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                                    <input 
                                        required
                                        type="email" 
                                        placeholder="admin@cybershield.in" 
                                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-2xl pl-14 pr-6 text-sm font-bold placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Digital Identity (Mobile)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                                    <input 
                                        required
                                        type="tel" 
                                        placeholder="+91 95126 559868" 
                                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-2xl pl-14 pr-6 text-sm font-bold placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Corporate Details / Message</label>
                                <div className="relative group">
                                    <MessageSquare className="absolute left-6 top-6 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                                    <textarea 
                                        placeholder="Describe your organization's security needs..." 
                                        rows={4}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 rounded-[1.5rem] bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-zinc-900/30 hover:bg-black transition-all group"
                            >
                                {loading ? "Encrypting Query..." : (
                                    <>
                                        Submit Intake Form
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

export default ContactFormSection;
