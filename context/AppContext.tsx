import { AppService } from "@/services/app.service";
import { Story } from "@/types/story.type";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

type AppContextType = {
    openLogin: boolean | null;
    setOpenLogin: React.Dispatch<React.SetStateAction<boolean | null>>
    dataStory: Array<Story>
    setDataStory : React.Dispatch<React.SetStateAction<Array<Story>>>
}

export const AppContext = createContext<AppContextType | null>(null);

export default function AppProvider({ children }: PropsWithChildren) {

    const [openLogin, setOpenLogin] = useState<boolean | null>(false)
    const [dataStory, setDataStory] = useState<Array<Story>>([]);
    
    const data = async () => {
        try {
            const data: any = await AppService.data();
            if (data && data.story) {
                setDataStory(data.story);
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        data();
    }, [])
    return (
        <AppContext.Provider value={{ openLogin, setOpenLogin, dataStory , setDataStory}}>
            {children}
        </AppContext.Provider>
    )
}