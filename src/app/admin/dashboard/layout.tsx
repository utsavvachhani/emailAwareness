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
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const id = params?.id as string;
    const { userInfo } = useAppSelector(s => s.auth);

    const navItems = [
        { label: "Dashboard", href: id ? `/admin/dashboard/${id}` : "/admin/dashboard", icon: LayoutDashboard },
        { label: "Companies", href: "/admin/dashboard/companies", icon: Building2 },
        { label: "Courses", href: "/admin/dashboard/courses", icon: BookOpen },
        { label: "Profile", href: "/admin/dashboard/profile", icon: User },
        { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ];

    const navItemsOnID = [
        { label: "Dashboard", href: id ? `/admin/dashboard/${id}` : "/admin/dashboard", icon: LayoutDashboard },
        { label: "Companies", href: "/admin/dashboard/companies", icon: Building2 },
        { label: "Employees", href: id ? `/admin/dashboard/${id}/employees` : "/admin/dashboard/employees", icon: Users },
        { label: "Bills", href: id ? `/admin/dashboard/${id}/bills` : "/admin/dashboard/bills", icon: CreditCard },
        { label: "Courses", href: id ? `/admin/dashboard/${id}/training` : "/admin/dashboard/training", icon: BookOpen },
        { label: "Profile", href: "/admin/dashboard/profile", icon: User },
        { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ];


    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
                method: "POST", credentials: "include",
            });
        } catch (_) { }
        dispatch(logout());
        toast.success("Signed out successfully");
        router.push("/");
    };

    const currentNavItems = id ? navItemsOnID : navItems;
    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "A";

    const crumbLabel = currentNavItems.find(n => n.href === pathname)?.label ||
        currentNavItems.find(n => pathname.startsWith(n.href) && n.href !== "/admin/dashboard")?.label ||
        "Dashboard";

    return (
        <AuthGuard requiredRole="admin">
            <div className="min-h-screen bg-background flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border">
                    <div className="flex h-full flex-col bg-black">
                        {/* Logo */}
                        <div className="flex h-20 items-center border-b border-white/10 px-6">
                            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-base font-bold text-white tracking-tight">CyberShield</span>
                                    <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Admin Hub</span>
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
                                {currentNavItems.map(item => {
                                    const isDashboard = item.label === "Dashboard";
                                    const isActive = isDashboard
                                        ? pathname === item.href
                                        : (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href)));
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive
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
                        <div className="mt-auto border-t border-white/10 p-4 bg-white/[0.02]">
                            <Link href="/admin/dashboard/profile" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all mb-3 group">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                                    <span className="text-sm font-bold text-blue-400">{initials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : "Admin User"}
                                    </p>
                                    <p className="text-[11px] text-white/40 truncate">{userInfo?.email || "admin@cybershield.com"}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500 transition-all border border-red-500/20 hover:border-red-500"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="ml-64 flex-1 flex flex-col min-h-screen">

                    {/* Topbar */}
                    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur">
                        <div className="flex h-full items-center justify-between px-6">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-8">
                                    <span>Admin</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                    <span className="text-foreground font-medium">{crumbLabel}</span>
                                </div>

                                {/* Quick Links */}
                                <nav className="hidden xl:flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
                                    {(id ? [
                                        { label: "Employees", href: `/admin/dashboard/${id}/employees` },
                                        { label: "Bills", href: `/admin/dashboard/${id}/bills` },
                                        { label: "Training", href: `/admin/dashboard/${id}/training` },
                                    ] : [
                                        { label: "Companies", href: "/admin/dashboard/companies" },
                                        { label: "Courses", href: "/admin/dashboard/courses" },
                                    ]).map(link => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${pathname === link.href
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Right */}
                            <div className="flex items-center gap-4">
                                <button className="relative w-10 h-10 flex items-center justify-center hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border">
                                    <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-500 border-2 border-background" />
                                </button>
                                <div className="h-6 w-px bg-border/60 mx-1" />
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
