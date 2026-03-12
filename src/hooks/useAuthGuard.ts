"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";

/**
 * Protects a route by checking Redux auth state.
 * @param requiredRole - The role that must match. If undefined, any authenticated user passes.
 * @param redirectTo   - Where to redirect if not authenticated / wrong role.
 */
export function useAuthGuard(requiredRole?: string, redirectTo?: string) {
    const router = useRouter();
    const { isAuthenticated, userInfo } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            const target = redirectTo ?? (
                requiredRole === "superadmin" ? "/superadmin/signin" :
                requiredRole === "admin"      ? "/admin/signin" :
                "/user/signin"
            );
            router.replace(target);
            return;
        }

        if (requiredRole && userInfo?.role !== requiredRole) {
            // Wrong role — redirect to their own dashboard
            const target =
                userInfo?.role === "superadmin" ? "/superadmin/dashboard" :
                userInfo?.role === "admin"       ? "/admin/dashboard" :
                "/user/dashboard";
            router.replace(target);
        }
    }, [isAuthenticated, userInfo, requiredRole, redirectTo, router]);

    return { isAuthenticated, userInfo };
}
