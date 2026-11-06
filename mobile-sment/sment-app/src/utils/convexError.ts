import { ConvexError } from "convex/values";

// Mengambil pesan error yang aman ditampilkan ke user.
// - ConvexError dari server: pesan ada di `e.data` (bukan `e.message`).
// - Error generik server ("Server Error", "[CONVEX ...]") diganti pesan umum.
// - Gangguan jaringan diberi pesan sendiri.
export function convexErrorMessage(
    e: unknown,
    fallback = "Terjadi kesalahan. Coba lagi."
): string {
    if (e instanceof ConvexError) {
        return typeof e.data === "string" ? e.data : fallback;
    }

    if (e instanceof Error) {
        const msg = e.message ?? "";
        if (/network request failed|failed to fetch|timed out/i.test(msg)) {
            return "Tidak ada koneksi internet. Periksa jaringan Anda.";
        }
        if (/\[CONVEX|server error|request id/i.test(msg)) return fallback;
        if (msg) return msg; // pesan buatan sendiri, mis. "Upload foto gagal."
    }

    return fallback;
}