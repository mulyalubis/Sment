import React from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";

type Props = { children: React.ReactNode };

// Pembungkus layar auth: safe area, keyboard handling, dan scroll vertikal.
// Ruang di bawah disisakan untuk BottomBar.
export default function AuthLayout({ children }: Props) {
    const c = useTheme();
    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={["top"]}>
            <KeyboardAvoidingView style={styles.flex} behavior="padding">
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    flex: { flex: 1 },
    content: { flexGrow: 1, justifyContent: "center", gap: 28, paddingTop: 24, paddingBottom: 140 },
});