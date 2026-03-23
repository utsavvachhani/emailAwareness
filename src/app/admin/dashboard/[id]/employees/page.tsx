"use client";

import { useState, useEffect, use } from "react";
import {
  Users, Search, Loader2, UserPlus, Mail, Briefcase,
  Trash2, MoreVertical, ChevronLeft, Shield, UserCheck,
  Sparkles, Filter, MoreHorizontal, Activity
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation?: string;
  status: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

export default function CompanyEmployeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAppSelector(s => s.auth.token);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Employee Modal State
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    email: "",
    designation: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) fetchData();
  }, [token, id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [empRes, compRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/employees`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}`, { headers })
      ]);
      const empData = await empRes.json();
      const compData = await compRes.json();

      if (empData.success) setEmployees(empData.employees);
      if (compData.success) setCompany(compData.company);
    } catch (err) {
      toast.error("Failed to load workforce dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Personnel registry updated successfully");
        setEmployees([data.employee, ...employees]);
        setShowAddEmployee(false);
        setNewEmployee({ first_name: "", last_name: "", email: "", designation: "" });
      } else {
        toast.error(data.message || "Credential verification failed");
      }
    } catch {
      toast.error("Critical directory error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Entity Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/40 pb-10">
        <div className="space-y-4">
          <Link href={`/admin/dashboard/${id}`} className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground hover:text-primary mb-2 uppercase tracking-[0.2em] transition-all group">
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Active Session: {company?.name || "Client"} Overview
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-black text-white flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-105 transition-all">
              <Users className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic leading-none">{company?.name} Personnel</h1>
              <p className="text-xs text-muted-foreground font-bold flex items-center gap-2 mt-3 opacity-60 uppercase tracking-widest leading-none">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Surveillance active for {employees.length} managed accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
            <Input
              placeholder="Identify employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-14 rounded-2xl bg-white/50 border-border shadow-inner focus:bg-white transition-all text-sm font-medium"
            />
          </div>
          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 font-black px-8 text-xs uppercase tracking-widest">
                <UserPlus className="w-4.5 h-4.5 mr-3" />
                Issue New Seat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-[0_40px_100px_rgba(0,0,0,0.2)]">
              <DialogHeader className="bg-neutral-950 p-10 border-b border-white/5 text-left relative overflow-hidden">
                <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-primary opacity-10 animate-pulse" />
                <DialogTitle className="text-3xl font-black text-white italic tracking-tighter">Personnel Registry</DialogTitle>
                <DialogDescription className="text-xs pt-3 font-bold uppercase tracking-widest text-primary/60 italic leading-relaxed">
                  Register a new credential node for the internal cyber-defense curriculum at {company?.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="p-10 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Legacy Name</label>
                    <Input value={newEmployee.first_name} onChange={e => setNewEmployee(p => ({ ...p, first_name: e.target.value }))} required placeholder="John" className="h-14 rounded-2xl bg-muted/30 border-border focus:bg-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Ancestry Name</label>
                    <Input value={newEmployee.last_name} onChange={e => setNewEmployee(p => ({ ...p, last_name: e.target.value }))} required placeholder="Doe" className="h-14 rounded-2xl bg-muted/30 border-border focus:bg-white font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Communication Endpoint (Email)</label>
                  <Input type="email" value={newEmployee.email} onChange={e => setNewEmployee(p => ({ ...p, email: e.target.value }))} required placeholder="john@enterprise.com" className="h-14 rounded-2xl bg-muted/30 border-border focus:bg-white font-bold uppercase text-[10px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Operational Designation</label>
                  <Input value={newEmployee.designation} onChange={e => setNewEmployee(p => ({ ...p, designation: e.target.value }))} placeholder="Senior Project Intelligence" className="h-14 rounded-2xl bg-muted/30 border-border focus:bg-white font-black italic text-xs tracking-tight" />
                </div>
                <DialogFooter className="pt-8">
                  <Button disabled={isSubmitting} className="w-full rounded-2xl h-16 bg-primary hover:bg-primary/90 text-sm font-black italic tracking-tight shadow-2xl shadow-primary/20">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Shield className="w-5 h-5 mr-3" />}
                    INITIALIZE CREDENTIAL ACCESS
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* workforce metrics strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Onboarded Accounts", value: employees.length, icon: UserCheck, col: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Surveillance Active", value: employees.length, icon: Activity, col: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Analytics", value: "24", icon: Mail, col: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Defense Level", value: "88%", icon: Shield, col: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <Card key={i} className="rounded-3xl border-border/60 bg-card shadow-sm p-6 flex items-center gap-5 hover:bg-muted/10 transition-colors border-t border-t-transparent hover:border-t-primary/20">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.col} flex items-center justify-center shrink-0 border border-current/10 shadow-sm`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
              <p className="text-2xl font-black tracking-tight">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main workforce directory table */}
      <Card className="rounded-[3rem] border-border/60 shadow-2xl overflow-hidden bg-white/60 backdrop-blur-3xl border-r-[12px] border-r-primary/40">
        <CardHeader className="p-10 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-black italic tracking-tighter">Workforce Register</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-50 underline decoration-primary/20 underline-offset-4 decoration-2 italic">Segment identifier: {company?.name}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl h-11 border-border font-black text-[10px] uppercase tracking-widest px-6 shadow-sm">
              <Filter className="w-3.5 h-3.5 mr-2 opacity-40 font-bold" />
              Segment Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[450px]">
            <table className="w-full">
              <thead className="bg-muted/40 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                <tr>
                  <th className="px-10 py-7 text-left">Identity Node</th>
                  <th className="px-10 py-7 text-left">Credential Data</th>
                  <th className="px-10 py-7 text-left">Operational Role</th>
                  <th className="px-10 py-7 text-left">Access Status</th>
                  <th className="px-10 py-7 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-40 text-center opacity-40">
                      <div className="flex flex-col items-center gap-6">
                        <Users className="w-20 h-20 stroke-[0.5]" />
                        <p className="text-sm font-black italic tracking-[0.2em] uppercase">Null workforce segment identifier.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.map(emp => (
                  <tr key={emp.id} className="group hover:bg-primary/[0.02] transition-all">
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-[1rem] bg-neutral-900 text-white flex items-center justify-center text-[10px] font-black shadow-xl shadow-black/10 group-hover:scale-110 transition-transform border border-white/5">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black group-hover:text-primary transition-colors italic tracking-tight">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[10px] text-emerald-500/80 font-black uppercase flex items-center gap-1.5 opacity-80 group-hover:opacity-100 tracking-tighter">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            Node Online
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground lowercase underline decoration-border/40 underline-offset-4 group-hover:text-foreground group-hover:decoration-primary/30 group-hover:decoration-2 transition-all">
                        <Mail className="w-3.5 h-3.5 opacity-40" />
                        {emp.email}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant="outline" className="rounded-xl h-8 font-black border-border bg-white text-[9px] text-muted-foreground px-4 uppercase tracking-widest italic group-hover:border-primary/20 group-hover:text-primary transition-colors">
                        {emp.designation || "TEAM AGENT"}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase h-7 rounded-lg shadow-none px-3 tracking-widest">
                        FULL CURRICULUM ACCESS
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-primary/20">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="p-10 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            Synchronizing {filteredEmployees.length} identities with global defense network
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-2xl h-10 border-border font-black text-[9px] uppercase tracking-widest disabled:opacity-30 px-6 px-10" disabled>PREV SECTOR</Button>
            <Button variant="outline" size="sm" className="rounded-2xl h-10 border-border font-black text-[9px] uppercase tracking-widest disabled:opacity-30 px-6 px-10" disabled>NEXT SECTOR</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
