import React from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Plus, Globe } from 'lucide-react';

interface PortfolioTableProps {
    companies: any[];
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ companies }) => {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all hover:shadow-md h-full">
            <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight">Organization Portfolio</h2>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Registry Management</span>
                    </div>
                </div>
                <Link 
                    href="/admin/dashboard/companies" 
                    className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <div className="flex-1 overflow-x-auto min-h-[300px]">
                <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/10">
                        <tr>
                            <th className="px-6 py-4">Company Name</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-center">Headcount</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {companies?.map(c => (
                            <tr key={c.id} className="group hover:bg-muted/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-blue-600 group-hover:text-white transition-all scale-95 group-hover:scale-100">
                                            {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold group-hover:text-blue-600 transition-colors leading-none">{c.name}</p>
                                            <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter mt-1">{c.company_id || 'CYBER-DEF'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                                        c.plan === 'premium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                        c.plan === 'standard' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 
                                        'bg-blue-300/10 text-blue-600 border-blue-300/30'
                                    }`}>
                                        {c.plan || 'none'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-center font-black text-xs tracking-tighter text-foreground/80">
                                    {c.num_employees || 0}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link 
                                        href={`/admin/dashboard/${c.id}`} 
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-blue-600 hover:text-white transition-all text-muted-foreground/60 border border-transparent hover:shadow-lg hover:shadow-blue-500/20"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {!companies?.length && (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center text-muted-foreground animate-pulse">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-foreground">No companies found</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Onboard an organization to begin.</p>
                        </div>
                        <Link 
                            href="/admin/dashboard/companies" 
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
                        >
                            Create First Company <Plus className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
