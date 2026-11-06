import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { AuthMode } from "./AuthForm";

// Tipe instance ScrollView (punya scrollTo) yang kompatibel dengan versi RN baru.
type ScrollViewHandle = React.ComponentRef<typeof ScrollView>;

type Props = {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
    login: React.ReactNode; // halaman kiri
    register: React.ReactNode; // halaman kanan
};

// Dua halaman bersebelahan yang bisa digeser: Login (kiri) dan Register (kanan).
export default function AuthPager({ mode, onModeChange, login, register }: Props) {
    const { width } = useWindowDimensions();
    const ref = useRef<ScrollViewHandle>(null);
    const ready = useRef(false);

    const offsetFor = (m: AuthMode) => (m === "login" ? 0 : width);

    // Geser otomatis saat mode berubah (mis. dari tautan oranye).
    useEffect(() => {
        if (!ready.current) return;
        ref.current?.scrollTo({ x: offsetFor(mode), animated: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, width]);

    return (
        <ScrollView
            ref={ref}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.pager}
            onLayout={() => {
                // Posisi awal tanpa animasi (mis. langsung ke Register).
                if (!ready.current) {
                    ready.current = true;
                    ref.current?.scrollTo({ x: offsetFor(mode), animated: false });
                }
            }}
            onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                onModeChange(index === 0 ? "login" : "register");
            }}
        >
            <View style={[styles.page, { width }]}>{login}</View>
            <View style={[styles.page, { width }]}>{register}</View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pager: { flexGrow: 0 },
    page: { paddingHorizontal: 24, gap: 20 },
});