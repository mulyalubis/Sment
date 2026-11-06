import { ConvexError } from "convex/values";

export function authErrorMessage(e: unknown): string {
    console.error("[auth error]", e);

    if (e instanceof ConvexError && typeof e.data === "string") return e.data;

    const raw = e instanceof Error ? e.message : String(e);

    let friendly: string;
    if (/InvalidAccountId|InvalidSecret/i.test(raw)) {
        friendly = "Email atau password salah.";
    } else if (/TooManyFailedAttempts/i.test(raw)) {
        friendly = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    } else if (/failed to fetch|network|timed out/i.test(raw)) {
        friendly = "Tidak ada koneksi internet. Periksa jaringan Anda.";
    } else {
        friendly = "Gagal masuk. Periksa email dan password Anda.";
    }

    return import.meta.env.DEV ? `${friendly} [dev] ${raw.slice(0, 200)}` : friendly;
}
