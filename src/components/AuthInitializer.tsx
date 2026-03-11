"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { hydrateAuth } from "@/lib/redux/authSlice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            dispatch(hydrateAuth());
            initialized.current = true;
        }
    }, [dispatch]);

    return <>{children}</>;
}
