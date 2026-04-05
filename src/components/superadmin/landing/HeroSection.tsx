"use client";

import { ArrowRight, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const HeroSection = () => {
    return (
        <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-black">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="section-container relative z-10 text-center">
                <AnimatedSection animation="fade-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-8 backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                        Trusted by 500+ Security Teams
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                        Bulletproof your <br />
                        <span className="text-white/40 italic">human firewall</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The world's simplest security awareness platform. No software, 
                        just effective 2-minute weekly micro-lessons delivered via email and WhatsApp.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-white/90 rounded-2xl text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95" asChild>
                            <a href="#contact">
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl text-base font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95" asChild>
                            <a href="#demo">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                See Digital Demo
                            </a>
                        </Button>
                    </div>

                    {/* Feature Grid (Micro) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-16 border-t border-white/5">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5">
                                <ShieldCheck className="w-5 h-5 text-white/60" />
                            </div>
                            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Compliance Ready</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5">
                                <Zap className="w-5 h-5 text-white/60" />
                            </div>
                            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Zero Setup</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5">
                                <ShieldCheck className="w-5 h-5 text-white/60" />
                            </div>
                            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">99% Engagement</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5">
                                <Zap className="w-5 h-5 text-white/60" />
                            </div>
                            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Global Reach</span>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
            
            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
        </section>
    );
};

export default HeroSection;
