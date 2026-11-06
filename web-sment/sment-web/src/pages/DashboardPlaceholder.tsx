import { useAuthActions } from "@convex-dev/auth/react";
import Button from "../components/Button";

type Props = { name: string };

// Sementara. Diganti dengan dashboard statistik, daftar laporan, dan manajemen user.
export default function DashboardPlaceholder({ name }: Props) {
    const { signOut } = useAuthActions();

    return (
        <div className="min-h-dvh">
            <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
                <p className="text-lg font-extrabold text-ink">
                    Management <span className="text-leaf">sment-app</span>
                </p>
                <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-muted sm:inline">{name}</span>
                    <Button variant="ghost" onClick={() => void signOut()}>
                        Keluar
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-10">
                <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
                <p className="mt-2 text-muted">Login berhasil. Halaman dashboard akan dibuat berikutnya.</p>
            </main>
        </div>
    );
}
