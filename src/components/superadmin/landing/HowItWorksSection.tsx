"use client";

import { UserPlus, Building2, CreditCard, BookOpen, Users, Award, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const steps = [
    {
        icon: UserPlus,
        title: "Admin Registration",
        description: "Initialize your master profile and gain access to the CyberShield Command Center in seconds.",
        color: "bg-blue-500",
    },
    {
        icon: Building2,
        title: "Activate Entity",
        description: "Register your company or organization into the global registry to begin centralized protection.",
        color: "bg-purple-500",
    },
    {
        icon: CreditCard,
        title: "Plan Selection",
        description: "Authorize your preferred protection tier and activate the billing cycle to unlock management tools.",
        color: "bg-emerald-500",
    },
    {
        icon: BookOpen,
        title: "Curriculum Design",
        description: "Deploy our core modules or architect your own custom courses tailored to your unique security risks.",
        color: "bg-amber-500",
    },
    {
        icon: Users,
        title: "Employee Sync",
        description: "Batch import your workforce. Our system automatically distributes training seats across your team.",
        color: "bg-red-500",
    },
    {
        icon: Award,
        title: "Graduation Hub",
        description: "Employees complete assessments and receive automated, verified certificates of curriculum mastery.",
        color: "bg-blue-600",
    },
];

const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="section-padding bg-[#050505] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="section-container relative z-10">
                <AnimatedSection className="text-center mb-20 px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/50 mb-6">
                        Operational Lifecycle
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase">
                        From Setup to <span className="text-white/40">Certfication</span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium">
                        Protecting your organization shouldn't be a full-time job. 
                        Our high-fidelity workflow makes security awareness effortless for both admins and employees.
                    </p>
                </AnimatedSection>

                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 relative">
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
