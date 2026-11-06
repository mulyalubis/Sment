import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = { userName: string };

export default function AppHeader({ userName }: Props) {
    const c = useTheme();
    return (
        <View style={styles.header}>
            <View>
                <Text style={[styles.hello, { color: c.textMuted }]}>Halo, {userName}</Text>
                <Text style={[styles.brand, { color: c.text }]}>sment-app</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: c.surfaceAlt }]}>
                <Ionicons name="person" size={18} color={c.leaf} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    hello: { fontSize: 14 },
    brand: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});