"use client";

import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Save,
    Loader2,
    Camera,
    Lock,
    ExternalLink
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { toast } from "sonner";
import { setCredentials } from "@/lib/redux/authSlice";

export default function ProfilePage() {
    const { userInfo, token } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        role: "",
        bio: "",
        designation: "",
        organization: ""
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                firstName: userInfo.firstName || "",
                lastName: userInfo.lastName || "",
                email: userInfo.email || "",
                mobile: userInfo.mobile || "",
                role: userInfo.role || "Super Admin",
                bio: userInfo.bio || "",
                designation: userInfo.designation || "Platform Administrator",
                organization: userInfo.organization || "CyberShield Guard"
            });
        }
    }, [userInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local Redux state
            dispatch(setCredentials({
                user: { ...userInfo, ...formData },
                token: token!
            }));

            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = () => {
        return `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "U";
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
                                <span className="text-3xl font-bold text-white/90">{getInitials()}</span>
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white text-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{formData.firstName} {formData.lastName}</h1>
                            <p className="text-white/50 flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4" />
                                {formData.role}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-medium text-white/70 uppercase tracking-wider border border-white/5">
                                    {formData.designation}
                                </span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-medium text-white/70 uppercase tracking-wider border border-white/5">
                                    {formData.organization}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">System Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <span className="text-white/70 truncate">{formData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-white/40" />
                                    <span className="text-white/70">{formData.mobile || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-white/40" />
                                    <span className="text-white/70">Joined March 2026</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Security</h3>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-white/70 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </div>
                                <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                                <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 font-bold uppercase tracking-tighter animate-pulse">
                                    Verified Account
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/40 uppercase ml-1">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/40 uppercase ml-1">Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/40 uppercase ml-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/40 uppercase ml-1">Designation</label>
                                    <input
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/40 uppercase ml-1">Organization</label>
                                    <input
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 w-full md:w-auto md:px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
