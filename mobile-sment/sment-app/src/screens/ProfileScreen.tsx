import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar, { TabKey } from "../components/BottomBar";
import { useTheme } from "../hooks/useTheme";

type Props = {
    name?: string;
    email?: string;
    onLogout?: () => void | Promise<void>;
    onCreateReport?: () => void;
    onOpenPrivacy?: () => void;
    onOpenHome?: () => void;
    onOpenHistory?: () => void;
};

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
};

type MenuRowProps = {
    label: string;
    onPress: () => void;
    showDivider?: boolean;
};

function MenuRow({ label, onPress, showDivider }: MenuRowProps) {
    const c = useTheme();

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }) => [
                styles.row,
                showDivider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
                pressed && { opacity: 0.6 },
            ]}
        >
            <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
            <Text style={[styles.chevron, { color: c.textMuted }]}>›</Text>
        </Pressable>
    );
}

export default function ProfileScreen({
    name = "Nama Lengkap",
    email = "email@gmail.com",
    onLogout = () => { },
    onCreateReport = () => { },
    onOpenPrivacy = () => { },
    onOpenHome = () => { },
    onOpenHistory = () => { },
}: Props) {
    const c = useTheme();

    const handleTab = (key: TabKey) => {
        if (key === "home") onOpenHome();
        if (key === "history") onOpenHistory();
    };

    const confirmLogout = () => {
        Alert.alert("Keluar dari akun?", "Anda perlu masuk lagi untuk membuat laporan.", [
            { text: "Batal", style: "cancel" },
            { text: "Keluar", style: "destructive", onPress: () => void onLogout() },
        ]);
    };

    return (
        <View style={[styles.screen, { backgroundColor: c.bg }]}>
            <SafeAreaView style={styles.content} edges={["top"]}>
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: c.surface, borderColor: c.border }]}>
                        <Text style={[styles.avatarText, { color: c.text }]}>{getInitials(name)}</Text>
                    </View>
                    <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={[styles.email, { color: c.textMuted }]} numberOfLines={1}>
                        {email}
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <MenuRow label="Buat laporan" onPress={onCreateReport} showDivider />
                    <MenuRow label="Kebijakan privasi" onPress={onOpenPrivacy} />
                </View>

                <Pressable
                    onPress={confirmLogout}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.logout,
                        { borderColor: c.danger },
                        pressed && { opacity: 0.6 },
                    ]}
                >
                    <Text style={[styles.logoutLabel, { color: c.danger }]}>Keluar</Text>
                </Pressable>
            </SafeAreaView>

            <BottomBar active="profile" onTab={handleTab} onCreate={onCreateReport} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 36,
    },
    avatar: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    avatarText: {
        fontSize: 34,
        fontWeight: "300",
        letterSpacing: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
    email: {
        fontSize: 15,
        marginTop: 4,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        minHeight: 56,
    },
    rowLabel: { fontSize: 16 },
    chevron: { fontSize: 22 },
    logout: {
        marginTop: 28,
        alignSelf: "center",
        minWidth: 160,
        minHeight: 48,
        paddingHorizontal: 28,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logoutLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
});