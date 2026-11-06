import { useAuthActions } from "@convex-dev/auth/react";
import Button from "../components/Button";

type Props = {
    name?: string | null;
    reason: "not-admin" | "not-found";
};

export default function AccessDeniedPage({ name, reason }: Props) {
    const { signOut } = useAuthActions();

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="max-w-md rounded-3xl border border-line bg-surface p-8 shadow-sm">
                <h1 className="text-xl font-extrabold text-ink">Akses ditolak</h1>
                <p className="mt-3 text-muted">
                    {reason === "not-admin"
                        ? `${name ? `Halo ${name}. ` : ""}Akun ini bukan admin. Gunakan aplikasi mobile sment-app untuk membuat dan memantau laporan.`
                        : "Data akun tidak ditemukan. Silakan keluar lalu masuk kembali."}
                </p>
                <div className="mt-6 flex justify-center">
                    <Button onClick={() => void signOut()}>Keluar</Button>
                </div>
            </div>
        </main>
    );
}
