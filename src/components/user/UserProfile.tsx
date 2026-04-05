"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateUserInfo } from "@/lib/redux/authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    Building2, 
    FileText, 
    Loader2, 
    Camera,
    Save,
    X,
    Lock,
    RefreshCcw,
    Shield
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    mobile: z.string().optional(),
    bio: z.string().optional(),
    designation: z.string().optional(),
    organization: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function UserProfile() {
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: userInfo?.firstName || "",
            lastName: userInfo?.lastName || "",
            mobile: userInfo?.mobile || "",
            bio: userInfo?.bio || "",
            designation: userInfo?.designation || "",
            organization: userInfo?.organization || "",
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onProfileSubmit = async (data: ProfileFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            const result = await response.json();
            if (result.success) {
                dispatch(updateUserInfo(data));
                toast.success("Profile updated successfully");
                setIsOpen(false);
            } else {
                toast.error(result.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
                credentials: "include",
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Password changed successfully");
                passwordForm.reset();
                setIsOpen(false);
            } else {
                toast.error(result.message || "Failed to change password");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const initials = `${userInfo?.firstName?.[0] ?? ""}${userInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                profileForm.reset({
                    firstName: userInfo?.firstName || "",
                    lastName: userInfo?.lastName || "",
                    mobile: userInfo?.mobile || "",
                    bio: userInfo?.bio || "",
                    designation: userInfo?.designation || "",
                    organization: userInfo?.organization || "",
                });
                passwordForm.reset();
                setActiveTab("profile");
            }
        }}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 pl-3 border-l border-border hover:bg-muted/50 p-1 rounded-lg transition-all group">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-xs font-bold text-emerald-600">{initials}</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                        <span className="text-xs font-semibold leading-none group-hover:text-emerald-600 transition-colors">
                            {userInfo?.firstName} {userInfo?.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{userInfo?.email}</span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden border-none outline-none shadow-2xl">
                <div className="bg-emerald-600 p-6 text-white relative">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-2xl font-bold">Account Center</DialogTitle>
                        <DialogDescription className="text-emerald-100/80">
                            Configure your profile and security credentials
                        </DialogDescription>
                    </DialogHeader>
                    <div className="absolute -bottom-10 right-8">
                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl border-4 border-white">
                            <div className="w-full h-full rounded-xl bg-emerald-50 flex items-center justify-center relative group overflow-hidden">
                                <span className="text-2xl font-bold text-emerald-600">{initials}</span>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-12">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
                            <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Profile Details</TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Security & Access</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                                {...profileForm.register("firstName")}
                                            />
                                        </div>
                                        {profileForm.formState.errors.firstName && <span className="text-[10px] text-red-500 font-medium">{profileForm.formState.errors.firstName.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="lastName"
                                                className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                                {...profileForm.register("lastName")}
                                            />
                                        </div>
                                        {profileForm.formState.errors.lastName && <span className="text-[10px] text-red-500 font-medium">{profileForm.formState.errors.lastName.message}</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={userInfo?.email}
                                            disabled
                                            className="pl-9 bg-muted/50 cursor-not-allowed opacity-70 border-muted-foreground/10"
                                        />
                                        <div className="absolute right-3 top-2.5">
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">VERIFIED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="designation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Designation</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="designation"
                                                placeholder="Web Developer"
                                                className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                                {...profileForm.register("designation")}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="organization" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="organization"
                                                placeholder="Company Name"
                                                className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                                {...profileForm.register("organization")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Bio</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="bio"
                                            placeholder="Tell us a bit about yourself..."
                                            className="pl-9 min-h-[80px] bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50 resize-none text-xs"
                                            {...profileForm.register("bio")}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="mt-8 border-t border-border pt-6">
                                    <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-8">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Update Profile
                                    </Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>

                        <TabsContent value="security">
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-2">
                                    <p className="text-[10px] font-medium text-orange-600 leading-relaxed uppercase tracking-widest">Security Protocol</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Changes are irreversible. Ensure you use a strong, unique pass-phrase.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                            {...passwordForm.register("currentPassword")}
                                        />
                                    </div>
                                    {passwordForm.formState.errors.currentPassword && <span className="text-[10px] text-red-500 font-medium">{passwordForm.formState.errors.currentPassword.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                            {...passwordForm.register("newPassword")}
                                        />
                                    </div>
                                    {passwordForm.formState.errors.newPassword && <span className="text-[10px] text-red-500 font-medium">{passwordForm.formState.errors.newPassword.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            className="pl-9 bg-muted/30 border-muted-foreground/20 focus:border-emerald-500/50"
                                            {...passwordForm.register("confirmPassword")}
                                        />
                                    </div>
                                    {passwordForm.formState.errors.confirmPassword && <span className="text-[10px] text-red-500 font-medium">{passwordForm.formState.errors.confirmPassword.message}</span>}
                                </div>

                                <DialogFooter className="mt-8 border-t border-border pt-6">
                                    <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-8">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                        Sync New Password
                                    </Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
