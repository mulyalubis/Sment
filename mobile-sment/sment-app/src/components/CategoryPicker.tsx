import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_META, WASTE_CATEGORIES, WasteCategory } from "../constants/categories";
import { useTheme } from "../hooks/useTheme";

type Props = {
    value?: WasteCategory;
    onChange: (category: WasteCategory) => void;
    hint?: string; // mis. "Terdeteksi AI: Plastik (90%)"
    error?: string;
};

export default function CategoryPicker({ value, onChange, hint, error }: Props) {
    const c = useTheme();

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                {WASTE_CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const selected = cat === value;
                    return (
                        <Pressable
                            key={cat}
                            onPress={() => onChange(cat)}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: selected ? c.leaf : c.surfaceAlt,
                                    borderColor: selected ? c.leaf : c.border,
                                },
                            ]}
                        >
                            <Ionicons name={meta.icon} size={18} color={selected ? c.bg : c.textMuted} />
                            <Text style={[styles.chipText, { color: selected ? c.bg : c.text }]}>{meta.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
            {!!hint && <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text>}
            {!!error && <Text style={[styles.error, { color: c.danger }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 8 },
    row: { flexDirection: "row", gap: 8 },
    chip: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 46,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    chipText: { fontSize: 14, fontWeight: "700" },
    hint: { fontSize: 12 },
    error: { fontSize: 12 },
});