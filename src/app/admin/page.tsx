"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 animate-pulse">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Initiating Admin Context...</p>
            </div>
        </div>
    );
}
