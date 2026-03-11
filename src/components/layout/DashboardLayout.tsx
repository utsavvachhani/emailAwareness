"use client";
import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Search, Bell, Command } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/superadmin/signin");
      }
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem("token")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex h-full items-center justify-between px-6">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search companies, employees, content..."
                className="h-9 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-4 text-sm outline-none placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-white/40">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/5 rounded-md transition-colors">
                <Bell className="h-5 w-5 text-white/70" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white" />
              </button>
              <div className="h-6 w-px bg-white/10" />
              <span className="text-xs text-white/40 font-mono">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
