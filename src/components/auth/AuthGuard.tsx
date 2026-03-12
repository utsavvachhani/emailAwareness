"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { hydrateAuth } from "@/lib/redux/authSlice";
import { Loader2, Shield } from "lucide-react";

interface Props {
    requiredRole: "superadmin" | "admin" | "user";
    children: React.ReactNode;
}

const signinPath: Record<string, string> = {
    superadmin: "/superadmin/signin",
    admin: "/admin/signin",
    user: "/user/signin",
};

export function AuthGuard({ requiredRole, children }: Props) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, userInfo } = useAppSelector(state => state.auth);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Hydrate auth from localStorage on first render
        dispatch(hydrateAuth());
    }, [dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                router.replace(signinPath[requiredRole]);
                return;
            }
            if (userInfo?.role !== requiredRole) {
                // Redirect to their own dashboard
                const own = signinPath[userInfo?.role ?? "user"];
                router.replace(own);
                return;
            }
            setChecking(false);
        }, 100); // small debounce for hydration

        return () => clearTimeout(timer);
    }, [isAuthenticated, userInfo, requiredRole, router]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying access...</span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
