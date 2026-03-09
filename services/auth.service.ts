
import * as SecureStore from 'expo-secure-store';
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
    }
};
