import { API_URL } from '@/app/(auth)/login';
import axios from 'axios';
import { AuthService } from './auth.service';

export const AppService = {
    async data() {
        const res = await axios.get(`${API_URL}/listStories`);
        return res.data;
    },
    async likeStories( storyId : string) {
        const token = await AuthService.getToken();
        console.log(token)
        await axios.post(`${API_URL}/toggle-like`, {
             storyId
        },
        {
            headers : {
                Authorization : `Bearer ${token}`
            }
        }
    )
    }
}