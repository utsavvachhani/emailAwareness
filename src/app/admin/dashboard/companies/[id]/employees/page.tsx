"use client";

import { useState, useEffect, use } from "react";
import {
  Users, Search, Loader2, UserPlus, Mail, Briefcase,
  Trash2, MoreVertical, ChevronLeft, Shield, UserCheck,
  Sparkles, Filter, MoreHorizontal
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
      toast.error("Failed to load data");
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
        toast.success("Employee added successfully");
        setEmployees([data.employee, ...employees]);
        setShowAddEmployee(false);
        setNewEmployee({ first_name: "", last_name: "", email: "", designation: "" });
      } else {
        toast.error(data.message || "Failed to add employee");
      }
    } catch {
      toast.error("An error occurred");
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div className="space-y-3">
          <Link href={`/admin/dashboard/companies/${id}`} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-1 uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to {company?.name || "Company"}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{company?.name}'s Workforce</h1>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                Managing {employees.length} active training licenses
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Find employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-muted/40 border-border shadow-sm focus:bg-background transition-all"
            />
          </div>
          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-11 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold px-6">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 pb-10 border-b border-border/40 text-left relative">
                <Sparkles className="absolute top-6 right-8 w-10 h-10 text-primary/20" />
                <DialogTitle className="text-3xl font-black">Register Employee</DialogTitle>
                <DialogDescription className="text-sm pt-2 font-medium italic">
                  Add a new learner to the CyberShield training program.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">First Name</label>
                    <Input value={newEmployee.first_name} onChange={e => setNewEmployee(p => ({ ...p, first_name: e.target.value }))} required placeholder="John" className="h-12 rounded-xl bg-muted/10 border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Last Name</label>
                    <Input value={newEmployee.last_name} onChange={e => setNewEmployee(p => ({ ...p, last_name: e.target.value }))} required placeholder="Doe" className="h-12 rounded-xl bg-muted/10 border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Personal Email</label>
                  <Input type="email" value={newEmployee.email} onChange={e => setNewEmployee(p => ({ ...p, email: e.target.value }))} required placeholder="john@company.com" className="h-12 rounded-xl bg-muted/10 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Job Designation</label>
                  <Input value={newEmployee.designation} onChange={e => setNewEmployee(p => ({ ...p, designation: e.target.value }))} placeholder="Senior Project Manager" className="h-12 rounded-xl bg-muted/10 border-border" />
                </div>
                <DialogFooter className="pt-6">
                  <Button disabled={isSubmitting} className="w-full rounded-xl h-14 bg-primary hover:bg-primary/90 text-sm font-black shadow-xl shadow-primary/20">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                    CONFIRM NEW REGISTRATION
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Onboarded", value: employees.length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Active Nodes", value: employees.length, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Tests", value: "24", icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Awareness", value: "88%", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        ].map((s, i) => (
          <Card key={i} className="rounded-2xl border-border bg-card shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{s.label}</p>
              <p className="text-xl font-black">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Table Content */}
      <Card className="rounded-[2.5rem] border-border/80 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-8 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black">Employee Directory</CardTitle>
            <CardDescription className="text-xs font-medium">Manage and monitor student engagement levels</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-border font-bold text-xs">
              <Filter className="w-3.5 h-3.5 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead className="bg-muted/40 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 text-left">Security Profile</th>
                  <th className="px-8 py-5 text-left">Contact Data</th>
                  <th className="px-8 py-5 text-left">Functional Role</th>
                  <th className="px-8 py-5 text-left">Network Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center opacity-40">
                      <div className="flex flex-col items-center gap-4">
                        <Users className="w-16 h-16 stroke-[1]" />
                        <p className="text-sm font-bold italic tracking-wider">Zero results in this segment.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.map(emp => (
                  <tr key={emp.id} className="group hover:bg-muted/20 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black group-hover:text-primary transition-colors">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Secure Connection
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-foreground/70">{emp.email}</td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="rounded-lg h-7 font-bold border-border/40 bg-muted/30 text-[10px] text-muted-foreground px-3">
                        {emp.designation || "Employee"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase h-6 rounded-md shadow-none px-2.5">
                        Active Licenses
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="p-8 border-t border-border/20 bg-muted/10 flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Showing {filteredEmployees.length} of {employees.length} records in total
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-border font-bold text-[10px] disabled:opacity-30" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-border font-bold text-[10px] disabled:opacity-30" disabled>Next Page</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
