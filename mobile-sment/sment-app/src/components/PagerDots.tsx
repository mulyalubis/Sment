import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AuthMode } from "./AuthForm";

type Props = {
    mode: AuthMode;
    onChange: (mode: AuthMode) => void;
};

const ITEMS: { key: AuthMode; label: string }[] = [
    { key: "login", label: "Halaman masuk" },
    { key: "register", label: "Halaman daftar" },
];

// Dua garis indikator: kiri = Login, kanan = Register. Bisa diketuk.
export default function PagerDots({ mode, onChange }: Props) {
    const c = useTheme();
    return (
        <View style={styles.row} accessibilityRole="tablist">
            {ITEMS.map((i) => {
                const active = i.key === mode;
                return (
                    <Pressable
                        key={i.key}
                        onPress={() => onChange(i.key)}
                        hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
                        accessibilityRole="tab"
                        accessibilityLabel={i.label}
                        accessibilityState={{ selected: active }}
                    >
                        <View style={[styles.dash, { backgroundColor: active ? c.accent : c.border }]} />
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "center", gap: 32 },
    dash: { width: 56, height: 4, borderRadius: 2 },
});