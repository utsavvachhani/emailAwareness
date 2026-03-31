"use client";

import { AlertCircle, XCircle } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const items = [
    {
        title: "Vulnerable Human Element",
        description: "Employees remain the #1 target for sophisticated cyber attacks and social engineering.",
    },
    {
        title: "Financial Hemorrhage",
        description: "Fake invoices and WhatsApp scams cause massive financial losses to businesses daily.",
    },
    {
        title: "Reputational Damage",
        description: "A single security breach can destroy years of hard-earned trust with your clients.",
    },
    {
        title: "Knowledge Decay",
        description: "Traditional annual training is forgotten within weeks. Real protection requires consistency.",
    },
];

const ProblemSection = () => {
    return (
        <section id="problem" className="section-padding bg-black relative border-y border-white/5">
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <AnimatedSection animation="slide-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] uppercase tracking-widest text-red-500 mb-6">
                            <AlertCircle className="w-3 h-3" />
                            Critical Risk
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                            Your biggest threat isn't <br />
                            <span className="text-white/40 italic">technical</span>
                        </h2>
                        <p className="text-lg text-white/40 mb-10 leading-relaxed">
                            Cybercriminals don't "hack" in anymore. They simply log in using stolen 
                            credentials or manipulate your team into making a single mistake.
                        </p>
                    </AnimatedSection>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <AnimatedSection key={index} animation="slide-right" delay={index * 100}>
                                <div className="group flex items-start gap-5 p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all duration-300">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <XCircle className="w-5 h-5 text-red-500" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">{item.title}</h3>
                                        <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
