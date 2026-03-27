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
    Platform,
    FlatList,
    Dimensions,
    Keyboard,
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

const { width } = Dimensions.get("window");
const PAGE_SIZE = 20;
const cardWidth = (width - 32 - 12) / 2;

export default function SearchScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [stories, setStories] = useState<any[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
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
    const useNativeDriver = Platform.OS !== "web";
    const isFetchingRef = useRef(false);
    const hasMountedRef = useRef(false);
    const searchInputRef = useRef<TextInput>(null);

    const loadStories = async ({
        reset = false,
        nextPage = 1,
    }: {
        reset?: boolean;
        nextPage?: number;
    } = {}) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        if (reset) {
            setInitialLoading(true);
            skeletonOpacity.setValue(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const params: any = { q: searchText, sort, page: nextPage, limit: PAGE_SIZE };
            if (selectedTypes.length) params.types = selectedTypes.join(",");
            if (selectedStatus) params.status = selectedStatus;            

            const result = await AppService.searchStories(params);

            setStories((prev) => (reset ? result.stories : [...prev, ...result.stories]));
            setTotal(result.total);
            setPage(nextPage);
        } catch (e) {
            console.error(e);
        } finally {
            if (reset) {
                setInitialLoading(false);
                Animated.timing(skeletonOpacity, { toValue: 0, duration: 300, useNativeDriver }).start();
            } else {
                setLoadingMore(false);
            }
            isFetchingRef.current = false;
        }
    };

    const resetAndLoadStories = () => {
        loadStories({ reset: true, nextPage: 1 });
    };

    // debounced search
    const debouncedLoad = useMemo(
        () => debounce(() => resetAndLoadStories(), 500),
        [searchText, sort, selectedTypes, selectedStatus]
    );

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            resetAndLoadStories();
            return;
        }

        debouncedLoad();
        return () => debouncedLoad.cancel();
    }, [searchText, sort]);

    const handleLoadMore = () => {
        if (initialLoading || loadingMore || stories.length >= total) return;
        loadStories({ nextPage: page + 1 });
    };

    const openFilterModal = () => {
        searchInputRef.current?.blur();
        Keyboard.dismiss();
        setShowFilter(true);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />
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
                                    resetAndLoadStories();
                                }}
                            >
                                <Text style={{ color: colors.accent }} className="font-inter font-bold">Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {initialLoading && stories.length === 0 ? (
                <Animated.View style={{ opacity: skeletonOpacity }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonStoryCard key={i} />
                        ))}
                    </ScrollView>
                </Animated.View>
            ) : (
                <FlatList
                    data={stories}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    ListHeaderComponent={
                        <View>
                            <View className="pt-4">
                                <Text className="text-3xl font-bold" style={{ color: colors.text }}>Explore Stories</Text>
                                <Text className="text-sm mt-1" style={{ color: colors.subtext }}>Search stories, authors, or genres...</Text>
                            </View>

                            <View className="py-2 flex-row items-center">
                                <View className="flex-1">
                                    <View className="flex-row items-center rounded-xl px-4 py-2" style={{ backgroundColor: colors.inputBackground }}>
                                        <TextInput
                                            ref={searchInputRef}
                                            placeholder="Search stories, authors, genres..."
                                            placeholderTextColor={colors.iconMuted}
                                            className="flex-1 font-inter text-sm"
                                            style={{ color: colors.text }}
                                            autoCorrect={false}
                                            autoCapitalize="none"
                                            returnKeyType="search"
                                            clearButtonMode="while-editing"
                                            value={searchText}
                                            onChangeText={setSearchText}
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity className="ml-3" onPress={openFilterModal}>
                                    <Filter color={colors.icon} size={24} />
                                </TouchableOpacity>
                            </View>

                            <View className="py-1 flex-row items-center justify-between">
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
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="py-16 items-center">
                            <Text className="font-inter text-center" style={{ color: colors.subtext }}>
                                No stories found.
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="large" color={colors.accent} className="my-4" />
                        ) : (
                            <View className="h-4" />
                        )
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    renderItem={({ item }) => (
                        <View style={{ width: cardWidth, marginBottom: 16 }}>
                            <StoryCard
                                story={item}
                                onPress={() => router.push({
                                    pathname: `/story/${item._id}` as any,
                                    params: { storyData: JSON.stringify(item) }
                                })}
                            />
                        </View>
                    )}
                />
            )}
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
