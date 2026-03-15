import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/services/app.service";
import { useToast } from "@/context/ToastContext";

type ChatMessage = {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
};

type Props = {
  roomId: string;
};

export default function Message({ roomId }: Props) {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/${roomId}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        setMessages(res.data.data || []);
      } catch (error) {
        console.warn("Failed to load chat messages", error);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  useEffect(() => {
    const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace("/api", "");
    
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      setIsConnected(true);
      socket.emit("join_room", roomId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
      setIsConnected(false);
      showToast("Chat connection error. Please try again later.", "error");
    });

    socket.on("receive_message", (message: ChatMessage) => {
      console.log("📩 New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, token]);

  const handleSend = () => {
    console.log("Attempting to send message...");
    console.log("Draft:", draft);
    console.log("User ID:", user?._id);
    console.log("Is Connected:", isConnected);

    if (!draft.trim() || !user || !socketRef.current || !isConnected) {
      console.warn("Cannot send: Missing draft, user, or active connection");
      return;
    }

    const payload = {
      content: draft.trim(),
      userId: user._id,
      roomId,
    };

    console.log("📤 Emitting send_message with payload:", payload);
    socketRef.current.emit("send_message", payload);

    setDraft("");
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.userId._id === user?._id;
    return (
      <View
        className={`mb-3 flex-row ${isMe ? "justify-end" : "justify-start"}`}
        style={{ alignItems: "flex-end" }}
      >
        {!isMe && (
          <Image
            source={{ uri: item.userId.avatar || "https://via.placeholder.com/40" }}
            className="h-10 w-10 rounded-full mr-3"
            style={{ backgroundColor: colors.border }}
          />
        )}
        <View
          className="rounded-2xl p-3 max-w-[80%]"
          style={{
            backgroundColor: isMe ? colors.accent : colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <Text className="font-semibold" style={{ color: colors.text }}>
            {item.userId.username}
          </Text>
          <Text className="mt-1" style={{ color: colors.text }}>
            {item.content}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: colors.subtext }}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        inverted={false}
      />

      <View
        className="flex-row items-center px-4 py-3"
        style={{ backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message..."
          placeholderTextColor={colors.subtext}
          className="flex-1 mr-3 rounded-full px-4 py-2"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="rounded-full px-4 py-2"
          style={{ backgroundColor: colors.accent }}
          disabled={!draft.trim() || !isConnected}
        >
          <Text style={{ color: colors.background, fontWeight: "600" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
