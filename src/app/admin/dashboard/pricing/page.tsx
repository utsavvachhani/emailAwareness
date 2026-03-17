"use client";
import { CreditCard } from "lucide-react";

export default function AdminPricingPage() {
    const plans = [
        { name: "Starter", price: "₹999", period: "/ month", employees: "Up to 50", companies: "1 Company", highlight: false },
        { name: "Professional", price: "₹2,499", period: "/ month", employees: "Up to 250", companies: "5 Companies", highlight: true },
        { name: "Enterprise", price: "Custom", period: "", employees: "Unlimited", companies: "Unlimited", highlight: false },
    ];
    return (
        <div className="space-y-6">
            <div className="module-header">
                <div>
                    <h1 className="module-title">Pricing Plans</h1>
                    <p className="text-sm text-muted-foreground mt-1">Contact your Superadmin to upgrade or change your plan</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                {plans.map(p => (
                    <div key={p.name} className={`rounded-2xl border p-6 flex flex-col gap-4 ${p.highlight ? "border-blue-500 bg-blue-500/5" : "border-border bg-card"}`}>
                        {p.highlight && <span className="self-start text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">Most Popular</span>}
                        <div>
                            <h3 className="font-bold text-lg">{p.name}</h3>
                            <p className="text-3xl font-black mt-1">{p.price}<span className="text-sm font-normal text-muted-foreground">{p.period}</span></p>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ {p.employees}</li>
                            <li>✓ {p.companies}</li>
                            <li>✓ Email Awareness Training</li>
                            <li>✓ Phishing Simulations</li>
                        </ul>
                        <button className={`mt-auto py-2 rounded-lg font-medium text-sm transition-colors ${p.highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-border hover:bg-muted"}`}>
                            Contact Superadmin
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
