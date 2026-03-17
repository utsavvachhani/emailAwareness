"use client";
import { Video } from "lucide-react";

export default function AdminVideosPage() {
    return (
        <div className="space-y-6">
            <div className="module-header">
                <div>
                    <h1 className="module-title">Training Videos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Cybersecurity awareness videos for your employees</p>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Video className="w-14 h-14 mb-4 opacity-20" />
                <p className="font-medium text-base">Video library coming soon</p>
                <p className="text-sm mt-1">Your curated cybersecurity training videos will appear here</p>
            </div>
        </div>
    );
}
