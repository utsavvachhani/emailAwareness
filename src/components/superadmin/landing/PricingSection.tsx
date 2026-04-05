"use client";

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useState } from "react";

import { PLANS } from "@/constant/biils/planes";

const PricingSection = () => {
    return (
        <section id="pricing" className="section-padding bg-black relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="section-container relative z-10">
                <AnimatedSection className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/50 mb-6">
                        <Zap className="w-3 h-3 text-white" />
                        Enterprise Protection Plans
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase">
                        Choose Your <span className="text-white/40">Cyber Tier</span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium">
                        Invest in your team's security awareness. Scaling protection for every enterprise size.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {PLANS.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <AnimatedSection
                                key={plan.key}
                                animation="fade-up"
                                delay={index * 150}
                            >
                                <div
                                    className={`relative h-full flex flex-col rounded-[2.5rem] border transition-all duration-500 p-10 group overflow-hidden ${plan.popular
                                            ? "bg-white border-white shadow-[0_0_80px_-15px_rgba(255,255,255,0.15)] scale-[1.05] z-10"
                                            : "bg-white/5 border-white/10 hover:border-white/30"
                                        }`}
                                >
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute top-8 right-8">
                                            <span className="bg-black text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em] shadow-lg">Popular Choice</span>
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="mb-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:rotate-12 ${plan.popular ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"}`}>
                                            <Icon className={`w-7 h-7 ${plan.popular ? "text-black" : "text-white"}`} />
                                        </div>
                                        <h3 className={`text-2xl font-black italic mb-2 tracking-tight ${plan.popular ? "text-black" : "text-white"}`}>
                                            {plan.name}
                                        </h3>
                                        <p className={`text-xs font-semibold mb-8 uppercase tracking-widest ${plan.popular ? "text-black/60" : "text-white/40"}`}>
                                            {plan.tagline}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-6xl font-black italic tracking-tighter ${plan.popular ? "text-black" : "text-white"}`}>
                                                {plan.priceLabel}
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-widest ml-1 ${plan.popular ? "text-black/40" : "text-white/30"}`}>
                                                / Month
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-12 flex-grow">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-4">
                                                <div className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${plan.popular ? "bg-black/10" : "bg-white/10"}`}>
                                                    <feature.icon className={`w-3 h-3 ${plan.popular ? "text-black" : "text-white"}`} />
                                                </div>
                                                <span className={`text-xs font-bold leading-tight uppercase tracking-tight ${plan.popular ? "text-black/80" : "text-white/70"}`}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Button
                                        asChild
                                        variant={plan.popular ? "default" : "outline"}
                                        className={`w-full py-7 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${plan.popular
                                                ? "bg-black text-white hover:bg-black/90 shadow-2xl hover:scale-[1.02]"
                                                : "bg-white text-black border-white hover:bg-white/90 hover:scale-[1.02]"
                                            }`}
                                    >
                                        <a href="#contact">Activate {plan.name}</a>
                                    </Button>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>

                <AnimatedSection className="mt-12 text-center" delay={600}>
                    <p className="text-sm text-white/30">
                        All plans include our core curriculum. Need something special?{" "}
                        <button className="underline text-white/50 hover:text-white transition-colors">Contact our team</button>.
                    </p>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default PricingSection;
