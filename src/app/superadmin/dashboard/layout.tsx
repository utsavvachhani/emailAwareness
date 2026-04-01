"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell, Command, ChevronRight, LayoutDashboard, Building2, Users, CreditCard, Shield, Home, LogOut, BookOpen, User, Settings, Globe, Fish, FileText, Mail, Lock, BarChart3, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector(s => s.auth);

    // Drill-down IDs
    const adminId = params?.id as string;
    const companyId = params?.companyId as string;

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/logout`, {
                method: "POST", credentials: "include",
            });
        } catch (_) { }
        dispatch(logout());
        toast.success("Signed out successfully");
        router.push("/");
    };

    // Navigation Logic
    const baseNav = [
        { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
        { name: "Admin Approvals", href: "/superadmin/dashboard/admins", icon: ShieldCheck },
        { name: "Companies", href: "/superadmin/dashboard/companies", icon: Building2 },
        { name: "Courses", href: "/superadmin/dashboard/courses", icon: BookOpen },
        { name: "Employees", href: "/superadmin/dashboard/employees", icon: Users },
        { name: "Content", href: "/superadmin/dashboard/content", icon: FileText },
        { name: "Email Delivery", href: "/superadmin/dashboard/email-delivery", icon: Mail },
        { name: "Reports", href: "/superadmin/dashboard/reports", icon: BarChart3 },
        { name: "Phishing Sim", href: "/superadmin/dashboard/phishing", icon: Fish },
        { name: "Billing", href: "/superadmin/dashboard/billing", icon: CreditCard },
        { name: "Access Control", href: "/superadmin/dashboard/access", icon: Lock },
        { name: "Settings", href: "/superadmin/dashboard/settings", icon: Settings },
        { name: "Profile", href: "/superadmin/dashboard/profile", icon: User },
    ];

    const adminNav = [
        { name: "Global Dashboard", href: "/superadmin/dashboard", icon: Globe },
        { name: "Admin Overview",   href: `/superadmin/dashboard/admins/${adminId}`, icon: LayoutDashboard },
        { name: "Companies", href: `/superadmin/dashboard/admins/${adminId}/companies`, icon: Building2 },
        { name: "Back to Admins",   href: "/superadmin/dashboard/admins", icon: ArrowRight },
    ];

    const companyNav = [
        { name: "Admin Context",    href: `/superadmin/dashboard/admins/${adminId}`, icon: ArrowLeft },
        { name: "Company Dashboard",  href: `/superadmin/dashboard/admins/${adminId}/companies/${companyId}`, icon: LayoutDashboard },
        { name: "Employees",        href: `/superadmin/dashboard/admins/${adminId}/companies/${companyId}/employees`, icon: Users },
        { name: "Courses", href: `/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses`, icon: BookOpen },
        { name: "Billing", href: `/superadmin/dashboard/admins/${adminId}/companies/${companyId}/billing`, icon: CreditCard },
        { name: "Switch Entity",    href: `/superadmin/dashboard/admins/${adminId}/companies`, icon: Building2 },
    ];
    
    const currentNav = companyId ? companyNav : (adminId ? adminNav : baseNav);
    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "SA";

    return (
        <AuthGuard requiredRole="superadmin">
            <div className="min-h-screen bg-background flex text-foreground">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 print:hidden">
                    <div className="flex h-full flex-col bg-black">
                        {/* Logo */}
                        <div className="flex h-16 items-center border-b border-white/10 px-4">
                            <Link href="/superadmin/dashboard" className="flex items-center gap-2 group">
                                <div className="h-8 w-8 bg-white/10 rounded-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors overflow-hidden p-1.5">
                                    <img src="/logo.svg" alt="CyberShield Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="leading-tight">
                                    <span className="text-sm font-semibold text-white">CyberShield</span>
                                    <span className="block text-[9px] text-red-500 font-medium uppercase tracking-[0.2em]">Superadmin</span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            <ul className="space-y-1">
                                {currentNav.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                                        ? "bg-white text-black font-bold shadow-lg shadow-white/5"
                                                        : "text-white/50 hover:text-white hover:bg-white/5 font-medium"
                                                    }`}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-black" : "text-white/40"}`} />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3 px-2 py-3 mb-4">
                                <div className="h-9 w-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs font-black text-red-400">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{userInfo?.firstName} {userInfo?.lastName}</p>
                                    <p className="text-[10px] text-white/30 truncate">{userInfo?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500 transition-all border border-red-500/20 hover:border-red-500"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                SIGN OUT
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="pl-64 flex-1 flex flex-col min-h-screen print:pl-0">
                    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6 print:hidden">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Superadmin</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-foreground">{adminId ? 'Admin Context' : 'Global Dashboard'}</span>
                                {adminId && (
                                    <>
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="text-blue-600">Admin #[{adminId}]</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border group cursor-pointer hover:border-foreground transition-all">
                                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">QUICK SEARCH</span>
                                <div className="flex items-center gap-1 ml-2 text-[9px] text-muted-foreground opacity-50 font-mono">
                                    <Command className="h-2.5 w-2.5" /><span>K</span>
                                </div>
                            </div>
                            <div className="relative p-2 hover:bg-muted rounded-xl transition-colors">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                            </div>
                        </div>
                    </header>
                    <main className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}
