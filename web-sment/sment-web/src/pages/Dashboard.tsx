import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
// Dari src/pages/ ke root proyek: 4x "../" (web/sment/src/pages -> root).
import { api } from "../../../../convex/_generated/api";
import Sidebar from "../components/Sidebar";

// Warna dan label sama dengan STATUS_META di aplikasi mobile.
const STATUS = [
    { key: "pending", label: "Pending", color: "#9AA5A3" },
    { key: "in_progress", label: "In Progress", color: "#4BA3E3" },
    { key: "completed", label: "Completed", color: "#3DBE7A" },
    { key: "rejected", label: "Rejected", color: "#E5604F" },
] as const;

const RANGES = [7, 14, 30] as const;

const card = "min-w-0 rounded-3xl border border-line bg-surface p-5";

const shortDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

export default function Dashboard() {
    const me = useQuery(api.users.me);
    const isAdmin = me?.role === "admin";
    const [days, setDays] = useState<(typeof RANGES)[number]>(14);

    // "skip" supaya query khusus admin tidak dipanggil oleh akun non-admin.
    const stats = useQuery(api.reports.statsAll, isAdmin ? {} : "skip");
    const timeline = useQuery(api.reports.timeline, isAdmin ? { days } : "skip");
    const completed = useQuery(
        api.reports.listAll,
        isAdmin ? { status: "completed" } : "skip",
    );

    if (me === undefined) {
        return <div className="grid min-h-dvh place-items-center text-muted">Memuat…</div>;
    }
    if (me === null) {
        return (
            <div className="grid min-h-dvh place-items-center text-muted">
                Silakan masuk terlebih dahulu.
            </div>
        );
    }
    if (!isAdmin) {
        return (
            <div className="grid min-h-dvh place-items-center text-muted">
                Akun ini tidak punya akses admin.
            </div>
        );
    }

    const chartData = (timeline ?? []).map((d) => ({ label: shortDate(d.date), count: d.count }));
    const firstName = (me.name ?? me.email ?? "Admin").split(" ")[0];

    return (
        <Sidebar user={me} heading={`Sudah siap memanage, ${firstName}?`}>
            {/* Grafik laporan */}
            <section className={`${card} flex h-85 flex-col`}>
                <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold text-ink">Grafik laporan</h2>
                        <p className="mt-0.5 text-[13px] text-muted">
                            {stats ? `${stats.total} laporan secara keseluruhan` : "Memuat data…"}
                        </p>
                    </div>
                    <div className="flex gap-1.5" role="group" aria-label="Rentang waktu">
                        {RANGES.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setDays(r)}
                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] ${r === days
                                    ? "border-leaf bg-leaf text-white"
                                    : "border-line text-muted hover:text-ink"
                                    }`}
                            >
                                {r} hari
                            </button>
                        ))}
                    </div>
                </div>

                {/* text-muted: warna teks sumbu dan garis grid diambil dari currentColor */}
                <div className="min-h-0 flex-1 text-muted">
                    <ResponsiveContainer width="100%" height="100%" debounce={250}>
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3DBE7A" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#3DBE7A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="currentColor"
                                strokeOpacity={0.2}
                            />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "currentColor" }}
                                interval="preserveStartEnd"
                                minTickGap={24}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "currentColor" }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) =>
                                    active && payload?.length ? (
                                        <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm">
                                            <p className="font-semibold">{label}</p>
                                            <p className="text-muted">{payload[0].value} laporan</p>
                                        </div>
                                    ) : null
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Laporan"
                                stroke="#3DBE7A"
                                strokeWidth={2}
                                fill="url(#reportFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                {/* Laporan pengguna yang sudah completed */}
                <section className={card}>
                    <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                        <h2 className="text-base font-bold text-ink">Laporan pengguna selesai</h2>
                        <Link to="/pengguna" className="text-[13px] font-semibold text-leaf hover:underline">
                            Lihat semua
                        </Link>
                    </div>

                    {completed === undefined ? (
                        <p className="text-[13px] text-muted">Memuat data…</p>
                    ) : completed.length === 0 ? (
                        <p className="text-[13px] text-muted">Belum ada laporan yang selesai.</p>
                    ) : (
                        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                            {completed.slice(0, 5).map((r) => (
                                <li
                                    key={r.id}
                                    className="flex items-center gap-3 rounded-2xl border border-line bg-ink/5 px-3 py-2.5"
                                >
                                    <span
                                        className="inline-flex h-8.5 w-8.5 flex-none items-center justify-center rounded-full bg-leaf text-sm font-bold text-white"
                                        aria-hidden="true"
                                    >
                                        {(r.reporterName ?? "Admin").charAt(0).toUpperCase()}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <strong className="text-ink">{r.reporterName}</strong>
                                        <span className="truncate text-[13px] text-muted">{r.title}</span>
                                    </div>
                                    <div className="flex flex-none flex-col items-end gap-1">
                                        <span className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-leaf">
                                            {r.category}
                                        </span>
                                        <span className="text-[13px] text-muted">{shortDate(r.createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Status laporan */}
                <section className={card}>
                    <h2 className="text-base font-bold text-ink text-center">Status laporan</h2>
                    <div className="mt-3.5 grid grid-cols-2 gap-3">
                        {STATUS.map((s) => (
                            <div
                                key={s.key}
                                className="relative flex flex-col items-center gap-0.5 rounded-2xl border border-line bg-ink/5 px-2 pb-3.5 pt-4.5"
                            >
                                <span
                                    className="absolute right-2.5 top-2.5 h-2.25 w-2.25 rounded-full"
                                    style={{ background: s.color }}
                                />
                                <span className="text-[28px] font-extrabold leading-tight text-ink">
                                    {stats ? stats.byStatus[s.key] : "–"}
                                </span>
                                <span className="text-[13px] text-muted">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Sidebar>
    );
}