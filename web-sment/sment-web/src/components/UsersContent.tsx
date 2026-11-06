import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { STATUS, STATUS_KEYS } from "../utils/reportMeta";
import { ROLES } from "../utils/userMeta";
import type { UserRole, UserRow } from "../utils/userMeta";

type Props = {
    users?: UserRow[];
    onChangeRole?: (user: UserRow, role: UserRole) => void;
    onSetDisabled?: (user: UserRow, disabled: boolean) => void;
};

type RoleFilter = UserRole | "all";

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// Ikon SVG sebaris (tanpa paket tambahan), warnanya mengikuti warna teks.
function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
    return (
        <svg
            className="flex-none"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const SearchIcon = () => (
    <Svg>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
    </Svg>
);

// Isi halaman Pengguna saja (toolbar + daftar). Bungkus dengan <Sidebar> di halaman yang memakainya.
export default function UsersContent({
    users = [],
    onChangeRole = () => { },
    onSetDisabled = () => { },
}: Props) {
    const [query, setQuery] = useState("");
    const [role, setRole] = useState<RoleFilter>("all");

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((u) => {
            if (role !== "all" && u.role !== role) return false;
            if (!q) return true;
            return [u.name ?? "", u.email ?? ""].some((text) => text.toLowerCase().includes(q));
        });
    }, [users, query, role]);

    const handleRole = (u: UserRow) => {
        const next: UserRole = u.role === "admin" ? "user" : "admin";
        const label = next === "admin" ? "admin" : "user biasa";
        if (!window.confirm(`Ubah ${u.name ?? u.email ?? "pengguna ini"} menjadi ${label}?`)) return;
        onChangeRole(u, next);
    };

    const handleDisabled = (u: UserRow) => {
        const name = u.name ?? u.email ?? "pengguna ini";
        const message = u.disabled
            ? `Aktifkan kembali akun ${name}?`
            : `Nonaktifkan akun ${name}? Laporannya tetap tersimpan, tetapi akun ini tidak bisa mengirim atau mengubah laporan.`;
        if (!window.confirm(message)) return;
        onSetDisabled(u, !u.disabled);
    };

    return (
        <>
            {/* Toolbar: pencarian + filter role */}
            <div className="flex flex-wrap items-center gap-2.5">
                {/* HP: kolom cari dan filter role bertumpuk, masing-masing selebar layar.
        Layar >= 640px: satu pil yang bergabung seperti sebelumnya. */}
                <div className="flex min-w-0 flex-1 basis-64 text-muted max-sm:basis-full max-sm:flex-col max-sm:gap-2.5 sm:h-11 sm:items-center sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:focus-within:border-leaf">
                    <div className="flex h-11 min-w-0 items-center max-sm:w-full max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-surface max-sm:focus-within:border-leaf sm:flex-1">
                        <span className="pl-4">
                            <SearchIcon />
                        </span>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari nama atau email"
                            aria-label="Cari pengguna"
                            className="h-full min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-muted"
                        />
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as RoleFilter)}
                        aria-label="Filter role"
                        className="h-11 cursor-pointer bg-transparent px-3 text-base font-semibold text-ink outline-none max-sm:w-full max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-surface max-sm:focus-visible:border-leaf sm:h-full sm:max-w-40 sm:rounded-r-2xl sm:border-l sm:border-line sm:text-sm"
                    >
                        <option value="all">Semua role</option>
                        {ROLES.map((r) => (
                            <option key={r.key} value={r.key}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Daftar pengguna */}
            <div className="flex flex-col gap-3.5">
                {visible.length === 0 && (
                    <p className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-muted">
                        {users.length === 0 ? "Belum ada pengguna." : "Tidak ada pengguna yang cocok."}
                    </p>
                )}

                {visible.map((u) => {
                    const display = u.name ?? u.email ?? "Tanpa nama";
                    return (
                        <article
                            key={u.id}
                            className={`flex gap-4 rounded-3xl border border-line bg-surface p-3.5 transition-opacity max-sm:flex-col sm:items-center sm:p-4 ${u.disabled ? "opacity-60" : ""
                                }`}
                        >
                            {/* Kiri: avatar, nama, email */}
                            <div className="flex min-w-0 flex-1 items-center gap-3.5">
                                <div className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full bg-leaf/15 text-lg font-bold text-leaf">
                                    {u.image ? (
                                        <img src={u.image} alt={display} className="h-full w-full object-cover" />
                                    ) : (
                                        display.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold text-ink sm:text-lg" title={display}>
                                        {display}
                                    </h3>
                                    {u.email && u.name && (
                                        <p className="truncate text-[13px] text-muted" title={u.email}>
                                            {u.email}
                                        </p>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                                        <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold">
                                            {u.role === "admin" ? "Admin" : "User"}
                                        </span>
                                        {u.isSelf && (
                                            <span className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-leaf">
                                                Anda
                                            </span>
                                        )}
                                        {u.disabled && (
                                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                                Nonaktif
                                            </span>
                                        )}
                                        <span>Daftar {formatDate(u.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: jumlah laporan + tombol, lalu hitungan per status */}
                            <div className="flex flex-none flex-col gap-2.5 max-sm:w-full sm:items-end">
                                {/* HP: label di baris sendiri, dua tombol di bawahnya berbagi lebar sama rata */}
                                <div className="flex flex-wrap items-center gap-2 max-sm:flex-col max-sm:items-stretch">
                                    <span className="text-[13px] font-semibold text-ink sm:mr-1">
                                        Jumlah laporan = {u.total}
                                    </span>
                                    <div className="flex gap-2 max-sm:w-full">
                                        <button
                                            type="button"
                                            onClick={() => handleRole(u)}
                                            disabled={u.isSelf}
                                            title={u.isSelf ? "Tidak bisa mengubah akun sendiri" : "Ubah role"}
                                            className="h-9 cursor-pointer rounded-full border border-line px-3.5 text-xs font-semibold text-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent max-sm:h-10 max-sm:flex-1"
                                        >
                                            {u.role === "admin" ? "Jadikan user" : "Jadikan admin"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDisabled(u)}
                                            disabled={u.isSelf}
                                            title={u.isSelf ? "Tidak bisa menonaktifkan akun sendiri" : undefined}
                                            className={`h-9 cursor-pointer rounded-full border px-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent max-sm:h-10 max-sm:flex-1 ${u.disabled
                                                ? "border-line text-ink hover:bg-ink/5"
                                                : "border-red-300 text-red-600 hover:bg-red-50"
                                                }`}
                                        >
                                            {u.disabled ? "Aktifkan" : "Nonaktifkan"}
                                        </button>
                                    </div>
                                </div>

                                {/* HP: empat kotak sama lebar dalam satu baris. Layar >= 640px: ukuran tetap seperti sebelumnya. */}
                                <div className="grid grid-cols-4 gap-2 max-sm:w-full sm:flex sm:flex-wrap">
                                    {STATUS_KEYS.map((key) => (
                                        <div
                                            key={key}
                                            title={STATUS[key].label}
                                            className="flex min-h-14 flex-col items-center justify-center rounded-2xl border border-line px-1 py-1.5 sm:w-18"
                                        >
                                            <span className="text-lg font-bold leading-none" style={{ color: STATUS[key].color }}>
                                                {u[key]}
                                            </span>
                                            <span className="mt-1 text-center text-[10px] font-semibold leading-tight text-muted">
                                                {STATUS[key].label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}