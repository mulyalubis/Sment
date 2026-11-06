import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type Props = { title: string; subtitle: string };

export default function AuthHeader({ title, subtitle }: Props) {
    const c = useTheme();
    return (
        <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: c.link }]}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { alignItems: "center", gap: 8, paddingHorizontal: 24 },
    title: { fontSize: 36, fontWeight: "800", letterSpacing: -0.8, textAlign: "center" },
    subtitle: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});