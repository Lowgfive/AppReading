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
        console.log(token)
        await axios.post(`${API_URL}/toggle-like`, {
            storyId
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
    },
    async getStoryChapters(storyId: string) {
        const res = await axios.get(`${API_URL}/chapters/${storyId}/list`);
        return res.data;
    },
    async getChapterContent(storyId: string, chapterNumber: number) {
        const res = await axios.get(`${API_URL}/chapters/${storyId}/read/${chapterNumber}`);
        return res.data;
    }
}