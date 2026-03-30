import axios from 'axios';
import { store } from '@/lib/redux/store';
import { setToken, logout } from '@/lib/redux/authSlice';

const API = axios.create({ 
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
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

// Singleton promise to handle concurrent refreshes
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Response interceptor for token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // If there's already a refresh in progress, wait for it
                if (!refreshPromise) {
                    refreshPromise = (async () => {
                        const userInfoStr = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
                        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
                        const role = userInfo?.role || 'user';
                        
                        let refreshEndpoint = '/users/refresh-token';
                        if (role === 'admin') refreshEndpoint = '/admin/refresh-token';
                        if (role === 'superadmin') refreshEndpoint = '/superadmin/refresh-token';
                        
                        const { data } = await axios.post(
                            `${API.defaults.baseURL}${refreshEndpoint}`,
                            {},
                            { withCredentials: true }
                        );
                        
                        const newToken = data.accessToken;
                        if (typeof window !== 'undefined') {
                            store.dispatch(setToken(newToken));
                        }
                        return newToken;
                    })().finally(() => {
                        // Reset the promise after completion (successful or not)
                        refreshPromise = null;
                    });
                }

                const accessToken = await refreshPromise;
                
                // Retry original request with the new token
                originalRequest.headers.authorization = `Bearer ${accessToken}`;
                return API(originalRequest);
                
            } catch (refreshError) {
                // If refresh fails, clear auth and redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    store.dispatch(logout()); // Redux sync
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

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
export const superadminRefreshToken = () => API.post('/superadmin/refresh-token');

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
export const adminGetCourseDetails = (id: string) => API.get(`/admin/my-courses/${id}`);
export const adminDeleteCourse = (id: string) => API.delete(`/admin/my-courses/${id}`);
export const adminGetCompanyPlanInfo = (companyId: string) => API.get(`/admin/companies/${companyId}/plan-info`);
export const adminGetCompanyStats = (companyId: string) => API.get(`/admin/companies/${companyId}/stats`);
export const adminGetCompanyDetails = (companyId: string) => API.get(`/admin/companies/${companyId}`);
export const adminGetCompanies = () => API.get('/admin/companies');
export const adminGetGlobalStats = () => API.get('/admin/stats');

// Module APIs
export const adminGetCourseModules = (courseId: string) => API.get(`/admin/courses/${courseId}/modules`);
export const adminGetModuleDetails = (id: string) => API.get(`/admin/modules/${id}`);
export const adminCreateModule = (courseId: string, data: any) => API.post(`/admin/courses/${courseId}/modules`, data);

export const adminUpdateModule = (id: string, data: any) => API.put(`/admin/modules/${id}`, data);
export const adminDeleteModule = (id: string) => API.delete(`/admin/modules/${id}`);
export const adminUploadMedia = (formData: FormData) => API.post('/admin/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ─── SUPERADMIN COURSE APIs ───────────────────────────────────────────────────
export const superadminGetAllCourses = (status?: string) => API.get('/superadmin/courses', { params: status ? { status } : {} });
export const superadminApproveCourse = (id: string) => API.patch(`/superadmin/courses/${id}/approve`);
export const superadminRejectCourse = (id: string, data: { reason: string }) => API.patch(`/superadmin/courses/${id}/reject`, data);
export const superadminResetCourse = (id: string) => API.patch(`/superadmin/courses/${id}/reset`);
export const superadminGetAdminPortfolioStats = (adminId: string | number) => API.get(`/superadmin/admins/${adminId}/stats`);
export const superadminGetAdminCompanies = (adminId: string | number) => API.get(`/superadmin/admins/${adminId}/companies`);
export const superadminGetCompanyDetails = (companyId: string | number) => API.get(`/superadmin/companies/${companyId}`);
export const superadminGetCompanyStats = (companyId: string | number) => API.get(`/superadmin/companies/${companyId}/stats`);
export const superadminGetCompanyEmployees = (companyId: string | number) => API.get(`/superadmin/companies/${companyId}/employees`);
export const superadminGetCompanyCourses = (companyId: string | number) => API.get(`/superadmin/companies/${companyId}/courses`);
export const superadminUpdateCompanyBilling = (companyId: string | number, data: any) => API.patch(`/superadmin/companies/${companyId}/billing`, data);
export const superadminGetModuleDetails = (moduleId: string | number) => API.get(`/superadmin/modules/${moduleId}`);
export const superadminGetCourseModules = (courseId: string | number) => API.get(`/superadmin/courses/${courseId}/modules`);
export const superadminGetCourseDetails = (courseId: string | number) => API.get(`/superadmin/courses/${courseId}`);
export const superadminDeleteCourse = (id: string | number) => API.delete(`/superadmin/courses/${id}`);
export const superadminCreateCourse = (companyId: string, data: any) => API.post(`/superadmin/companies/${companyId}/courses`, data);
export const superadminGetCompanyPlanInfo = (companyId: string) => API.get(`/superadmin/companies/${companyId}/plan-info`);
export const superadminCreateModule = (courseId: string, data: any) => API.post(`/superadmin/courses/${courseId}/modules`, data);
export const superadminUpdateModule = (id: string, data: any) => API.put(`/superadmin/modules/${id}`, data);
export const superadminDeleteModule = (id: string) => API.delete(`/superadmin/modules/${id}`);

export default API;
