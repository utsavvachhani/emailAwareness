"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
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
import { Loader2 } from "lucide-react";

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated, userInfo } = useAppSelector(state => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (isAuthenticated && userInfo) {
            const role = userInfo.role;
            if (role === "superadmin") {
                router.replace("/superadmin/dashboard");
            } else if (role === "admin") {
                router.replace("/admin/dashboard");
            } else if (role === "user") {
                router.replace("/user/dashboard");
            } else {
                setIsChecking(false);
            }
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, userInfo, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black selection:bg-white/30 selection:text-white">
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
