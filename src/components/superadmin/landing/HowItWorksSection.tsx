"use client";

import { UserPlus, Users, Mail, ClipboardCheck, FileText, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const steps = [
    {
        icon: UserPlus,
        title: "Company Onboarding",
        description: "Sign up your organization in minutes. No complex software installation or technical setup required.",
        color: "bg-blue-500",
    },
    {
        icon: Users,
        title: "Add Your Team",
        description: "Upload employee email addresses safely. We handle the rest, ensuring everyone is enrolled smoothly.",
        color: "bg-purple-500",
    },
    {
        icon: Mail,
        title: "Weekly Micro-Learning",
        description: "A 2-minute lesson arrives in their inbox weekly. No logins needed, just pure actionable knowledge.",
        color: "bg-emerald-500",
    },
    {
        icon: ClipboardCheck,
        title: "Knowledge Check",
        description: "A quick 3-question quiz follows each lesson, reinforcing memory and ensuring participation.",
        color: "bg-amber-500",
    },
    {
        icon: FileText,
        title: "Impact Reports",
        description: "Receive monthly analytics showing your company's risk reduction and employee progress.",
        color: "bg-red-500",
    },
];

const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="section-padding bg-[#050505] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="section-container relative z-10">
                <AnimatedSection className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Perfectly simple <span className="text-white/60">workflow</span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto">
                        Protecting your organization shouldn't be a full-time job. 
                        Our automated flow makes security awareness effortless.
                    </p>
                </AnimatedSection>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[45px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
                        {steps.map((step, index) => (
                            <AnimatedSection 
                                key={index} 
                                animation="fade-up" 
                                delay={index * 100}
                                className="relative group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Icon Container */}
                                    <div className="relative mb-8 transition-transform duration-500 group-hover:scale-110">
                                        <div className={`w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                                            {/* Inner Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <step.icon className="w-8 h-8 text-white relative z-10" strokeWidth={1.5} />
                                        </div>
                                        
                                        {/* Step Number Overlay */}
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center shadow-xl border-4 border-[#050505]">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-white/40 leading-relaxed max-w-[200px] mx-auto">
                                        {step.description}
                                    </p>
                                    
                                    {/* Indicator for mobile/md */}
                                    {index < steps.length - 1 && (
                                        <div className="lg:hidden mt-8 text-white/10">
                                            <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
                                        </div>
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>

                {/* Bottom Callout */}
                <AnimatedSection className="mt-24 p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center max-w-3xl mx-auto" delay={600}>
                    <p className="text-white/60 font-medium">
                        Total time required per week for your employees: <span className="text-white font-bold underline decoration-white/20 underline-offset-4">Under 3 Minutes</span>
                    </p>
                </AnimatedSection>
            </div>
        </section>
    );
};

export default HowItWorksSection;
