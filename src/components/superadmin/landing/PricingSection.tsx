"use client";

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useState } from "react";

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(true);

    const tiers = [
        {
            name: "Starter",
            price: isYearly ? "₹3,999" : "₹4,999",
            period: "/month",
            highlight: "Up to 25 employees",
            popular: false,
            description: "Perfect for small teams getting started with security awareness.",
            features: [
                "Weekly awareness emails",
                "Real scam examples",
                "Basic quiz questions",
                "Monthly summary report",
                "Email support",
            ],
            cta: "Get Started",
        },
        {
            name: "Growth",
            price: isYearly ? "₹159" : "₹199",
            period: "/emp/month",
            highlight: "26–200 employees",
            popular: true,
            description: "Our most popular plan for scaling organizations.",
            features: [
                "Everything in Starter",
                "Custom branding",
                "Department-wise tracking",
                "Detailed analytics",
                "Priority support",
                "Quarterly review calls",
            ],
            cta: "Most Popular",
        },
        {
            name: "Enterprise",
            price: isYearly ? "₹319" : "₹399",
            period: "/emp/month",
            highlight: "200+ employees",
            popular: false,
            description: "For large organizations requiring custom features and support.",
            features: [
                "Everything in Growth",
                "Phishing simulations",
                "Advanced reporting",
                "Dedicated account manager",
                "Custom content options",
                "API integration",
            ],
            cta: "Contact Sales",
        },
    ];

    return (
        <section id="pricing" className="section-padding bg-black relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="section-container relative z-10">
                <AnimatedSection className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/50 mb-6">
                        <Zap className="w-3 h-3 text-white" />
                        Subscription Plans
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Choose the right <span className="text-white/60 italic">protection</span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto mb-10">
                        Invest in your team's security awareness. Simple pricing with no hidden fees.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm ${!isYearly ? "text-white" : "text-white/40"} transition-colors`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all focus:outline-none"
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${isYearly ? "translate-x-7" : "translate-x-0"}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm ${isYearly ? "text-white" : "text-white/40"} transition-colors`}>Yearly</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black leading-none">
                                -20%
                            </span>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, index) => (
                        <AnimatedSection
                            key={tier.name}
                            animation="fade-up"
                            delay={index * 150}
                        >
                            <div
                                className={`relative h-full flex flex-col rounded-2xl border transition-all duration-500 p-8 ${tier.popular
                                        ? "bg-white border-white shadow-[0_0_40px_-5px_rgba(255,255,255,0.2)]"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                    }`}
                            >
                                {/* Header */}
                                <div className="mb-8">
                                    <h3 className={`text-xl font-bold mb-2 ${tier.popular ? "text-black" : "text-white"}`}>
                                        {tier.name}
                                    </h3>
                                    <p className={`text-sm mb-6 ${tier.popular ? "text-black/60" : "text-white/40"}`}>
                                        {tier.description}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-bold ${tier.popular ? "text-black" : "text-white"}`}>
                                            {tier.price}
                                        </span>
                                        <span className={`text-sm ${tier.popular ? "text-black/50" : "text-white/40"}`}>
                                            {tier.period}
                                        </span>
                                    </div>
                                    <div className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${tier.popular ? "text-black/40" : "text-white/30"}`}>
                                        {tier.highlight}
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4 mb-10 flex-grow">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <div className={`mt-1 p-0.5 rounded-full ${tier.popular ? "bg-black/10" : "bg-white/10"}`}>
                                                <Check className={`w-3 h-3 ${tier.popular ? "text-black" : "text-white"}`} strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm font-medium ${tier.popular ? "text-black/80" : "text-white/70"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    variant={tier.popular ? "default" : "outline"}
                                    className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${tier.popular
                                            ? "bg-black text-white hover:bg-black/90 shadow-lg"
                                            : "bg-white text-black border-white hover:bg-white/90"
                                        }`}
                                >
                                    {tier.cta}
                                </Button>
                            </div>
                        </AnimatedSection>
                    ))}
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
