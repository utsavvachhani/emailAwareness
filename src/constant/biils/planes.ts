import {
    FileText,
    Users,
    BookOpen,
    FileCheck,
    BarChart3,
    ShieldCheck,
    Sparkles,
    Zap,
    Shield,
    Crown,
    Bell,
    Target,
    Trophy,     
    Mail,
    Layers
} from "lucide-react";

export const PLANS = [
    {
        key: "basic",
        name: "Basic Plan",
        price: 1499,
        priceLabel: "₹1,499",
        tagline: "Best for small teams",
        color: "emerald",
        icon: Zap,
        features: [
            { icon: Users, text: "Up to 30 Employees" },
            { icon: BookOpen, text: "Max 2 Courses" },
            { icon: FileText, text: "Each Course: 5 Modules (4 Docs + 1 Video)" },
            { icon: FileCheck, text: "1 Final Quiz per course" },
            { icon: BarChart3, text: "Basic Dashboard (Completion %)" },
            { icon: ShieldCheck, text: "1 Admin only" },
            { icon: Shield, text: "Private Company Access" },
        ],
    },
    {
        key: "standard",
        name: "Standard Plan",
        price: 2499,
        priceLabel: "₹2,499",
        tagline: "Best for growing companies",
        color: "blue",
        popular: true,
        icon: Sparkles,
        features: [
            { icon: Users, text: "Up to 75 Employees" },
            { icon: BookOpen, text: "Max 4 Courses" },
            { icon: FileText, text: "Each Course: 8 Modules (5 Docs + 3 Videos)" },
            { icon: FileCheck, text: "Quiz + Assignments" },
            { icon: BarChart3, text: "Advanced Dashboard" },
            { icon: ShieldCheck, text: "1 Admin only" },
            { icon: Mail, text: "Email Template Training Library" },
            { icon: Target, text: "Awareness Score Tracking" },
            { icon: Layers, text: "Employee-wise progress" },
        ],
    },
    {
        key: "premium",
        name: "Premium Plan",
        price: 3999,
        priceLabel: "₹3,999",
        tagline: "Best for serious cybersecurity training",
        color: "purple",
        icon: Crown,
        features: [
            { icon: Users, text: "Up to 120 Employees" },
            { icon: BookOpen, text: "Max 6 Courses" },
            { icon: FileText, text: "Each Course: 12 Modules (7 Docs + 5 Videos)" },
            { icon: FileCheck, text: "Quiz + Assignments + Scenario Tests" },
            { icon: BarChart3, text: "Full Analytics Dashboard" },
            { icon: Target, text: "Department-wise performance & Risk scoring" },
            { icon: ShieldCheck, text: "1 Admin only" },
            { icon: Zap, text: "Phishing Simulation" },
            { icon: Trophy, text: "Leaderboard & Gamification" },
            { icon: Bell, text: "Awareness Readiness Score" },
        ],
    },
];


export const PLAN_PRICE: Record<string, string> = {
    basic: "₹1,499",
    standard: "₹2,499",
    premium: "₹3,999",
};
export const PLAN_LABEL: Record<string, string> = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
};