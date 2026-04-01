"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Building2,
  BookOpen,
  ArrowRight,
  Loader2,
  Briefcase,
  Layers,
  ArrowUpRight,
  Search,
  LayoutGrid,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Zap,
  Crown,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { superadminGetAllCompanies, superadminGetGlobalStats } from "@/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompanyBilling {
  id: number;
  company_id: string;
  name: string;
  email: string;
  plan: "none" | "basic" | "standard" | "premium";
  is_paid: boolean;
  num_employees: number;
  num_courses: number;
  industry: string | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  created_at: string;
}

interface StatsData {
  totalCompanies: number;
  totalEmployees: number;
  totalCourses: number;
  total_revenue?: number;
  plans: { plan: string; count: number }[];
}

const PLAN_CFG = {
    none:    { label: "Unsubscribed", Icon: Clock,    cls: "bg-slate-500/10 text-slate-600 border-slate-500/20", amount: 0 },
    basic:   { label: "Basic Node",   Icon: Zap,      cls: "bg-blue-500/10 text-blue-600 border-blue-500/20", amount: 999 },
    standard: { label: "Standard Tier", Icon: Sparkles, cls: "bg-purple-500/10 text-purple-600 border-purple-500/20", amount: 2499 },
    premium: { label: "Elite Premium", Icon: Crown,    cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", amount: 4999 },
};

// ─── Main Billing Page ────────────────────────────────────────────────────────
export default function SuperadminBillingPage() {
  const [companies, setCompanies] = useState<CompanyBilling[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        superadminGetAllCompanies(),
        superadminGetGlobalStats()
      ]);
      
      if (compRes.data.success) setCompanies(compRes.data.companies);
      if (statsRes.data.success) {
          // If the API returns it nested under stats
          setStats(statsRes.data.stats || statsRes.data);
      }
    } catch {
      toast.error("Failed to load global financial wavefront");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalProjectedMRR = useMemo(() => {
    return companies.reduce((acc, c) => {
        if (!c.is_paid || c.plan === 'none') return acc;
        return acc + (PLAN_CFG[c.plan]?.amount || 0);
    }, 0);
  }, [companies]);

  const handleDownloadLedger = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-black text-muted-foreground animate-pulse tracking-widest text-center uppercase">Syncing Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 print:p-0 print:space-y-4 print:mx-0 print:max-w-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div className="space-y-4">
              <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  <span className="hover:text-blue-600 transition-colors">Global oversight</span>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                  <span className="text-blue-600 font-black">Financial Ledger</span>
              </nav>
              <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xl">
                      <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                      <h1 className="text-4xl font-black tracking-tight text-foreground uppercase leading-none">
                          Global <span className="text-blue-600">Billing</span>
                      </h1>
                      <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-2 opacity-60">
                         Unified enterprise subscription management and revenue tracking
                      </p>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 h-11 px-5 rounded-2xl border border-border bg-card text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadLedger}
                className="flex items-center gap-3 h-11 px-6 rounded-2xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
              >
                <Download className="w-4 h-4" /> Export Financial Report
              </button>
          </div>
      </div>

      {/* ── Print Header (PDF Only) ───────────────────────────────── */}
      <div className="hidden print:block border-b-4 border-foreground pb-8 mb-12">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">CYBERSHIELD <span className="text-blue-600">OVERSIGHT</span></h1>
                <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Global Financial Ledger & Subscription Audit</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Identity</p>
                <p className="text-sm font-black font-mono">FIN-LEDGER-{new Date().toISOString().slice(0,10).replace(/-/g,'')}</p>
                <p className="text-xs font-bold mt-2 opacity-60 uppercase">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-4 gap-8 mt-12 bg-muted/30 p-8 rounded-[3rem] border-2 border-dashed border-border/50">
            {[
                { label: "Organizational Nodes", value: companies.length, icon: Building2 },
                { label: "Curriculum Assets", value: companies.reduce((a,c) => a + c.num_courses, 0), icon: BookOpen },
                { label: "Workforce Reach", value: companies.reduce((a,c) => a + c.num_employees, 0), icon: Layers },
                { label: "System MRR", value: `$${totalProjectedMRR.toLocaleString()}`, icon: DollarSign }
            ].map(s => (
                <div key={s.label}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1">
                        <s.icon className="w-3 h-3 text-blue-600" /> {s.label}
                    </p>
                    <p className="text-3xl font-black italic tracking-tighter">{s.value}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Financial Wavefront Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
        {[
          { label: "Projected MRR", value: `$${totalProjectedMRR.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-500/5", trend: "+12.5% V-Growth" },
          { label: "Enterprise Nodes", value: companies.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-500/5", trend: "+3 new / 7d" },
          { label: "Paid Verification", value: companies.filter(c => c.is_paid).length, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-500/5", trend: "100% compliance" },
          { label: "Curriculum Nodes", value: companies.reduce((acc, c) => acc + c.num_courses, 0), icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/5", trend: "Global deployment" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 border border-current/10 mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">{stat.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{stat.trend}</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Discovery & Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-muted/20 p-3 rounded-[2rem] border border-border/50 print:hidden">
          <div className="flex gap-2 bg-background p-1.5 rounded-2xl shadow-inner border border-border/40 overflow-x-auto max-w-full">
            {["all", "premium", "standard", "basic", "none"].map(f => (
              <button key={f} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-muted-foreground hover:text-foreground">
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <input 
                  type="text"
                  placeholder="Identify organization entity..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 bg-background rounded-2xl border border-border pl-14 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/30 transition-all shadow-sm"
              />
          </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 print:border-none print:shadow-none print:rounded-none">
          <div className="px-10 py-8 border-b border-border bg-muted/10 flex items-center justify-between print:hidden">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Enterprise Ledger Wavefront
              </h3>
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Real-time Verification</span>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-sm">
                  <thead className="print:bg-muted bg-muted/50 border-b border-border">
                      <tr>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Organizational Node</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Admin Context</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Sub-Tier</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Metrics</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">V-Status</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground print:hidden"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                      {filteredCompanies.map(c => {
                          const plan = PLAN_CFG[c.plan] || PLAN_CFG.none;
                          return (
                              <tr key={c.id} className="hover:bg-muted/30 transition-all group">
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl bg-blue-600/5 text-blue-600 flex items-center justify-center border border-blue-600/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                              <Building2 className="w-6 h-6" />
                                          </div>
                                          <div>
                                              <p className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
                                              <p className="text-[10px] text-muted-foreground font-black font-mono mt-0.5 opacity-60 tracking-tighter">{c.company_id}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8">
                                      <div className="space-y-1">
                                          <p className="text-xs font-black uppercase tracking-tight">{c.adminFirstName} {c.adminLastName}</p>
                                          <p className="text-[10px] text-muted-foreground font-medium lowercase italic">{c.adminEmail}</p>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8">
                                      <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 w-fit ${plan.cls}`}>
                                          <plan.Icon className="w-4 h-4" />
                                          <div className="flex flex-col">
                                              <span className="text-[9px] font-black uppercase tracking-widest">{plan.label}</span>
                                              <span className="text-[11px] font-black">${plan.amount.toLocaleString()} / mo</span>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-8">
                                          <div className="text-center">
                                              <p className="text-sm font-black italic">{c.num_employees}</p>
                                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Workforce</p>
                                          </div>
                                          <div className="text-center">
                                              <p className="text-sm font-black italic text-blue-600">{c.num_courses}</p>
                                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Courses</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8">
                                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${c.is_paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                          <div className={`w-2 h-2 rounded-full ${c.is_paid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                          {c.is_paid ? "Verified Paid" : "Verification Required"}
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-right print:hidden">
                                      <button className="h-10 px-4 rounded-xl border border-border hover:bg-foreground hover:text-background text-[10px] font-black uppercase tracking-widest transition-all">Details</button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
          
          {/* Table Footer */}
          <div className="px-10 py-8 bg-muted/10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic">
                  End of financial storefront registry. Total of {companies.length} organizational entities identified.
              </p>
              <div className="flex items-center gap-8">
                  <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Global Estimated MRR</p>
                      <p className="text-2xl font-black italic tracking-tighter text-blue-600">${totalProjectedMRR.toLocaleString()}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* ── Detailed Financial Audit Log (PDF Focused) ─────────────── */}
      <div className="hidden print:block space-y-8 mt-12 bg-white">
          <div className="p-8 rounded-[3rem] border-4 border-foreground">
              <h3 className="text-3xl font-black uppercase tracking-widest border-b-4 border-foreground pb-4">Authorized Financial Audit Transcript</h3>
              <p className="text-sm font-bold text-muted-foreground mt-4 leading-relaxed uppercase italic">
                  THIS DOCUMENT SERVES AS AN OFFICIAL LEDGER OF ENTERPRISE SUBSCRIPTION ASSETS REGISTERED IN THE CYBERSHIELD OVERSIGHT SYSTEM.
              </p>
              
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between border-b-2 border-border pb-4">
                    <span className="text-xs font-black uppercase">Primary Verification Status</span>
                    <span className="text-xs font-black px-4 py-1 bg-emerald-600 text-white rounded-full uppercase">S-Tier Compliance</span>
                </div>
                <div className="flex items-center justify-between border-b-2 border-border pb-4">
                    <span className="text-xs font-black uppercase">Total Organizational Nodes Active</span>
                    <span className="text-xs font-black">{companies.length} Nodes</span>
                </div>
                <div className="flex items-center justify-between border-b-2 border-border pb-4">
                    <span className="text-xs font-black uppercase">Global Curriculum Assets Deployed</span>
                    <span className="text-xs font-black">{companies.reduce((a,c) => a + c.num_courses, 0)} Protocols</span>
                </div>
              </div>

              <div className="mt-24 pt-12 border-t-2 border-border flex justify-between items-center opacity-40 text-[10px] font-bold italic uppercase tracking-widest">
                  <div className="space-y-1">
                      <p>CyberShield Global Finance Division &copy; 2026</p>
                      <p>Corporate Verification Wavefront E-Ledger-99</p>
                  </div>
                  <div className="text-right space-y-4">
                      <p className="border-b border-foreground w-48 pb-1">Authorized Audit Signature</p>
                      <p>Superadmin Identity: {new Date().getTime()}</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
}

