import React, { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import AuthForm, { AuthMode, AuthValues } from "../components/AuthForm";
import AuthHeader from "../components/AuthHeader";
import AuthLayout from "../components/AuthLayout";
import AuthPager from "../components/AuthPager";
import BottomBar, { TabKey } from "../components/BottomBar";
import PagerDots from "../components/PagerDots";
import { useKeyboardVisible } from "../hooks/useKeyboardVisible";
import { useTheme } from "../hooks/useTheme";

type Props = {
    initialMode?: AuthMode;
    onLogin?: (values: AuthValues) => Promise<void>;
    onRegister?: (values: AuthValues) => Promise<void>;
    onGoogle?: (mode: AuthMode) => void;
    onCreateReport?: () => void;
    onOpenHome?: () => void;
    onOpenHistory?: () => void;
};

const fakeRequest = async () => {
    await new Promise((r) => setTimeout(r, 600));
};

export default function AccountScreen({
    initialMode = "login",
    onLogin = fakeRequest,
    onRegister = fakeRequest,
    onCreateReport = () => { },
    onOpenHome = () => { },
    onOpenHistory = () => { },
}: Props) {
    const c = useTheme();
    const keyboardVisible = useKeyboardVisible();
    const [mode, setMode] = useState<AuthMode>(initialMode);

    const changeMode = (next: AuthMode) => {
        Keyboard.dismiss();
        setMode(next);
    };

    const handleTab = (key: TabKey) => {
        if (key === "home") onOpenHome();
        if (key === "history") onOpenHistory();
    };

    return (
        <View style={[styles.screen, { backgroundColor: c.bg }]}>
            <AuthLayout>
                <AuthHeader
                    title="sment-app"
                    subtitle="Laporkan sampah di sekitar Anda, pantau sampai tuntas."
                />

                <AuthPager
                    mode={mode}
                    onModeChange={setMode}
                    login={
                        <>
                            <AuthForm mode="login" onSubmit={onLogin} />
                        </>
                    }
                    register={
                        <>
                            <AuthForm mode="register" onSubmit={onRegister} />
                        </>
                    }
                />

                <PagerDots mode={mode} onChange={changeMode} />
            </AuthLayout>

            {/* Bottom bar disembunyikan hanya saat keyboard terbuka */}
            {!keyboardVisible && (
                <BottomBar active="profile" onTab={handleTab} onCreate={onCreateReport} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
});