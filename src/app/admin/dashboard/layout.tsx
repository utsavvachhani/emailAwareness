"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard, Building2, Users, CreditCard,
    Video, BookOpen, User, LogOut, Mail, Bell,
    Settings, Home, ChevronRight, Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const navItems = [
    { label: "Dashboard",       href: "/admin/dashboard",               icon: LayoutDashboard },
    { label: "Companies",       href: "/admin/dashboard/companies",     icon: Building2 },
    { label: "Employees",       href: "/admin/dashboard/employees",     icon: Users },
    { label: "Pricing",         href: "/admin/dashboard/pricing",       icon: CreditCard },
    { label: "Videos",          href: "/admin/dashboard/videos",        icon: Video },
    { label: "Training",        href: "/admin/dashboard/training",      icon: BookOpen },
    { label: "Profile",         href: "/admin/dashboard/profile",       icon: User },
    { label: "Settings",        href: "/admin/dashboard/settings",      icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { userInfo } = useAppSelector(s => s.auth);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
                method: "POST", credentials: "include",
            });
        } catch (_) {}
        dispatch(logout());
        toast.success("Signed out successfully");
        router.push("/");
    };

    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "A";

    const crumbLabel = navItems.find(n => n.href === pathname)?.label ||
        navItems.find(n => pathname.startsWith(n.href) && n.href !== "/admin/dashboard")?.label ||
        "Dashboard";

    return (
        <AuthGuard requiredRole="admin">
            <div className="min-h-screen bg-background flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border">
                    <div className="flex h-full flex-col bg-black">
                        {/* Logo */}
                        <div className="flex h-16 items-center border-b border-white/10 px-4">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="h-8 w-8 bg-blue-500/20 rounded-md flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-white">CyberShield</span>
                                    <span className="block text-[9px] text-blue-400 font-medium uppercase tracking-widest">Admin Portal</span>
                                </div>
                            </Link>
                        </div>

                        {/* Back to home */}
                        <div className="px-3 py-2 border-b border-white/5">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <Home className="h-3.5 w-3.5" />
                                Back to Home
                            </Link>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3">
                            <ul className="space-y-0.5">
                                {navItems.map(item => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                                                    isActive
                                                        ? "bg-blue-500 text-white font-medium"
                                                        : "text-white/60 hover:text-white hover:bg-white/8"
                                                }`}
                                            >
                                                <item.icon className="h-4 w-4 shrink-0" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* User section + Logout */}
                        <div className="border-t border-white/10 p-3">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors mb-1">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-blue-400">{initials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate">
                                        {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : "Admin"}
                                    </p>
                                    <p className="text-[10px] text-white/40 truncate">{userInfo?.email || ""}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="pl-64 flex-1 flex flex-col min-h-screen">
                    {/* Topbar */}
                    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur">
                        <div className="flex h-full items-center justify-between px-6">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <span>Admin</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span className="text-foreground font-medium">{crumbLabel}</span>
                            </div>
                            {/* Right */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                </span>
                                <button className="relative p-2 hover:bg-muted rounded-md transition-colors">
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
                                </button>
                                <div className="h-5 w-px bg-border" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <span className="text-xs font-bold text-blue-600">{initials}</span>
                                    </div>
                                    <div className="hidden sm:flex flex-col">
                                        <span className="text-xs font-semibold leading-none">{userInfo?.firstName} {userInfo?.lastName}</span>
                                        <span className="text-[10px] text-muted-foreground">{userInfo?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 animate-fade-in">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
