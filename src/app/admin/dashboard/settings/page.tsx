"use client";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="module-header">
                <div>
                    <h1 className="module-title">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure your admin portal preferences</p>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Settings className="w-14 h-14 mb-4 opacity-20" />
                <p className="font-medium text-base">Settings coming soon</p>
                <p className="text-sm mt-1">Notification preferences and portal configurations will appear here</p>
            </div>
        </div>
    );
}
