"use client";

import { Mail, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black backdrop-blur-sm border-b border-white/10">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-md border border-white">
              <Mail className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold text-white">CyberShield Guard</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-white/70">
            <a href="#problem" className="text-sm font-medium hover:text-white transition-colors">
              Why It Matters
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-white transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/superadmin/dashboard"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
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
                    <button
                      onClick={handleLogout}
                      className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-2.5 h-2.5" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => router.push("/superadmin/signin")}
                >
                  Sign In
                </Button>

                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => router.push("/superadmin/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-black">
            <nav className="flex flex-col gap-4 px-4">
              <a href="#problem" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Why It Matters
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Pricing
              </a>

              {isAuthenticated ? (
                <>
                  <Link href="/superadmin/dashboard" className="text-sm font-medium text-white">
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 flex items-center gap-2"
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
                    onClick={() => router.push("/superadmin/signin")}
                  >
                    Sign In
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 bg-white text-black"
                    onClick={() => router.push("/superadmin/signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
