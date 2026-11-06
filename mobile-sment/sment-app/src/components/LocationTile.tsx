import React from "react";
import { Linking, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = {
    latitude: number;
    longitude: number;
    label: string;
    size?: number;
};

export default function LocationTile({ latitude, longitude, label, size = 92 }: Props) {
    const c = useTheme();

    const openMap = () => {
        Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        );
    };

    return (
        <Pressable
            onPress={openMap}
            accessibilityRole="link"
            accessibilityLabel={`Buka peta: ${label}`}
            style={({ pressed }) => [
                styles.tile,
                {
                    width: size,
                    height: size,
                    backgroundColor: c.surfaceAlt,
                    borderColor: c.border,
                    opacity: pressed ? 0.8 : 1,
                },
            ]}
        >
            <Ionicons name="location" size={20} color={c.leaf} />
            <Text style={[styles.label, { color: c.text }]} numberOfLines={3}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    label: { fontSize: 11, lineHeight: 14, textAlign: "center", fontWeight: "600" },
});