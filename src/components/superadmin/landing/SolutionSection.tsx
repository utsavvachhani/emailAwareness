"use client";

import { Mail, BookOpen, Users, RefreshCw, CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const features = [
    {
        icon: Mail,
        title: "Weekly Micro-Lessons",
        description: "One focused, 2-minute lesson delivered straight to their preferred platform.",
    },
    {
        icon: BookOpen,
        title: "Real-World Scams",
        description: "Actual examples of phishing and social engineering seen in the wild.",
    },
    {
        icon: Users,
        title: "Human-Centric",
        description: "Zero technical jargon. We speak the language of your employees.",
    },
    {
        icon: RefreshCw,
        title: "Continuous Reinforcement",
        description: "Consistent exposure ensures security stays top-of-mind, year-round.",
    },
];

const SolutionSection = () => {
    return (
        <section className="section-padding bg-black relative">
            <div className="section-container">
                <AnimatedSection className="max-w-4xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/50 mb-6">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Our Solution
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Security awareness <br />
                        <span className="text-white/40 italic">on autopilot</span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
                        Say goodbye to boring annual training. Our bite-sized approach builds 
                        long-term security habits without disrupting your team's workflow.
                    </p>
                </AnimatedSection>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                        <AnimatedSection key={index} animation="scale-in" delay={index * 150}>
                            <div className="group flex items-start gap-6 p-8 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 transition-all duration-500 hover:border-white/10">
                                <div className="shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-white/40 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
