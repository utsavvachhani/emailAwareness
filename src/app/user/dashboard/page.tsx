"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { Shield, BookOpen, Target, CheckCircle, Clock, Star, Award, AlertTriangle, FileText, TrendingUp } from "lucide-react";

const modules = [
    { id: 1, title: "Phishing Awareness 101", category: "Phishing", duration: "45 min", progress: 100, score: 92, status: "completed", icon: "🎣", dueDate: "—" },
    { id: 2, title: "Password Security Best Practices", category: "Identity", duration: "30 min", progress: 75, score: null, status: "in-progress", icon: "🔑", dueDate: "Mar 15" },
    { id: 3, title: "Social Engineering Defense", category: "Social", duration: "60 min", progress: 0, score: null, status: "not-started", icon: "🎭", dueDate: "Mar 22" },
    { id: 4, title: "Safe Email Practices", category: "Email", duration: "40 min", progress: 0, score: null, status: "not-started", icon: "📧", dueDate: "Mar 29" },
];

const quizHistory = [
    { quiz: "Phishing Identification", score: 92, maxScore: 100, date: "Mar 8, 2026", pass: true },
    { quiz: "Spam Recognition", score: 78, maxScore: 100, date: "Feb 22, 2026", pass: true },
    { quiz: "Email Headers Analysis", score: 55, maxScore: 100, date: "Feb 10, 2026", pass: false },
];

const tips = [
    { emoji: "🎯", title: "Verify Before You Click", body: "Hover over links to see the real URL. If it looks suspicious, don't click — go directly to the site by typing the address." },
    { emoji: "🔐", title: "Use Strong, Unique Passwords", body: "Each account should have a different password. Use a password manager and enable 2FA wherever possible." },
    { emoji: "📎", title: "Be Wary of Attachments", body: "Never open unexpected attachments — even from known senders. Verify via a separate channel if uncertain." },
];

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
        "not-started": "bg-muted text-muted-foreground border-border",
    };
    const labels: Record<string, string> = { completed: "Completed", "in-progress": "In Progress", "not-started": "Not Started" };
    return (
        <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${map[status]}`}>
            {labels[status]}
        </span>
    );
};

export default function UserDashboardPage() {
    const { userInfo } = useAppSelector(s => s.auth);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, {userInfo?.firstName ?? "there"}! 👋
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Continue your cybersecurity awareness journey — you are making great progress.
                    </p>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-1 bg-background border border-border rounded-xl px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-3xl">
                        <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
                        82
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Security Score</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Modules Done", value: "1 / 4", icon: CheckCircle, color: "emerald" },
                    { label: "Training Hours", value: "3.5 h", icon: Clock, color: "blue" },
                    { label: "Quiz Avg Score", value: "75%", icon: Target, color: "purple" },
                    { label: "Certificates", value: "1", icon: Award, color: "yellow" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg bg-${s.color}-500/10 border border-${s.color}-500/20 shrink-0`}>
                                <Icon className={`w-4 h-4 text-${s.color}-500`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold leading-none">{s.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Training Modules Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <h2 className="font-semibold text-lg">Training Modules</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{modules.filter(m => m.status === "completed").length} of {modules.length} complete</span>
                </div>
                <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                        <tr>
                            {["Module", "Category", "Duration", "Progress", "Due", "Status", "Action"].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {modules.map(mod => (
                            <tr key={mod.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{mod.icon}</span>
                                        <div>
                                            <p className="font-medium text-sm">{mod.title}</p>
                                            {mod.score !== null && (
                                                <p className="text-xs text-muted-foreground">Score: {mod.score}%</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{mod.category}</span>
                                </td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{mod.duration}</td>
                                <td className="px-4 py-4 w-36">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${mod.progress === 100 ? "bg-emerald-500" : mod.progress > 0 ? "bg-blue-500" : "bg-muted-foreground/20"}`}
                                                style={{ width: `${mod.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">{mod.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{mod.dueDate}</td>
                                <td className="px-4 py-4"><StatusBadge status={mod.status} /></td>
                                <td className="px-4 py-4">
                                    {mod.status === "completed" ? (
                                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Review</button>
                                    ) : (
                                        <button className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            mod.status === "in-progress"
                                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20"
                                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                                        }`}>
                                            {mod.status === "in-progress" ? "Continue" : "Start"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom — Quiz History + Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz History */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <h2 className="font-semibold">Quiz History</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Quiz", "Score", "Date", "Result"].map(h => (
                                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {quizHistory.map(q => (
                                <tr key={q.quiz} className="hover:bg-muted/20">
                                    <td className="px-4 py-3 text-sm font-medium">{q.quiz}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${q.pass ? "bg-emerald-500" : "bg-red-400"}`} style={{ width: `${q.score}%` }} />
                                            </div>
                                            <span className="text-xs font-medium">{q.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{q.date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.pass ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
                                            {q.pass ? "✓ Pass" : "✗ Fail"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Security Tips */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold">Security Tips</h2>
                    </div>
                    <div className="divide-y divide-border">
                        {tips.map(tip => (
                            <div key={tip.title} className="px-6 py-4 hover:bg-muted/10 transition-colors">
                                <p className="text-sm font-semibold mb-1">{tip.emoji} {tip.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
