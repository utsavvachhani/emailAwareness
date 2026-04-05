"use client";

import Header from "@/components/superadmin/landing/Header";
import Footer from "@/components/superadmin/landing/Footer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="pt-32 pb-24">
                <div className="section-container max-w-4xl">
                    <AnimatedSection animation="fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-6">
                            <Shield className="w-3 h-3" />
                            Data Protection Protocol
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 mb-8 tracking-tighter italic uppercase leading-none">
                            Privacy <span className="text-zinc-400">Policy</span>
                        </h1>
                        <p className="text-lg text-zinc-500 font-medium mb-16 italic border-l-4 border-zinc-100 pl-8 transition-all hover:border-emerald-500">
                            Effective Date: April 03, 2026. Your privacy is our prime directive. This document outlines the architectural safeguards we employ to protect your enterprise data.
                        </p>
                    </AnimatedSection>

                    <div className="space-y-16">
                        <AnimatedSection delay={100}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <Eye className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">1. Information Collection</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        We collect information primarily provided by administrators during the registration of corporate entities and the subsequent sync of employee work identities (email addresses). This data is utilized solely for curriculum delivery and performance telemetry.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={200}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <Lock className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">2. Data Encryption & Storage</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        All enterprise data is processed using AES-256 encryption protocols on secure, distributed cloud nodes. We do not store sensitive passwords; all authentication is handled via industry-standard hashing mechanisms.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={300}>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">3. Zero-Sharing Policy</h2>
                                    <p className="text-zinc-500 leading-relaxed font-medium">
                                        CyberShield maintains a strict zero-sharing policy. Your enterprise telemetry and employee identities are never sold, rented, or leased to third-party advertising networks or external data vendors.
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={400} className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 mt-20">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4 italic">Security Inquiries</h3>
                            <p className="text-xs text-zinc-400 font-bold mb-6">
                                If you have questions regarding our architectural privacy safeguards, contact our Chief Information Security Officer:
                            </p>
                            <a href="mailto:vachhaniutsav2@gmail.com" className="text-sm font-black text-emerald-600 hover:underline">
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
