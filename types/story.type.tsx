export type Story = {
    _id: string;
    name: string;
    image: string;
    type: string; // enum is enforced on backend
    description: string;
    likeCount: number;
    viewCount?: number;
    commentCount?: number;
    status?: "Ongoing" | "Completed";
    userId?: {
        username?: string;
    };
};