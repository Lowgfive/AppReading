import { Storage } from '../context/wrapper'
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = 'token';

export const AuthService = {
    async login(email: string, password: string) {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        if (response.data.token) {
            await Storage.setItem(TOKEN_KEY, response.data.token);
        }
        return response.data;
    },

    async register(username: string, email: string, password: string) {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        console.log(response.data.message)
        return response.data;
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
        return response.data;
    },

    async updateProfile(data: { username?: string, description?: string, email?: string }) {
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
