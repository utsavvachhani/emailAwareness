"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
            
            {/* Branded SVG Loader */}
            <div className="relative w-24 h-24 mb-6">
                {/* Outermost Pulse Ring */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0, 0.1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-blue-500/30"
                />
                
                {/* Scanning Circle */}
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-blue-500/10"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: [283, 0, 283] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Core Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ 
                            scale: [0.9, 1.1, 0.9],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ShieldAlert className="w-8 h-8 text-blue-600" />
                    </motion.div>
                </div>
            </div>

            {/* Diagnostic Text */}
            <div className="text-center space-y-1.5">
                <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/80"
                >
                    INITIALIZING TERMINAL
                </motion.h2>
                <div className="flex items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Synchronizing Identity Registries
                    </p>
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse [animation-delay:200ms]" />
                </div>
            </div>

            {/* Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#2563eb10_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
        </div>
    );
}

const ShieldAlert = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
    </svg>
);