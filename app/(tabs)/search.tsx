import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Animated,
    Modal,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import StoryCard from "@/components/StoryCard";
import SkeletonStoryCard from "@/components/SkeletonStoryCard";
import { AppService } from "@/services/app.service";
import { useRouter } from "expo-router";
import { ChevronDown, Filter } from "lucide-react-native";
import debounce from "lodash.debounce";
import SideMenu from "@/components/SideMenu";

const SORT_OPTIONS = [
    { key: "popular", label: "Most Popular" },
    { key: "newest", label: "Newest" },
    { key: "rating", label: "Rating" },
];

export default function SearchScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const skeletonOpacity = useRef(new Animated.Value(1)).current;
    const [searchText, setSearchText] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // filter UI state
    const [showFilter, setShowFilter] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const loadStories = async (reset: boolean = false) => {
        setLoading(true);
        try {
            const params: any = { q: searchText, sort, page, limit: 20 };
            if (selectedTypes.length) params.types = selectedTypes.join(",");
            if (selectedStatus) params.status = selectedStatus;            const result = await AppService.searchStories(params);
            if (reset) {
                setStories(result.stories);
            } else {
                setStories(prev => [...prev, ...result.stories]);
            }
            setTotal(result.total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            Animated.timing(skeletonOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    };

    // debounced search
    const debouncedLoad = useMemo(
        () => debounce(() => loadStories(true), 500),
        [searchText, sort, selectedTypes, selectedStatus]
    );

    useEffect(() => {
        setPage(1);
        debouncedLoad();
        return () => debouncedLoad.cancel();
    }, [searchText, sort]);

    useEffect(() => {
        // initial load
        loadStories(true);
    }, []);

    const handleScroll = ({ nativeEvent }: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50 && !loading && stories.length < total) {
            setPage(p => p + 1);
            loadStories();
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

            <View className="px-4 pt-4">
                <Text className="text-3xl font-bold" style={{ color: colors.text }}>Explore Stories</Text>
                <Text className="text-sm mt-1" style={{ color: colors.subtext }}>Search stories, authors, or genres...</Text>
            </View>

            <View className="px-4 py-2 flex-row items-center">
                <View className="flex-1">
                    <View className="flex-row items-center rounded-xl px-4 py-2" style={{ backgroundColor: colors.inputBackground }}>
                        <TextInput
                            placeholder="Search stories, authors, genres..."
                            placeholderTextColor={colors.iconMuted}
                            className="flex-1 font-inter text-sm"
                            style={{ color: colors.text }}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>
                <TouchableOpacity className="ml-3" onPress={() => setShowFilter(true)}>
                    <Filter color={colors.icon} size={24} />
                </TouchableOpacity>
            </View>

            <View className="px-4 py-1 flex-row items-center justify-between">
                <Text className="text-sm" style={{ color: colors.subtext }}>{total} stories</Text>
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => {
                        const currentIndex = SORT_OPTIONS.findIndex(o => o.key === sort);
                        const next = SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length];
                        setSort(next.key);
                    }}
                >
                    <Text className="text-sm" style={{ color: colors.text }}>
                        {SORT_OPTIONS.find(o => o.key === sort)?.label}
                    </Text>
                    <ChevronDown color={colors.icon} size={16} />
                </TouchableOpacity>
            </View>
            <Modal visible={showFilter} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black bg-opacity-50">
                    <View className="bg-white p-4 rounded-t-xl" style={{ backgroundColor: colors.card }}>
                        <Text className="font-inter text-lg font-bold mb-2" style={{ color: colors.text }}>Filters</Text>
                        <Text className="font-inter text-sm mb-1" style={{ color: colors.text }}>Genres</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                            {["Huyền Huyễn","Tu Tiên","Đam Mỹ","Bách Hợp","Đô Thị","Dị Năng","Xuyên Không","Cẩu Đạo","Đời Thường","Lịch Sử","Võng Du"].map(t => {
                                const selected = selectedTypes.includes(t);
                                return (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => {
                                            setSelectedTypes(prev =>
                                                prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                                            );
                                        }}
                                        className="px-3 py-1 rounded-full mr-2"
                                        style={{ backgroundColor: selected ? colors.accent : colors.inputBackground }}
                                    >
                                        <Text style={{ color: selected ? '#000' : colors.text }} className="text-xs">{t}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <Text className="font-inter text-sm mb-1" style={{ color: colors.text }}>Status</Text>
                        <View className="flex-row mb-4">
                            {["Ongoing","Completed"].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setSelectedStatus(prev => prev === s ? undefined : s)}
                                    className="px-3 py-1 rounded-full mr-2"
                                    style={{ backgroundColor: selectedStatus === s ? colors.accent : colors.inputBackground }}
                                >
                                    <Text style={{ color: selectedStatus === s ? '#000' : colors.text }} className="text-xs">{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={() => setShowFilter(false)} className="mr-4">
                                <Text style={{ color: colors.accent }} className="font-inter">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowFilter(false);
                                    // re-run search with filters
                                    setPage(1);
                                    loadStories(true);
                                }}
                            >
                                <Text style={{ color: colors.accent }} className="font-inter font-bold">Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loading && stories.length === 0 ? (
                <Animated.View style={{ opacity: skeletonOpacity }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonStoryCard key={i} />
                        ))}
                    </ScrollView>
                </Animated.View>
            ) : (
                <ScrollView
                    className="px-4"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    <View className="flex-row flex-wrap -mx-2">
                        {stories.map(item => (
                            <View key={item._id} className="w-1/2 px-2">
                                <StoryCard
                                    story={item}
                                    onPress={() => router.push({
                                        pathname: `/story/${item._id}` as any,
                                        params: { storyData: JSON.stringify(item) }
                                    })}
                                />
                            </View>
                        ))}
                    </View>
                    {loading && stories.length > 0 && (
                        <ActivityIndicator size="large" color={colors.accent} className="my-4" />
                    )}
                </ScrollView>
            )}
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
