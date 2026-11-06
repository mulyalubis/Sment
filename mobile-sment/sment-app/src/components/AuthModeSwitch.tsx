import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AuthMode } from "./AuthForm";

type Props = {
    mode: AuthMode;
    onChange: (mode: AuthMode) => void;
};

const PADDING = 4;

const OPTIONS: { key: AuthMode; label: string }[] = [
    { key: "login", label: "Login" },
    { key: "register", label: "Register" },
];

export default function AuthModeSwitch({ mode, onChange }: Props) {
    const c = useTheme();
    const [width, setWidth] = useState(0);
    const progress = useRef(new Animated.Value(mode === "login" ? 0 : 1)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: mode === "login" ? 0 : 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [mode, progress]);

    const thumbWidth = Math.max((width - PADDING * 2) / 2, 0);
    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, thumbWidth],
    });

    const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

    return (
        <View
            onLayout={onLayout}
            style={[styles.track, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
            accessibilityRole="tablist"
        >
            {/* Indikator oranye yang bergeser */}
            <Animated.View
                style={[
                    styles.thumb,
                    { width: thumbWidth, backgroundColor: c.accent, transform: [{ translateX }] },
                ]}
            />

            {OPTIONS.map((o) => {
                const active = o.key === mode;
                return (
                    <Pressable
                        key={o.key}
                        onPress={() => onChange(o.key)}
                        style={styles.option}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                    >
                        <Text style={[styles.label, { color: active ? c.onAccent : c.textMuted }]}>
                            {o.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: "row",
        height: 52,
        borderRadius: 18,
        borderWidth: 1,
        padding: PADDING,
    },
    thumb: {
        position: "absolute",
        top: PADDING,
        left: PADDING,
        bottom: PADDING,
        borderRadius: 14,
    },
    option: { flex: 1, alignItems: "center", justifyContent: "center" },
    label: { fontSize: 15, fontWeight: "800" },
});