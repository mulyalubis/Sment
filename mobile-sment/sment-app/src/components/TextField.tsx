import React, { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

// Tipe instance TextInput (punya focus(), blur(), dst.) yang kompatibel dengan versi RN baru.
export type TextInputHandle = React.ComponentRef<typeof TextInput>;

type Props = TextInputProps & {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap; // ikon di sisi kiri
    error?: string;
    secure?: boolean; // tampilkan tombol lihat/sembunyikan password
};

const TextField = forwardRef<TextInputHandle, Props>(function TextField(
    { label, icon, error, secure, style, onFocus, onBlur, ...rest },
    ref
) {
    const c = useTheme();
    const [hidden, setHidden] = useState(!!secure);
    const [focused, setFocused] = useState(false);
    const multiline = !!rest.multiline;

    const borderColor = error ? c.danger : focused ? c.leaf : c.border;

    return (
        <View style={styles.wrap}>
            <Text style={[styles.label, { color: c.text }]}>{label}</Text>
            <View
                style={[
                    styles.box,
                    multiline && styles.boxMulti,
                    { backgroundColor: c.surfaceAlt, borderColor },
                ]}
            >
                {!!icon && <Ionicons name={icon} size={20} color={c.textMuted} />}
                <TextInput
                    ref={ref}
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={secure && hidden}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    style={[styles.input, multiline && styles.inputMulti, { color: c.text }, style]}
                    {...rest}
                />
                {secure && (
                    <Pressable
                        onPress={() => setHidden((h) => !h)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={hidden ? "Tampilkan password" : "Sembunyikan password"}
                    >
                        <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={20} color={c.textMuted} />
                    </Pressable>
                )}
            </View>
            {!!error && <Text style={[styles.error, { color: c.danger }]}>{error}</Text>}
        </View>
    );
});

export default TextField;

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    label: { fontSize: 14, fontWeight: "600" },
    box: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 2,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 50,
    },
    boxMulti: { height: undefined, minHeight: 112, alignItems: "flex-start", paddingVertical: 12 },
    input: { flex: 1, fontSize: 16, height: "100%" },
    inputMulti: { height: undefined, minHeight: 84, textAlignVertical: "top" },
    error: { fontSize: 12 },
});