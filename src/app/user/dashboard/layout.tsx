"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Home, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { userInfo } = useAppSelector(s => s.auth);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
                method: "POST", credentials: "include",
            });
        } catch (_) {}
        dispatch(logout());
        toast.success("Signed out successfully");
        router.push("/");
    };

    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

    return (
        <AuthGuard requiredRole="user">
            <div className="min-h-screen bg-background">
                {/* Top Nav */}
                <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        {/* Back to home */}
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-muted"
                        >
                            <Home className="w-3.5 h-3.5" />
                            Home
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center">
                                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">CyberShield Guard</span>
                            <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                User
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <button className="relative p-2 hover:bg-muted rounded-md transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>
                        {/* User avatar + name */}
                        <div className="flex items-center gap-2 pl-3 border-l border-border">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-emerald-600">{initials}</span>
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs font-semibold leading-none">{userInfo?.firstName} {userInfo?.lastName}</span>
                                <span className="text-[10px] text-muted-foreground">{userInfo?.email}</span>
                            </div>
                        </div>
                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors border border-border hover:border-red-500/30 hover:bg-red-500/5 rounded-lg px-3 py-1.5"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:block">Sign Out</span>
                        </button>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto p-6">{children}</main>
            </div>
        </AuthGuard>
    );
}
