"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Building2, Users, FileText, Mail, BarChart3,
    Fish, CreditCard, Lock, Settings, User, LogOut, Home, ShieldCheck, BookOpen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { toast } from "sonner";

const navigation = [
    { name: "Dashboard",       href: "/superadmin/dashboard",               icon: LayoutDashboard },
    { name: "Admin Approvals", href: "/superadmin/dashboard/admins",        icon: ShieldCheck },
    { name: "Companies",       href: "/superadmin/dashboard/companies",     icon: Building2 },
    { name: "Courses",         href: "/superadmin/dashboard/courses",       icon: BookOpen },
    { name: "Employees",       href: "/superadmin/dashboard/employees",     icon: Users },
    { name: "Content",         href: "/superadmin/dashboard/content",       icon: FileText },
    { name: "Email Delivery",  href: "/superadmin/dashboard/email-delivery", icon: Mail },
    { name: "Reports",         href: "/superadmin/dashboard/reports",       icon: BarChart3 },
    { name: "Phishing Sim",    href: "/superadmin/dashboard/phishing",      icon: Fish },
    { name: "Billing",         href: "/superadmin/dashboard/billing",       icon: CreditCard },
    { name: "Access Control",  href: "/superadmin/dashboard/access",        icon: Lock },
    { name: "Settings",        href: "/superadmin/dashboard/settings",      icon: Settings },
    { name: "Profile",         href: "/superadmin/dashboard/profile",       icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/logout`, {
                method: "POST", credentials: "include",
            });
        } catch (_) {}
        dispatch(logout());
        toast.success("Signed out successfully");
        router.push("/");
    };

    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "SA";

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border">
            <div className="flex h-full flex-col bg-black">
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-white/10 rounded-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                            <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-white">CyberShield</span>
                            <span className="block text-[9px] text-red-400 font-medium uppercase tracking-widest">Superadmin</span>
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
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/superadmin/dashboard" && pathname.startsWith(item.href));
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                                            isActive
                                                ? "bg-white text-black font-medium"
                                                : "text-white/60 hover:text-white hover:bg-white/8"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User section + Logout */}
                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors mb-1">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-red-400">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                                {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : "Superadmin"}
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
    );
}
