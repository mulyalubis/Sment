import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import PrimaryButton from "./PrimaryButton";
import TextField, { TextInputHandle } from "./TextField";

export type AuthMode = "login" | "register";

export type AuthValues = { name: string; email: string; password: string };

type Props = {
    mode: AuthMode;
    onSubmit: (values: AuthValues) => Promise<void>;
};

type Errors = Partial<Record<keyof AuthValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kartu berisi kolom isian dan tombol utama.
export default function AuthForm({ mode, onSubmit }: Props) {
    const c = useTheme();
    const isRegister = mode === "register";

    const [values, setValues] = useState<AuthValues>({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const emailRef = useRef<TextInputHandle>(null);
    const passwordRef = useRef<TextInputHandle>(null);

    const set = (key: keyof AuthValues) => (text: string) =>
        setValues((v) => ({ ...v, [key]: text }));

    const validate = (): boolean => {
        const next: Errors = {};
        if (isRegister && values.name.trim().length < 2) next.name = "Nama minimal 2 karakter.";
        if (!EMAIL_RE.test(values.email.trim())) next.email = "Format email tidak valid.";
        if (values.password.length < 8) next.password = "Password minimal 8 karakter.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setFormError("");
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit({
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
            });
        } catch (e: any) {
            setFormError(e?.message ?? "Terjadi kesalahan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            {isRegister && (
                <TextField
                    label="Nama"
                    icon="person-outline"
                    value={values.name}
                    onChangeText={set("name")}
                    error={errors.name}
                    autoCapitalize="words"
                    autoComplete="name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                />
            )}

            <TextField
                ref={emailRef}
                label="Email"
                icon="mail-outline"
                value={values.email}
                onChangeText={set("email")}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <TextField
                ref={passwordRef}
                label="Password"
                icon="lock-closed-outline"
                value={values.password}
                onChangeText={set("password")}
                error={errors.password}
                secure
                autoCapitalize="none"
                autoComplete={isRegister ? "new-password" : "current-password"}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
            />

            {!!formError && (
                <Text style={[styles.formError, { color: c.danger }]} accessibilityLiveRegion="polite">
                    {formError}
                </Text>
            )}

            <PrimaryButton
                label={isRegister ? "Daftar Akun" : "Masuk"}
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        gap: 16,
    },
    formError: { fontSize: 13, textAlign: "center" },
    button: { alignSelf: "center", minWidth: 200, paddingHorizontal: 32, marginTop: 4 },
});