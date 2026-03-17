import * as api from '../api';

export const signinUser = async (formData: any) => {
    try {
        const { data } = await api.userSignIn(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Login failed' } };
    }
};

export const signupUser = async (formData: any) => {
    try {
        const { data } = await api.userSignUp(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Signup failed' } };
    }
};

export const verifyUserOtp = async (formData: { email: string; otp: string }) => {
    try {
        const { data } = await api.userVerifyEmail(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Verification failed' } };
    }
};

export const resendUserOtp = async (formData: { email: string }) => {
    try {
        const { data } = await api.userResendOtp(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Resend failed' } };
    }
};

export const signinAdmin = async (formData: any) => {
    try {
        const { data } = await api.adminSignIn(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Login failed' } };
    }
};

export const signupAdmin = async (formData: any) => {
    try {
        const { data } = await api.adminSignUp(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Signup failed' } };
    }
};

export const verifyAdminOtp = async (formData: { email: string; otp: string }) => {
    try {
        const { data } = await api.adminVerifyEmail(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Verification failed' } };
    }
};

export const resendAdminOtp = async (formData: { email: string }) => {
    // Note: admin.routes doesn't explicitly have resend-otp but we will mock it if needed 
    // or call standard retry. Let's return a basic error for now if it doesn't exist 
    // Wait, admin.routes doesn't export resend-otp. We'll update backend or return.
    try {
        return { data: null, error: { message: "Resend not natively supported on this endpoint. Contact support." } };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Resend failed' } };
    }
};

export const signinSuperadmin = async (formData: any) => {
    try {
        const { data } = await api.superadminSignIn(formData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Login failed' } };
    }
};
