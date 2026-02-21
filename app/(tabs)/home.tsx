import { AppContext } from "@/context/AppContext";
import { Story } from "@/types/story.type";
import { Button, View } from "react-native";
import { useContext, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { router, useNavigation } from "expo-router";
import { AppService } from "@/services/app.service";

export default function HomeScreen() {

    const context = useContext(AppContext);
    const [check , setCheck] = useState<Boolean>()
    if (!context) {
        throw new Error("useAppContext must be used inside AppProvider")
    }
    const { user, signOut } = useAuth();
    const { dataStory, setDataStory } = context;


    const like = async (storyId: string) => {
        check ? setCheck(false) : setCheck(true)
        if (user) {
            await AppService.likeStories(storyId)
            setDataStory(prev =>
                prev.map(story =>
                    story._id === storyId
                        ? {
                            ...story,
                            likeCount: 
                            check
                                ? story.likeCount - 1
                                : story.likeCount + 1
                        }
                        : story
                )
            );
        } else {
            router.push('/(auth)/login');
        }
    }
    return (
        <View>
            <Button title="Logout" onPress={signOut}></Button>
            {dataStory?.map((item) => {
                return (
                    <View key={item._id}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text>{item.description}</Text>
                        <Text>{item.type}</Text>
                        <Text>{item.likeCount}</Text>
                        <Button title="Like" onPress={() => { like(item._id) }} ></Button>
                    </View>
                )
            })}
        </View>
    )
}


const styles = StyleSheet.create({
    title: {
        color: "white",
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 4,
    },
})