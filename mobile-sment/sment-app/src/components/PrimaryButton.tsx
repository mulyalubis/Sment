import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";

type Props = {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ label, onPress, loading, disabled, style }: Props) {
    const c = useTheme();
    const inactive = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!inactive, busy: !!loading }}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: c.accent, opacity: inactive ? 0.6 : pressed ? 0.85 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={c.onAccent} />
            ) : (
                <Text style={[styles.label, { color: c.onAccent }]}>{label}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    label: { fontSize: 16, fontWeight: "800" },
});