"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Global Fetch Interceptor
    useEffect(() => {
        const originalFetch = window.fetch;
        let activeRequests = 0;

        window.fetch = async (...args) => {
            activeRequests++;
            setIsLoading(true);
            setProgress(30); // Immediate jump to 30%

            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                activeRequests--;
                if (activeRequests === 0) {
                    setProgress(100);
                    setTimeout(() => {
                        setIsLoading(false);
                        setProgress(0);
                    }, 500); // Wait for finish animation
                }
            }
        };

        // Navigation Sync: URL changes also pulse the bar
        setIsLoading(true);
        setProgress(60);
        const navTimer = setTimeout(() => {
            if (activeRequests === 0) {
                setProgress(100);
                setTimeout(() => setIsLoading(false), 400);
            }
        }, 600);

        return () => {
            window.fetch = originalFetch;
            clearTimeout(navTimer);
        };
    }, [pathname, searchParams]);

    // Simulated progress trickle while loading
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading && progress < 90) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + (90 - prev) * 0.1; // Slow down as it reaches 90%
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isLoading, progress]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
                >
                    {/* The Progress Bar */}
                    <motion.div
                        className="h-[2px] bg-blue-600 shadow-[0_0_15px_#2563eb]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ 
                            duration: progress === 100 ? 0.3 : 0.6, 
                            ease: progress === 100 ? "easeIn" : "easeOut" 
                        }}
                    />
                    
                    {/* Glow and Pulse Effect at the tip */}
                    <motion.div 
                        animate={{ 
                            opacity: [0.6, 1, 0.6],
                            scale: [0.95, 1.05, 0.95]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-0 right-[calc(100%-var(--progress-val))] h-full w-32 bg-gradient-to-l from-blue-600/80 to-transparent blur-md"
                        style={{ right: `${100 - progress}%` } as any}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
