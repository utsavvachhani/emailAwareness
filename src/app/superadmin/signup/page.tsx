"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Superadmin accounts are pre-seeded — no public signup allowed.
export default function SuperadminSignupRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/superadmin/signin");
    }, [router]);
    return null;
}
