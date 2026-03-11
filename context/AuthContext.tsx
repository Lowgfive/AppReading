import { createContext, PropsWithChildren, useEffect, useState, useContext } from "react";
import { AuthService } from "../services/auth.service";
import { router } from "expo-router";

type AuthContextType = {
    user: any | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const token = await AuthService.getToken();
            if (token) {
                // Verify token validity or fetch user profile here if needed
                setUser({ token });
                router.replace('/(tabs)/home');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (token: string) => {
        setUser({ token });
        router.replace('/(tabs)/home');
    };

    const signOut = async () => {
        await AuthService.logout();
        setUser(null);
        router.replace('/(tabs)/home');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}