import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    subtitle: string;
    value: string | number;
    icon: LucideIcon;
    color: 'blue' | 'purple' | 'amber' | 'emerald';
    footer?: React.ReactNode;
    className?: string;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600',
        border: 'border-blue-500/20',
        hoverBg: 'group-hover:bg-blue-600',
        shadow: 'shadow-blue-500/20'
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600',
        border: 'border-purple-500/20',
        hoverBg: 'group-hover:bg-purple-600',
        shadow: 'shadow-purple-500/20'
    },
    amber: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/20',
        hoverBg: 'group-hover:bg-amber-600',
        shadow: 'shadow-amber-500/20'
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600',
        border: 'border-emerald-500/20',
        hoverBg: 'group-hover:bg-emerald-600',
        shadow: 'shadow-emerald-500/20',
    }
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
    title, subtitle, value, icon: Icon, color, footer, className = '' 
}) => {
    const colors = colorMap[color];

    return (
        <div className={`group bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} border ${colors.border} ${colors.hoverBg} group-hover:text-white transition-colors`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>{title}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{subtitle}</h3>
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
            {footer && <div className="mt-4">{footer}</div>}
        </div>
    );
};
