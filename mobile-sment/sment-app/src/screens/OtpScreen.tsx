import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Props = {
    email: string;
    onSubmit: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
};

const RESEND_SECONDS = 60;

export default function OtpScreen({ email, onSubmit, onResend, onBack }: Props) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(RESEND_SECONDS);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const submit = async () => {
        if (code.length !== 6 || loading) return;
        setLoading(true);
        setError(null);
        try {
            await onSubmit(code);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Verifikasi gagal.");
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        if (cooldown > 0) return;
        setError(null);
        setInfo(null);
        try {
            await onResend();
            setInfo("Kode baru sudah dikirim.");
            setCooldown(RESEND_SECONDS);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal mengirim ulang kode.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Text style={styles.title}>Verifikasi email</Text>
            <Text style={styles.subtitle}>
                Masukkan kode 6 digit yang dikirim ke {email}
            </Text>

            <TextInput
                style={styles.input}
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                autoFocus
                textContentType="oneTimeCode"
            />

            {error && <Text style={styles.error}>{error}</Text>}
            {info && <Text style={styles.info}>{info}</Text>}

            <Pressable
                style={[styles.button, (code.length !== 6 || loading) && styles.buttonDisabled]}
                onPress={submit}
                disabled={code.length !== 6 || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Verifikasi</Text>
                )}
            </Pressable>

            <Pressable onPress={resend} disabled={cooldown > 0}>
                <Text style={[styles.link, cooldown > 0 && styles.linkDisabled]}>
                    {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : "Kirim ulang kode"}
                </Text>
            </Pressable>

            <Pressable onPress={onBack}>
                <Text style={styles.link}>Kembali</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, gap: 14, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
    subtitle: { textAlign: "center", color: "#555" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: 14,
        fontSize: 26,
        letterSpacing: 8,
        textAlign: "center",
    },
    error: { color: "#c0392b", textAlign: "center" },
    info: { color: "#2e7d32", textAlign: "center" },
    button: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 12, alignItems: "center" },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    link: { color: "#2e7d32", textAlign: "center", fontWeight: "500" },
    linkDisabled: { color: "#999" },
});