import { Storage } from '../context/wrapper';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY = 'token';

type ApiResponse<T> = {
    success?: boolean;
    code?: string;
    messageKey?: string;
    message?: string;
    data?: T;
    user?: any;
};

const unwrapData = <T>(responseData: ApiResponse<T> | T): T => {
    if (responseData && typeof responseData === 'object' && 'data' in (responseData as ApiResponse<T>)) {
        return (responseData as ApiResponse<T>).data as T;
    }

    return responseData as T;
};

export const AuthService = {
    async login(email: string, password: string) {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const payload = unwrapData<{ user: any; token: string }>(response.data);

        if (payload?.token) {
            await Storage.setItem(TOKEN_KEY, payload.token);
        }

        return payload;
    },

    async register(username: string, email: string, password: string) {
        const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
        return unwrapData(response.data);
    },

    async logout() {
        await Storage.removeItem(TOKEN_KEY);
    },

    async getToken() {
        return await Storage.getItem(TOKEN_KEY);
    },

    async getProfile() {
        const token = await Storage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            ...response.data,
            user: response.data?.user || response.data?.data?.user || response.data?.data || null,
        };
    },

    async updateProfile(data: { username?: string; description?: string; email?: string; language?: 'en' | 'vi' }) {
        const token = await Storage.getItem(TOKEN_KEY);
        const response = await axios.put(`${API_URL}/auth/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async updateAvatar(avatar: string) {
        const token = await Storage.getItem(TOKEN_KEY);
        const response = await axios.put(`${API_URL}/auth/avatar`, { avatar }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async updatePassword(oldPassword: string, newPassword: string) {
        const token = await Storage.getItem(TOKEN_KEY);
        const response = await axios.put(`${API_URL}/auth/password`, { oldPassword, newPassword }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
