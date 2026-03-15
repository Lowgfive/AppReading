import { createContext, PropsWithChildren, useEffect, useState, useContext } from "react";
import { AuthService } from "../services/auth.service";
import { router } from "expo-router";

type AuthContextType = {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    signIn: async () => {},
    signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const storedToken = await AuthService.getToken();
            if (storedToken) {
                setToken(storedToken);

                // Fetch profile once to populate `user` data
                const profileRes = await AuthService.getProfile();
                if (profileRes?.user) {
                    setUser(profileRes.user);
                }

                router.replace("/(tabs)/home");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (newToken: string) => {
        setToken(newToken);
        const profileRes = await AuthService.getProfile();
        if (profileRes?.user) {
            setUser(profileRes.user);
        }
        router.replace("/(tabs)/home");
    };

    const signOut = async () => {
        await AuthService.logout();
        setToken(null);
        setUser(null);
        router.replace("/(tabs)/home");
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
