"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Mail,
  BarChart3,
  Fish,
  CreditCard,
  Shield,
  Settings,
  Lock,
  Home,
  LogOut,
  User,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Companies", href: "/superadmin/dashboard/companies", icon: Building2 },
  { name: "Employees", href: "/superadmin/dashboard/employees", icon: Users },
  { name: "Content", href: "/superadmin/dashboard/content", icon: FileText },
  { name: "Email Delivery", href: "/superadmin/dashboard/email-delivery", icon: Mail },
  { name: "Reports", href: "/superadmin/dashboard/reports", icon: BarChart3 },
  { name: "Phishing Sim", href: "/superadmin/dashboard/phishing", icon: Fish },
  { name: "Billing", href: "/superadmin/dashboard/billing", icon: CreditCard },
  { name: "Access Control", href: "/superadmin/dashboard/access", icon: Shield },
  { name: "Settings", href: "/superadmin/dashboard/settings", icon: Settings },
  { name: "Security", href: "/superadmin/dashboard/security", icon: Lock },
  { name: "Profile", href: "/superadmin/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/superadmin/signin");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col bg-black">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-sidebar-foreground rounded flex items-center justify-center">
              <Mail className="h-4 w-4 text-sidebar" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">
                EAMT
              </span>
              <span className="block text-[10px] text-sidebar-muted text-white uppercase tracking-wider">
                {userInfo?.role || "Super Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-xs font-medium text-sidebar-foreground">
                {getInitials(userInfo?.firstName, userInfo?.lastName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : "User"}
              </p>
              <p className="text-xs text-sidebar-muted text-white truncate">
                {userInfo?.email || "No email"}
              </p>
            </div>
            <button
              className="p-1.5 hover:bg-sidebar-accent group rounded transition-colors"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 text-white group-hover:text-black" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
