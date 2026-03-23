"use client";

import { useState, useEffect, use } from "react";
import { 
  Building2, Users, BookOpen, BarChart3, Plus, 
  Search, Mail, Phone, MapPin, Briefcase, 
  ChevronLeft, Loader2, CheckCircle2, MoreVertical,
  Trash2, UserPlus, FileText, Share2, Globe, ExternalLink,
  Clock, Award, Activity
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";

// Shadcn UI (assuming they exist based on list_dir)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

interface Company {
  id: number;
  company_id: string;
  name: string;
  email: string;
  phone?: string;
  num_employees: number;
  industry?: string;
  website?: string;
  address?: string;
  notes?: string;
  status: 'approved' | 'rejected' | 'pending';
  created_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation?: string;
  status: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  assigned_at: string;
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAppSelector(s => s.auth.token);
  
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      
      // Fetch everything in parallel
      const [compRes, empRes, courseRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/employees`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/courses`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/stats`, { headers })
      ]);

      const [compData, empData, courseData, statsData] = await Promise.all([
        compRes.json(), empRes.json(), courseRes.json(), statsRes.json()
      ]);

      if (compData.success) setCompany(compData.company);
      if (empData.success) setEmployees(empData.employees);
      if (courseData.success) setCourses(courseData.courses);
      if (statsData.success) setStats(statsData.stats);

    } catch (err) {
      toast.error("Failed to load company data");
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
        // Refresh stats
        fetchData();
      } else {
        toast.error(data.message || "Failed to add employee");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Company not found</h2>
        <Link href="/admin/dashboard/companies" className="text-primary hover:underline mt-4 block italic">
          Go back to companies list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/admin/dashboard/companies" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-3 transition-colors">
            <ChevronLeft className="w-3 h-3" />
            Back to Companies
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shadow-sm shadow-primary/10">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.name}</h1>
                <Badge className={`rounded-full px-3 py-0.5 border-none font-semibold ${
                  company.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                  company.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {company.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border/50 uppercase">{company.company_id}</span>
                <span className="opacity-40">•</span>
                {company.industry || "General Industry"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 border-border/60 hover:bg-muted/50 transition-all font-medium">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button className="rounded-xl h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all font-bold px-6">
            <Activity className="w-4 h-4 mr-2" />
            Launch Program
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-white/80 uppercase tracking-widest">Total Employees</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.totalEmployees || 0}</h3>
            </div>
            <Users className="w-5 h-5 text-white/60" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-white/70">
            <span className="bg-white/20 px-1.5 py-0.5 rounded">+12% from last month</span>
          </div>
        </Card>

        <Card className="rounded-2xl border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-white/80 uppercase tracking-widest">Courses Assigned</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.assignedCourses || 0}</h3>
            </div>
            <BookOpen className="w-5 h-5 text-white/60" />
          </div>
          <CardDescription className="text-white/70 text-[10px] mt-4 font-medium italic">
            Active in current training cycle
          </CardDescription>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Completion Rate</p>
              <h3 className="text-3xl font-bold mt-2">68%</h3>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="mt-4 w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }} />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Security Score</p>
              <h3 className="text-3xl font-bold mt-2 text-primary">A-</h3>
            </div>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-medium">Risk level: <span className="text-emerald-500 font-bold uppercase tracking-tight text-[10px]">Very Low</span></p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-background rounded-3xl border border-border/60 shadow-2xl p-6 md:p-8">
        <TabsList className="bg-muted/50 p-1.5 mb-8 h-12 w-fit rounded-2xl border border-border/40">
          <TabsTrigger value="overview" className="px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-semibold transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees" className="px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-semibold transition-all">
            Employees
          </TabsTrigger>
          <TabsTrigger value="courses" className="px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-semibold transition-all">
            Courses
          </TabsTrigger>
          <TabsTrigger value="reports" className="px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-semibold transition-all">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official Email</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary/70" />
                        {company.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary/70" />
                        {company.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Website</p>
                      <a href={company.website} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {company.website || "No website"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary/70" />
                        {company.address || "No address"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Notes & Description
                </h3>
                <div className="bg-muted/20 p-6 rounded-2xl border border-border/40 min-h-[120px]">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {company.notes || "No additional notes or description provided for this company."}
                  </p>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-lg shadow-black/5">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-base font-bold">Registration Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-xs text-muted-foreground">Registered At</span>
                    <span className="text-xs font-bold">{new Date(company.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-xs text-muted-foreground">Admin Status</span>
                    <Badge variant="outline" className="text-[10px] h-5 uppercase font-bold text-primary border-primary/20 bg-primary/5">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-muted-foreground">Max Capacity</span>
                    <span className="text-xs font-bold">{company.num_employees || 0} Employees</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/5 to-transparent shadow-md overflow-hidden p-6 border-l-4 border-l-primary">
                <h4 className="font-bold text-sm mb-2">Need Assistance?</h4>
                <p className="text-xs text-muted-foreground mb-4">Our support team is available 24/7 for any technical queries regarding company management.</p>
                <Button size="sm" variant="outline" className="w-full text-xs font-bold rounded-xl h-9 border-primary/20 hover:bg-primary/10 text-primary">Contact Support</Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search employee name or email..." className="pl-10 h-10 rounded-xl bg-muted/40 border-border/60 focus:bg-background transition-all" />
            </div>
            
            <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-10 shadow-lg shadow-primary/10 font-bold px-6">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="bg-gradient-to-br from-primary/10 to-transparent p-6 pb-8 border-b border-border/40 text-left">
                  <DialogTitle className="text-2xl font-bold">New Employee</DialogTitle>
                  <DialogDescription className="text-sm pt-1">
                    Add a new member to {company.name}'s training program.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">First Name</label>
                      <Input 
                        value={newEmployee.first_name} 
                        onChange={e => setNewEmployee(p => ({...p, first_name: e.target.value}))}
                        required 
                        placeholder="John" 
                        className="rounded-xl h-11 border-border/60 bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Last Name</label>
                      <Input 
                        value={newEmployee.last_name} 
                        onChange={e => setNewEmployee(p => ({...p, last_name: e.target.value}))}
                        required 
                        placeholder="Doe" 
                        className="rounded-xl h-11 border-border/60 bg-muted/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Email Address</label>
                    <Input 
                      type="email" 
                      value={newEmployee.email} 
                      onChange={e => setNewEmployee(p => ({...p, email: e.target.value}))}
                      required 
                      placeholder="john.doe@email.com" 
                      className="rounded-xl h-11 border-border/60 bg-muted/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Designation</label>
                    <Input 
                      value={newEmployee.designation} 
                      onChange={e => setNewEmployee(p => ({...p, designation: e.target.value}))}
                      placeholder="Software Engineer" 
                      className="rounded-xl h-11 border-border/60 bg-muted/20"
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-12 font-bold bg-primary hover:bg-primary/90 text-sm">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Confirm Addition
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Employee Name</th>
                    <th className="px-6 py-4 text-left">Email Address</th>
                    <th className="px-6 py-4 text-left">Designation</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <Users className="w-10 h-10" />
                          <p className="text-sm font-medium">No employees registered yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <span className="text-sm font-bold text-foreground">{emp.first_name} {emp.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{emp.email}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground/80">{emp.designation || "—"}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] h-5 rounded-md px-2 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-bold uppercase tracking-tight">Active</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold">Training Curriculum</h3>
              <p className="text-sm text-muted-foreground">Manage and track security courses assigned to this company.</p>
            </div>
            <Button variant="outline" className="rounded-xl h-10 font-bold border-border shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Assign New Course
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border/80">
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <BookOpen className="w-12 h-12" />
                  <p className="font-bold">No courses assigned to this company yet.</p>
                  <Button size="sm" variant="link" className="text-primary font-bold">Browse Course Catalog</Button>
                </div>
              </div>
            ) : courses.map(course => (
              <Card key={course.id} className="rounded-2xl border-border/60 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 group overflow-hidden bg-card">
                <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 relative group-hover:from-primary/20 transition-all">
                  <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border-none text-[10px] font-bold text-primary uppercase h-5">{course.category}</Badge>
                  <BookOpen className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardHeader className="pt-4">
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-6 border-b border-border/40">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500" /> Assessment Included</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> 45% Completed</span>
                    <span className="italic text-[10px]">Assigned {new Date(course.assigned_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/5 flex justify-between items-center group-hover:bg-muted/20 transition-all">
                   <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-primary rounded-lg h-8">View Content</Button>
                   <Button size="sm" className="text-xs font-bold rounded-lg h-8 shadow-sm">View Analytics</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-3xl border-border/60 shadow-lg p-8">
              <h4 className="text-lg font-bold mb-6 flex items-center justify-between">
                Training Progress Distribution
                <FileText className="w-5 h-5 text-primary/60" />
              </h4>
              <div className="space-y-6">
                {[
                  { label: "Completed", value: 45, color: "bg-emerald-500", text: "text-emerald-500" },
                  { label: "In Progress", value: 30, color: "bg-blue-500", text: "text-blue-500" },
                  { label: "Not Started", value: 25, color: "bg-amber-500", text: "text-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="uppercase tracking-wider opacity-70">{item.label}</span>
                      <span className={item.text}>{item.value}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-lg p-8">
               <h4 className="text-lg font-bold mb-4">Summary Report</h4>
               <p className="text-xs text-muted-foreground mb-6 leading-relaxed italic">
                 The overall security awareness posture for {company.name} is showing a positive trend. Completion rates have increased by 15% over the last quarter.
               </p>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Pass rate</p>
                   <p className="text-2xl font-bold text-emerald-600">92%</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Avg. Score</p>
                   <p className="text-2xl font-bold text-primary">84/100</p>
                 </div>
               </div>
               <Button className="w-full mt-6 rounded-xl font-bold h-11 shadow-lg shadow-primary/10">
                 Download Full PDF Report
               </Button>
            </Card>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-lg p-8 text-center pt-12 pb-12">
            <h4 className="text-xl font-bold mb-2">Monthly Risk Assessment</h4>
            <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto italic">
              Detailed tracking of simulated phishing attacks and employee responses to measure real-world resilience.
            </p>
            <div className="flex items-center justify-center gap-12 flex-wrap">
              {[
                { label: "Simulations Sent", value: "1,240", icon: Share2 },
                { label: "Click Rate", value: "3.2%", icon: Activity },
                { label: "Reported", value: "88%", icon: CheckCircle2 },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
