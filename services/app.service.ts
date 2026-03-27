import axios from 'axios';
import { AuthService } from './auth.service';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLOUDINARY_CLOUD_NAME = 'dwqmg5d1f';
const CLOUDINARY_UPLOAD_PRESET = 'my_upload';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

type UploadStoryCoverInput = {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    file?: File;
};

type CloudinaryUploadResponse = {
    secure_url?: string;
    error?: {
        message?: string;
    };
};

export const AppService = {
    async getHomeStories() {
        const res = await axios.get(`${API_URL}/stories/home`);
        return res.data;
    },
    async searchStories(params: Record<string, any>) {
        const query = new URLSearchParams(params as any).toString();
        const res = await axios.get(`${API_URL}/stories?${query}`);
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
    async getStoryById(storyId: string) {
        const res = await axios.get(`${API_URL}/stories/${storyId}`);
        return res.data;
    },
    async getStoryChapters(storyId: string) {
        const token = await AuthService.getToken();

        const res = await axios.get(`${API_URL}/chapters/${storyId}/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async createChapter(payload: {
        storyId: string;
        chapters: Array<{
            chapterNumber: number;
            title: string;
            content: string;
        }>;
    }) {
        const token = await AuthService.getToken();
        const res = await axios.post(`${API_URL}/chapters/createChapter`, payload, {
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
    async getChapterComments(chapterId: string) {
        const res = await axios.get(`${API_URL}/comments`, {
            params: { chapterId }
        });
        return res.data;
    },
    async createChapterComment(chapterId: string, content: string) {
        const token = await AuthService.getToken();
        const res = await axios.post(`${API_URL}/comments`, {
            chapterId,
            content
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getAdminDashboard() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getAdminStories() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/admin/stories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async createAdminStory(payload: {
        title: string;
        author: string;
        description: string;
        coverImageUrl: string;
        status: 'ongoing' | 'completed';
        genres: string[];
    }) {
        const token = await AuthService.getToken();
        const res = await axios.post(`${API_URL}/admin/stories`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async updateAdminStory(storyId: string, payload: {
        title: string;
        author: string;
        description: string;
        coverImageUrl: string;
        status: 'ongoing' | 'completed';
        genres: string[];
    }) {
        const token = await AuthService.getToken();
        const res = await axios.put(`${API_URL}/admin/stories/${storyId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async uploadImageToCloudinary(input: UploadStoryCoverInput) {
        const formData = new FormData();

        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        if (input.file) {
            formData.append('file', input.file);
        } else {
            formData.append('file', {
                uri: input.uri,
                name: input.fileName || `story-cover-${Date.now()}.jpg`,
                type: input.mimeType || 'image/jpeg',
            } as any);
        }

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json() as CloudinaryUploadResponse;

        if (!response.ok || !data.secure_url) {
            throw new Error(data.error?.message || 'Không thể upload ảnh bìa lên Cloudinary.');
        }

        return data.secure_url;
    },
    async uploadStoryCover(input: UploadStoryCoverInput) {
        return this.uploadImageToCloudinary(input);
    },
    async getLikedStories() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/stories/getLikeStory`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async checkIfLiked(storyId: string) {
        const token = await AuthService.getToken();
        if (!token) return false;
        try {
            const res = await axios.get(`${API_URL}/stories/check-like/${storyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.liked;
        } catch (error) {
          
            return false;
        }
    },
    async getLibrary() {
        const token = await AuthService.getToken();
        const res = await axios.get(`${API_URL}/reading-history/library`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getBalance() {
        const token = await AuthService.getToken();
        if (!token) return null;
        const res = await axios.get(`${API_URL}/money/balance`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async getTopupPackages() {
        const res = await axios.get(`${API_URL}/v1/payments/packages`);
        return res.data;
    },
    async createVnpayPaymentUrl(amount: number) {
        const token = await AuthService.getToken();
        const res = await axios.post(`${API_URL}/v1/payments/vnpay/create-payment-url`, {
            amount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async unlockChapter(storyId: string, chapterId: string) {
        const token = await AuthService.getToken();
        const response = await axios.post(`${API_URL}/chapters/unlockChapter`, {
            storyId,
            chapterId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}
