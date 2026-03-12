"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Superadmin has no OTP flow — redirect to signin.
export default function SuperadminOtpRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/superadmin/signin");
    }, [router]);
    return null;
}
