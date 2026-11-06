import { ConvexError } from "convex/values";

// Menerjemahkan error login/daftar ke pesan untuk user.
// Saat development (__DEV__), penyebab asli dari server ikut ditampilkan dan dicetak
// di terminal Metro, supaya masalah seperti konfigurasi auth mudah dilacak.
export function authErrorMessage(e: unknown, mode: "login" | "register"): string {
    console.log("[auth error]", mode, e);

    if (e instanceof ConvexError && typeof e.data === "string") return e.data;

    const raw = e instanceof Error ? e.message : String(e);

    let friendly: string;
    if (/already exists/i.test(raw)) {
        friendly = "Email sudah terdaftar. Silakan masuk.";
    } else if (/InvalidAccountId|InvalidSecret/i.test(raw)) {
        friendly = "Email atau password salah.";
    } else if (/TooManyFailedAttempts/i.test(raw)) {
        friendly = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    } else if (/network request failed|failed to fetch|timed out/i.test(raw)) {
        friendly = "Tidak ada koneksi internet. Periksa jaringan Anda.";
    } else {
        friendly =
            mode === "login"
                ? "Gagal masuk. Periksa email dan password Anda."
                : "Pendaftaran gagal. Coba lagi.";
    }

    return __DEV__ ? `${friendly}\n\n[dev] ${raw.slice(0, 300)}` : friendly;
}