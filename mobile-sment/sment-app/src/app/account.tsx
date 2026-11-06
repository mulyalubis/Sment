import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AccountScreen from "../screens/AccountScreen";
import OtpScreen from "../screens/OtpScreen";
import { authErrorMessage } from "../utils/authError";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Account() {
    const router = useRouter();
    const { signIn } = useAuthActions();
    // Bisa dibuka langsung ke halaman daftar: router.push("/account?mode=register")
    const { mode } = useLocalSearchParams<{ mode?: string }>();

    // Diisi setelah register/login yang butuh verifikasi email -> tampilkan layar OTP
    const [pending, setPending] = useState<{ email: string; password: string } | null>(null);

    if (pending) {
        return (
            <OtpScreen
                email={pending.email}
                onSubmit={async (code) => {
                    try {
                        // Kalau berhasil, AuthGate di _layout.tsx otomatis pindah ke Beranda
                        await signIn("password", {
                            email: pending.email,
                            code,
                            flow: "email-verification",
                        });
                    } catch {
                        throw new Error("Kode salah atau sudah kedaluwarsa.");
                    }
                }}
                onResend={async () => {
                    try {
                        // Login ulang pada akun yang belum terverifikasi memicu kode baru
                        await signIn("password", {
                            email: pending.email,
                            password: pending.password,
                            flow: "signIn",
                        });
                    } catch (e) {
                        throw new Error(authErrorMessage(e, "login"));
                    }
                }}
                onBack={() => setPending(null)}
            />
        );
    }

    // Setelah berhasil, AuthGate di _layout.tsx otomatis memindahkan ke Beranda,
    // jadi tidak perlu router.replace("/") di sini.
    return (
        <AccountScreen
            initialMode={mode === "register" ? "register" : "login"}
            onLogin={async (values) => {
                try {
                    const { signingIn } = await signIn("password", {
                        email: values.email,
                        password: values.password,
                        flow: "signIn",
                    });
                    // Akun lama yang belum verifikasi email: kode dikirim, minta OTP
                    if (!signingIn) {
                        setPending({ email: values.email, password: values.password });
                    }
                } catch (e) {
                    throw new Error(authErrorMessage(e, "login"));
                }
            }}
            onRegister={async (values) => {
                try {
                    const { signingIn } = await signIn("password", {
                        name: values.name,
                        email: values.email,
                        password: values.password,
                        flow: "signUp",
                    });
                    // signingIn false = kode OTP sudah dikirim ke email
                    if (!signingIn) {
                        setPending({ email: values.email, password: values.password });
                    }
                } catch (e) {
                    throw new Error(authErrorMessage(e, "register"));
                }
            }}
            onGoogle={() => {
                Alert.alert("Belum tersedia", "Masuk dengan Google belum dikonfigurasi.");
            }}
            onCreateReport={() => router.push("/reports/new")}
            onOpenHome={() => router.replace("/")}
            onOpenHistory={() => router.replace("/history")}
        />
    );
}