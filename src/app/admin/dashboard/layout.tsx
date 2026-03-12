"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Home, Mail, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Employees", href: "/admin/dashboard/employees" },
    { label: "Reports", href: "/admin/dashboard/reports" },
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

    return (
        <AuthGuard requiredRole="admin">
            <div className="min-h-screen bg-background">
                {/* Top Nav */}
                <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur">
                    <div className="flex h-full items-center justify-between px-6 gap-4">
                        {/* Left: back + logo + nav */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-muted shrink-0"
                            >
                                <Home className="w-3.5 h-3.5" />
                                Home
                            </Link>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center">
                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <span className="font-semibold text-sm">Admin Portal</span>
                                <span className="text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full">Admin</span>
                            </div>
                            {/* Nav tabs */}
                            <nav className="hidden md:flex items-center gap-1">
                                {navItems.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            pathname === item.href
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Right: search + bell + user + logout */}
                        <div className="flex items-center gap-3">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground transition-colors"
                                />
                            </div>
                            <button className="relative p-2 hover:bg-muted rounded-md transition-colors">
                                <Bell className="w-4 h-4" />
                                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
                            </button>
                            <div className="flex items-center gap-2 pl-3 border-l border-border">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">{initials}</span>
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-semibold leading-none">{userInfo?.firstName} {userInfo?.lastName}</span>
                                    <span className="text-[10px] text-muted-foreground">{userInfo?.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors border border-border hover:border-red-500/30 hover:bg-red-500/5 rounded-lg px-3 py-1.5"
                                title="Sign out"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:block">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 px-6 py-3 text-xs text-muted-foreground border-b border-border bg-muted/20">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-medium">Admin Dashboard</span>
                </div>

                <main className="max-w-7xl mx-auto p-6">{children}</main>
            </div>
        </AuthGuard>
    );
}
