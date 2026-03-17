import * as api from '../api';

export const superadminGetPendingAdmins = async () => {
    try {
        const { data } = await api.superadminGetPendingAdmins();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to fetch pending admins' } };
    }
};

export const superadminGetAllAdmins = async () => {
    try {
        const { data } = await api.superadminGetAllAdmins();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to fetch all admins' } };
    }
};

export const superadminApproveAdmin = async (id: string) => {
    try {
        const { data } = await api.superadminApproveAdmin(id);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to approve admin' } };
    }
};

export const superadminRejectAdmin = async (id: string, reasonData: { reason: string }) => {
    try {
        const { data } = await api.superadminRejectAdmin(id, reasonData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to reject admin' } };
    }
};

export const superadminGetAllUsers = async () => {
    try {
        const { data } = await api.superadminGetAllUsers();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to fetch users' } };
    }
};

export const superadminGetAudit = async () => {
    try {
        const { data } = await api.superadminGetAudit();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to fetch audit logs' } };
    }
};

export const superadminGetProfile = async () => {
    try {
        const { data } = await api.superadminGetProfile();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to fetch profile' } };
    }
};

export const superadminUpdateProfile = async (profileData: any) => {
    try {
        const { data } = await api.superadminUpdateProfile(profileData);
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response?.data || { message: 'Failed to update profile' } };
    }
};
