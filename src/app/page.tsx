"use client";

import Header from "@/components/superadmin/landing/Header";
import HeroSection from "@/components/superadmin/landing/HeroSection";
import ProblemSection from "@/components/superadmin/landing/ProblemSection";
import SolutionSection from "@/components/superadmin/landing/SolutionSection";
import HowItWorksSection from "@/components/superadmin/landing/HowItWorksSection";
import WhatEmployeesLearnSection from "@/components/superadmin/landing/WhatEmployeesLearnSection";
import BenefitsSection from "@/components/superadmin/landing/BenefitsSection";
import PricingSection from "@/components/superadmin/landing/PricingSection";
import WhyChooseUsSection from "@/components/superadmin/landing/WhyChooseUsSection";
import CTASection from "@/components/superadmin/landing/CTASection";
import Footer from "@/components/superadmin/landing/Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <HeroSection />
                <ProblemSection />
                <SolutionSection />
                <HowItWorksSection />
                <WhatEmployeesLearnSection />
                <BenefitsSection />
                <PricingSection />
                <WhyChooseUsSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
