"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell, Command } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="superadmin">
            <div className="min-h-screen bg-background">
                <Sidebar />
                <div className="pl-64">
                    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur">
                        <div className="flex h-full items-center justify-between px-6">
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search companies, employees, content..."
                                    className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Command className="h-3 w-3" /><span>K</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full">Superadmin</div>
                                <button className="relative p-2 hover:bg-secondary rounded-md transition-colors">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-foreground" />
                                </button>
                                <div className="h-6 w-px bg-border" />
                                <span className="text-xs text-muted-foreground font-mono">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </header>
                    <main className="p-6 animate-fade-in">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}
