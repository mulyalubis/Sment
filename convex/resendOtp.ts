import { Email } from "@convex-dev/auth/providers/Email";

// Kode OTP 6 digit, berlaku 15 menit
export const ResendOTP = Email({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: 60 * 15,

    async generateVerificationToken() {
        const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
        return n.toString().padStart(6, "0");
    },

    async sendVerificationRequest({ identifier: email, provider, token }) {
        // Panggil REST API Resend langsung dengan fetch (tidak perlu paket tambahan)
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${provider.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // Ganti dengan alamat di domain Anda setelah domain diverifikasi di Resend
                from: "Pengelolaan Sampah <onboarding@resend.dev>",
                to: [email],
                subject: "Kode verifikasi akun Anda",
                text: `Kode verifikasi Anda: ${token}\n\nKode berlaku 15 menit. Abaikan email ini jika Anda tidak mendaftar.`,
            }),
        });
        if (!res.ok) {
            throw new Error(`Gagal kirim email: ${await res.text()}`);
        }
    },
});