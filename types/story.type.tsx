export type Story = {
    _id: string;
    name: string;
    title?: string;
    image: string;
    coverImageUrl?: string;
    type: string; // enum is enforced on backend
    genres?: string[];
    description: string;
    author?: string;
    likeCount: number;
    viewCount?: number;
    commentCount?: number;
    status?: "Ongoing" | "Completed";
    userId?: {
        username?: string;
    };
};
