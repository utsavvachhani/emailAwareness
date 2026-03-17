"use client";
import { Users, Search, Loader2 } from "lucide-react";

export default function AdminEmployeesPage() {
    return (
        <div className="space-y-6">
            <div className="module-header">
                <div>
                    <h1 className="module-title">Employees</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage employees across your companies</p>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Users className="w-14 h-14 mb-4 opacity-20" />
                <p className="font-medium text-base">Employee management coming soon</p>
                <p className="text-sm mt-1">Add companies first, then manage their employees here</p>
            </div>
        </div>
    );
}
