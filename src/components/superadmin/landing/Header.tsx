"use client";

import { Mail, Menu, X, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";

const dashboardPath: Record<string, string> = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  user: "/user/dashboard",
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      const role = userInfo?.role === 'superadmin' ? 'superadmin' : userInfo?.role === 'admin' ? 'admin' : 'users';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${role}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    dispatch(logout());
    router.push("/");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const userDashboard = dashboardPath[userInfo?.role ?? "user"] ?? "/user/dashboard";

  const roleColor: Record<string, string> = {
    superadmin: "text-red-400",
    admin: "text-blue-400",
    user: "text-emerald-400",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-md border border-white/30 bg-white/5 overflow-hidden p-1.5">
              <img src="/logo.svg" alt="CyberShield Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-semibold text-white">CyberShield Guard</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-white/70">
            <a href="#problem" className="text-sm font-medium hover:text-white transition-colors">Why It Matters</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-white transition-colors">How It Works</a>
            <a href="#benefits" className="text-sm font-medium hover:text-white transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm font-medium hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href={userDashboard}
                  className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-xs font-medium text-white">
                      {getInitials(userInfo?.firstName, userInfo?.lastName)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      {userInfo?.firstName} {userInfo?.lastName}
                    </span>
                    <span className={`text-[10px] font-medium capitalize ${roleColor[userInfo?.role ?? "user"]}`}>
                      {userInfo?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => router.push("/user/signin")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 font-semibold"
                  onClick={() => router.push("/user/signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-black">
            <nav className="flex flex-col gap-4 px-4">
              <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Why It Matters</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white transition-colors">How It Works</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Benefits</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Pricing</a>

              {isAuthenticated ? (
                <>
                  <Link
                    href={userDashboard}
                    className="flex items-center gap-2 text-sm font-medium text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-2 text-sm font-medium text-red-400"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-white border border-white/10"
                    onClick={() => { setMobileMenuOpen(false); router.push("/user/signin"); }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-white text-black font-semibold"
                    onClick={() => { setMobileMenuOpen(false); router.push("/user/signup"); }}
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Portal links for other roles */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Portals</p>
                <div className="flex gap-3">
                  <Link href="/admin/signin" onClick={() => setMobileMenuOpen(false)} className="text-xs text-white/50 hover:text-blue-400 transition-colors">Admin</Link>
                  <span className="text-white/20">·</span>
                  <Link href="/superadmin/signin" onClick={() => setMobileMenuOpen(false)} className="text-xs text-white/50 hover:text-red-400 transition-colors">Superadmin</Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
