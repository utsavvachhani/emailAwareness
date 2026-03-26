import axios from 'axios';

const API = axios.create({ 
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // required to send cookies if used
});

// Adding interceptor to include auth token
API.interceptors.request.use((req) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            req.headers.authorization = `Bearer ${token}`;
        }
    }
    return req;
});

// ─── USER APIS ────────────────────────────────────────────────────────
export const userSignUp = (data: any) => API.post('/users/signup', data);
export const userVerifyEmail = (data: { email: string; otp: string }) => API.post('/users/verify-email', data);
export const userResendOtp = (data: { email: string }) => API.post('/users/resend-otp', data);
export const userSignIn = (data: any) => API.post('/users/signin', data);
export const userLogout = () => API.post('/users/logout');
export const userForgotPassword = (data: { email: string }) => API.post('/users/forgot-password', data);
export const userVerifyResetOtp = (data: { email: string; otp: string }) => API.post('/users/verify-reset-otp', data);
export const userResetPassword = (data: any) => API.post('/users/reset-password', data);
export const userRefreshToken = () => API.post('/users/refresh-token');
export const userGetMe = () => API.get('/users/me');
export const userGetProfile = () => API.get('/users/profile');
export const userUpdateProfile = (data: any) => API.put('/users/profile/update', data);
export const userChangePassword = (data: any) => API.post('/users/change-password', data);

// ─── ADMIN APIS ───────────────────────────────────────────────────────
export const adminSignUp = (data: any) => API.post('/admin/signup', data);
export const adminVerifyEmail = (data: { email: string; otp: string }) => API.post('/admin/verify-email', data); // Also mapped to verify-otp
export const adminVerifyOtp = (data: { email: string; otp: string }) => API.post('/admin/verify-otp', data);
export const adminSignIn = (data: any) => API.post('/admin/signin', data);
export const adminLogout = () => API.post('/admin/logout');
export const adminForgotPassword = (data: { email: string }) => API.post('/admin/forgot-password', data);
export const adminResetPassword = (data: any) => API.post('/admin/reset-password', data);
export const adminRefreshToken = () => API.post('/admin/refresh-token');
export const adminGetMe = () => API.get('/admin/me');
export const adminGetProfile = () => API.get('/admin/profile');
export const adminUpdateProfile = (data: any) => API.put('/admin/profile/update', data);

// ─── SUPERADMIN APIS ──────────────────────────────────────────────────
export const superadminSignIn = (data: any) => API.post('/superadmin/signin', data);
export const superadminLogout = () => API.post('/superadmin/logout');
export const superadminGetMe = () => API.get('/superadmin/me');
export const superadminGetProfile = () => API.get('/superadmin/profile');
export const superadminUpdateProfile = (data: any) => API.put('/superadmin/profile/update', data);

// Superadmin Managing Admins
export const superadminGetPendingAdmins = () => API.get('/superadmin/admins/pending');
export const superadminGetAllAdmins = () => API.get('/superadmin/admins/all');
export const superadminApproveAdmin = (id: string) => API.patch(`/superadmin/admins/${id}/approve`);
export const superadminRejectAdmin = (id: string, data: { reason: string }) => API.patch(`/superadmin/admins/${id}/reject`, data);

// Superadmin General Lookups
export const superadminGetAllUsers = () => API.get('/superadmin/users/all');
export const superadminGetAudit = () => API.get('/superadmin/audit');

// ─── ADMIN COURSE APIs ────────────────────────────────────────────────────────
export const adminGetCoursesByCompany = (companyId: string) => API.get(`/admin/companies/${companyId}/courses-list`);
export const adminCreateCourse = (companyId: string, data: any) => API.post(`/admin/companies/${companyId}/courses-create`, data);
export const adminDeleteCourse = (id: string) => API.delete(`/admin/my-courses/${id}`);
export const adminGetCompanyPlanInfo = (companyId: string) => API.get(`/admin/companies/${companyId}/plan-info`);

// ─── SUPERADMIN COURSE APIs ───────────────────────────────────────────────────
export const superadminGetAllCourses = (status?: string) => API.get('/superadmin/courses', { params: status ? { status } : {} });
export const superadminApproveCourse = (id: string) => API.patch(`/superadmin/courses/${id}/approve`);
export const superadminRejectCourse = (id: string, data: { reason: string }) => API.patch(`/superadmin/courses/${id}/reject`, data);

export default API;
