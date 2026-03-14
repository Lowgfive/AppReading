import { AppService } from "@/services/app.service";
import { Story } from "@/types/story.type";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type ToastType = 'success' | 'error' | 'info';

type AppContextType = {
    openLogin: boolean | null;
    setOpenLogin: React.Dispatch<React.SetStateAction<boolean | null>>
    dataStory: Array<Story>
    setDataStory : React.Dispatch<React.SetStateAction<Array<Story>>>
    balance: number | null;
    setBalance: React.Dispatch<React.SetStateAction<number | null>>;
    fetchBalance: () => Promise<void>;
    showToast: (message: string, type?: ToastType) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export default function AppProvider({ children }: PropsWithChildren) {
    const { user } = useAuth();

    const [openLogin, setOpenLogin] = useState<boolean | null>(false)
    const [dataStory, setDataStory] = useState<Array<Story>>([]);
    const [balance, setBalance] = useState<number | null>(null);
    
    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>('info');

    const showToast = (message: string, type: ToastType = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const hideToast = () => {
        setToastVisible(false);
    };

    const data = async () => {
        try {
            const data: any = await AppService.data();
            if (data && data.story) {
                setDataStory(data.story);
            }
        } catch (error) {

        }
    }

    const fetchBalance = async () => {
        if (user) {
            try {
                const res = await AppService.getBalance();
                setBalance(res.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        } else {
            setBalance(null);
        }
    };

    useEffect(() => {
        data();
    }, [])

    useEffect(() => {
        fetchBalance();
    }, [user]);

    return (
        <AppContext.Provider value={{ openLogin, setOpenLogin, dataStory, setDataStory, balance, setBalance, fetchBalance, showToast }}>
            {children}
            <Toast 
                visible={toastVisible} 
                message={toastMessage} 
                type={toastType} 
                onHide={hideToast} 
            />
        </AppContext.Provider>
    )
}

// Ensure you import the Toast component at the top of this file
import { Toast } from "@/components/Toast";