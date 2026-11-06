import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = { uri?: string; size?: number };

export default function ReportPhoto({ uri, size = 92 }: Props) {
    const c = useTheme();
    if (uri) {
        return <Image source={{ uri }} style={[styles.base, { width: size, height: size }]} />;
    }
    return (
        <View
            style={[
                styles.base,
                styles.empty,
                { width: size, height: size, backgroundColor: c.surfaceAlt },
            ]}
        >
            <Ionicons name="image-outline" size={26} color={c.textMuted} />
        </View>
    );
}

const styles = StyleSheet.create({
    base: { borderRadius: 14 },
    empty: { alignItems: "center", justifyContent: "center" },
});