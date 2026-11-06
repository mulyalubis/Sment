import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";

export type TabKey = "home" | "history" | "profile";

const TABS: {
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
        { key: "home", label: "Beranda", icon: "home-outline", iconActive: "home" },
        { key: "history", label: "Riwayat", icon: "document-text-outline", iconActive: "document-text" },
        { key: "profile", label: "Profil", icon: "person-outline", iconActive: "person" },
    ];

type Props = {
    active: TabKey;
    onTab: (key: TabKey) => void;
    onCreate: () => void;
};

export default function BottomBar({ active, onTab, onCreate }: Props) {
    const c = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
            pointerEvents="box-none"
        >
            <Pressable
                onPress={onCreate}
                accessibilityRole="button"
                accessibilityLabel="Buat laporan"
                style={({ pressed }) => [
                    styles.fab,
                    { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 },
                ]}
            >
                <Ionicons name="camera" size={26} color={c.onAccent} />
            </Pressable>

            <View style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]}>
                {TABS.map((t) => {
                    const isActive = t.key === active;
                    return (
                        <Pressable
                            key={t.key}
                            onPress={() => onTab(t.key)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            style={[styles.tab, isActive && { backgroundColor: c.surfaceAlt }]}
                        >
                            <Ionicons
                                name={isActive ? t.iconActive : t.icon}
                                size={20}
                                color={isActive ? c.leaf : c.textMuted}
                            />
                            {isActive && <Text style={[styles.tabLabel, { color: c.leaf }]}>{t.label}</Text>}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    pill: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 6,
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 22,
    },
    tabLabel: { fontSize: 13, fontWeight: "700" },
});