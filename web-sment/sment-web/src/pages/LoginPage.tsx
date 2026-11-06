import { useState } from "react";
import type { SubmitEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Button from "../components/Button";
import TextField from "../components/TextField";
import { authErrorMessage } from "../utils/authError";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

export default function LoginPage() {
    const { signIn } = useAuthActions();

    const [step, setStep] = useState<"credentials" | "otp">("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [codeError, setCodeError] = useState("");
    const [formError, setFormError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const normalizedEmail = email.trim().toLowerCase();

    // Langkah 1: email + password
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError("");

        const next: typeof errors = {};
        if (!EMAIL_RE.test(email.trim())) next.email = "Format email tidak valid.";
        if (password.length < 8) next.password = "Password minimal 8 karakter.";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setLoading(true);
        try {
            const { signingIn } = await signIn("password", {
                email: normalizedEmail,
                password,
                flow: "signIn",
            });
            // signingIn false = email belum terverifikasi, kode OTP sudah dikirim.
            if (!signingIn) {
                setCode("");
                setCodeError("");
                setInfo("");
                setStep("otp");
            }
            // Kalau true: App.tsx otomatis memindahkan ke dashboard (atau menolak jika bukan admin).
        } catch (err) {
            setFormError(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Langkah 2: kode OTP dari email
    const handleVerify = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCodeError("");
        setInfo("");

        if (!CODE_RE.test(code)) {
            setCodeError("Masukkan 6 digit kode dari email.");
            return;
        }

        setLoading(true);
        try {
            await signIn("password", {
                email: normalizedEmail,
                code,
                flow: "email-verification",
            });
        } catch {
            setCodeError("Kode salah atau sudah kedaluwarsa.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setCodeError("");
        setInfo("");
        try {
            // Login ulang pada akun yang belum terverifikasi memicu kode baru.
            await signIn("password", { email: normalizedEmail, password, flow: "signIn" });
            setInfo("Kode baru sudah dikirim ke email Anda.");
        } catch (err) {
            setCodeError(authErrorMessage(err));
        }
    };

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
            <header className="max-w-lg text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    Management <span className="text-leaf">sment-app</span>
                </h1>
                <p className="mt-3 text-base text-muted sm:text-lg">
                    Mengelola semua laporan dari sment-app dan membersihkan lingkungan
                </p>
            </header>

            {step === "credentials" ? (
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8"
                >
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="admin@email.com"
                        autoComplete="email"
                        autoFocus
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="Minimal 8 karakter"
                        autoComplete="current-password"
                    />

                    {formError && (
                        <p role="alert" className="text-sm text-danger">
                            {formError}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" loading={loading}>
                            Masuk
                        </Button>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={handleVerify}
                    noValidate
                    className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8"
                >
                    <div>
                        <h2 className="text-lg font-bold text-ink">Verifikasi email</h2>
                        <p className="mt-1 text-sm text-muted">
                            Masukkan kode 6 digit yang dikirim ke {normalizedEmail}.
                        </p>
                    </div>

                    <TextField
                        label="Kode verifikasi"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        error={codeError}
                        placeholder="000000"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                    />

                    {info && <p className="text-sm text-leaf">{info}</p>}

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setStep("credentials")}
                            className="text-sm font-medium text-muted hover:text-ink"
                        >
                            Kembali
                        </button>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-sm font-medium text-leaf hover:underline"
                            >
                                Kirim ulang kode
                            </button>
                            <Button type="submit" loading={loading}>
                                Verifikasi
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </main>
    );
}