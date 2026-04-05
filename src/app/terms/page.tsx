"use client";

import Header from "@/components/superadmin/landing/Header";
import Footer from "@/components/superadmin/landing/Footer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { Scale, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="pt-32 pb-24">
                <div className="section-container max-w-4xl">
                    <AnimatedSection animation="fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-6">
                            <Scale className="w-3 h-3" />
                            Master Service Agreement
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 mb-8 tracking-tighter italic uppercase leading-none">
                            Terms of <span className="text-zinc-400">Service</span>
                        </h1>
                        <p className="text-lg text-zinc-500 font-medium mb-16 italic border-l-4 border-zinc-100 pl-8 transition-all hover:border-blue-500">
                            Effective Date: April 03, 2026. This Agreement governs the architectural use of the CyberShield Awareness Platform by corporate entities.
                        </p>
                    </AnimatedSection>

                    <div className="space-y-16">
                        <AnimatedSection delay={100}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">1. License & Activation</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        Access to the platform is granted upon successful activation of a tiered plan (Basic, Standard, or Premium). Licenses are non-transferable and are tied to the registered enterprise entity for the duration of the billing cycle.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={200}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">2. Curriculum Integrity</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        All curriculum content delivered via CyberShield—including our Core Modules and any enterprise-curated assets—is protected by international copyright laws. Unauthorized reproduction or redistribution is strictly prohibited.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={300}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">3. Zero-Liability Clause</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        While our platform provides high-fidelity training strategies to reduce human error, CyberShield is not liable for data losses or breaches resulting from security incidents. Training is a mitigation strategy, not an absolute guarantee.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={400} className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 mt-20">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4 italic">Legal Inquiries</h3>
                            <p className="text-xs text-zinc-400 font-bold mb-6">
                                For inquiries regarding this Master Service Agreement or enterprise-specific licensing models:
                            </p>
                            <a href="mailto:vachhaniutsav2@gmail.com" className="text-sm font-black text-blue-600 hover:underline">
                                vachhaniutsav2@gmail.com
                            </a>
                        </AnimatedSection>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
