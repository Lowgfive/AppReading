import axios from 'axios';
import { AuthService } from './auth.service';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const AppService = {
    async getHomeStories() {
        const res = await axios.get(`${API_URL}/stories/home`);
        return res.data;
    },
    async data() {
    },
    async likeStories(storyId: string) {
        const token = await AuthService.getToken();
        const response = await axios.post(`${API_URL}/stories/like`, {
            storyId
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    },
    async getStoryChapters(storyId: string) {
        const token = await AuthService.getToken();
        
        const res = await axios.get(`${API_URL}/chapters/${storyId}/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getChapterContent(storyId: string, chapterNumber: number) {
        let token = null;
        try {
            token = await AuthService.getToken();
        } catch (e) {
            console.log("No token found, proceeding as guest.");
        }
        
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await axios.get(`${API_URL}/chapters/${storyId}/read/${chapterNumber}`, {
            headers
        });
        return res.data;
    },
    async getLikedStories() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/stories/getLikeStory`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getLibrary() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/reading-history/library`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
}