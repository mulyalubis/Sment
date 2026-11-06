// Ditampilkan kalau konfigurasi belum lengkap, supaya halaman tidak kosong tanpa penjelasan.
// Memakai style inline agar tetap terbaca walaupun Tailwind bermasalah.
export default function ConfigError() {
    return (
        <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24, lineHeight: 1.6 }}>
            <h1 style={{ fontSize: 22 }}>Konfigurasi belum lengkap</h1>
            <p>
                Variabel <code>VITE_CONVEX_URL</code> belum diisi. Buat file <code>web/.env</code> dengan isi:
            </p>
            <pre style={{ padding: 12, background: "#00000014", borderRadius: 8, overflowX: "auto" }}>
                VITE_CONVEX_URL=https://nama-deployment-kamu.convex.cloud
            </pre>
            <p>
                Lalu hentikan server dengan <code>Ctrl+C</code> dan jalankan lagi <code>npm run dev</code>. File{" "}
                <code>.env</code> hanya dibaca saat server dimulai.
            </p>
        </main>
    );
}