"use client";
import { BookOpen } from "lucide-react";

const modules = [
    { title: "Phishing Awareness", duration: "12 min", level: "Beginner", badge: "bg-green-500/10 text-green-600" },
    { title: "Password Security", duration: "8 min", level: "Beginner", badge: "bg-green-500/10 text-green-600" },
    { title: "Social Engineering", duration: "15 min", level: "Intermediate", badge: "bg-blue-500/10 text-blue-600" },
    { title: "Data Protection & GDPR", duration: "20 min", level: "Intermediate", badge: "bg-blue-500/10 text-blue-600" },
    { title: "Incident Response", duration: "25 min", level: "Advanced", badge: "bg-purple-500/10 text-purple-600" },
];

export default function AdminTrainingPage() {
    return (
        <div className="space-y-6">
            <div className="module-header">
                <div>
                    <h1 className="module-title">Training Modules</h1>
                    <p className="text-sm text-muted-foreground mt-1">Assign cybersecurity training to your employees</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map(m => (
                    <div key={m.title} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-blue-500/40 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{m.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.duration}</p>
                        </div>
                        <span className={`self-start text-xs font-medium px-2.5 py-1 rounded-full ${m.badge}`}>{m.level}</span>
                        <button className="mt-auto text-xs font-medium text-blue-600 hover:underline">Assign to Employees →</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
