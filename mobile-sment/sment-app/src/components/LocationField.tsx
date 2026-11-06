import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = {
    status: "loading" | "ready" | "denied" | "error";
    label?: string;
    onRefresh: () => void;
};

const MESSAGES = {
    loading: "Mencari lokasi Anda...",
    denied: "Izin lokasi ditolak. Aktifkan di pengaturan lalu coba lagi.",
    error: "Gagal mengambil lokasi. Pastikan GPS aktif.",
};

export default function LocationField({ status, label, onRefresh }: Props) {
    const c = useTheme();
    const ready = status === "ready";

    return (
        <View style={[styles.box, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            {status === "loading" ? (
                <ActivityIndicator color={c.leaf} />
            ) : (
                <Ionicons name={ready ? "location" : "location-outline"} size={22} color={ready ? c.leaf : c.danger} />
            )}

            <Text
                style={[styles.text, { color: ready ? c.text : c.textMuted }]}
                numberOfLines={2}
            >
                {ready ? label : MESSAGES[status]}
            </Text>

            <Pressable
                onPress={onRefresh}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Perbarui lokasi"
            >
                <Ionicons name="refresh" size={20} color={c.leaf} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    text: { flex: 1, fontSize: 14, lineHeight: 20 },
});