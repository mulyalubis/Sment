import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = {
    label: string; // mis. "Masuk dengan Google"
    onPress: () => void;
};

// Garis pemisah + tombol Google.
export default function SocialAuth({ label, onPress }: Props) {
    const c = useTheme();
    return (
        <View style={styles.wrap}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
                ]}
            >
                <Ionicons name="logo-google" size={20} color={c.text} />
                <Text style={[styles.label, { color: c.text }]}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 20, marginTop: 4 },
    divider: { height: 2, borderRadius: 1, marginHorizontal: 4 },
    button: {
        alignSelf: "center",
        width: "78%",
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    label: { fontSize: 14, fontWeight: "600" },
});