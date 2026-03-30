"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Building2, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";

export default function AdminProfilePage() {
    const token = useAppSelector(s => s.auth.token);
    const { userInfo } = useAppSelector(s => s.auth);
    const [form, setForm] = useState({
        firstName: "", lastName: "", mobile: "",
        bio: "", designation: "", organization: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.profile) {
                    const p = data.profile;
                    setForm({
                        firstName: p.firstName || "",
                        lastName: p.lastName || "",
                        mobile: p.mobile || "",
                        bio: p.bio || "",
                        designation: p.designation || "",
                        organization: p.organization || "",
                    });
                }
            } catch { toast.error("Failed to load profile"); }
            finally { setIsLoading(false); }
        };
        fetchProfile();
    }, [token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Profile updated successfully!");
        } catch (err: any) { toast.error(err.message || "Update failed"); }
        finally { setSaving(false); }
    };

    const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "A";

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="module-header">
                <div>
                    <h1 className="module-title">My Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your admin account details</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-600">
                            {initials}
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{form.firstName} {form.lastName}</p>
                            <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
                            <span className="inline-block mt-1 text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                                Admin
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h2 className="font-medium flex items-center gap-2 text-sm"><User className="w-4 h-4" /> Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">First Name</label>
                                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                    placeholder="First Name" className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Last Name</label>
                                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                    placeholder="Last Name" className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                                <input value={userInfo?.email || ""} disabled
                                    className="input-field bg-neutral-900 text-gray-400 cursor-not-allowed border-border" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mobile</label>
                                <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                    placeholder="+91 9876543210" className="input-field" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h2 className="font-medium flex items-center gap-2 text-sm"><Building2 className="w-4 h-4" /> Professional Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designation</label>
                                <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                                    placeholder="IT Manager" className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Organization</label>
                                <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                    placeholder="Company Name" className="input-field" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
                                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                    placeholder="A short bio about yourself..." rows={3}
                                    className="input-field resize-none bg-black text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
