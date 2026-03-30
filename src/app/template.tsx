"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ 
                    duration: 0.4, 
                    ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a weighted, professional feel
                    stiffness: 100 
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
