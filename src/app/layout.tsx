import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CyberShield Guard - Enterprise Security Platform",
    description: "Protect your organization with Email Awareness Micro Training and advanced security monitoring.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <Toaster position="top-right" theme="dark" richColors />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
