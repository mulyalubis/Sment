import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import ReportFormCard from "./ReportFormCard";
import { CATEGORIES, STATUS, STATUS_KEYS } from "../utils/reportMeta";
import type { ReportDraft, ReportRow, ReportStatus } from "../utils/reportMeta";

type Props = {
    reports?: ReportRow[];
    // Simpan laporan baru (tanpa id) atau perubahan laporan (dengan id). Lempar Error kalau gagal.
    onSaveReport?: (draft: ReportDraft, id?: string) => Promise<void>;
    onChangeStatus?: (report: ReportRow, status: ReportStatus) => void;
    onDeleteSelected?: (ids: string[]) => void;
};

type CategoryFilter = (typeof CATEGORIES)[number] | "all";

const mapsUrl = (r: ReportRow) => `https://www.google.com/maps?q=${r.latitude},${r.longitude}`;

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

const PlusIcon = () => (
    <Svg size={22}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </Svg>
);

const PinIcon = () => (
    <Svg size={16}>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
);

const ChevronIcon = () => (
    <Svg size={16}>
        <path d="m6 9 6 6 6-6" />
    </Svg>
);

const DotsIcon = () => (
    <Svg size={20}>
        <circle cx="12" cy="5" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1.7" fill="currentColor" stroke="none" />
    </Svg>
);

const ImageIcon = () => (
    <Svg size={28}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Svg>
);

// Isi halaman Laporan saja (toolbar + daftar). Bungkus dengan <Sidebar> di halaman yang memakainya.
export default function LaporanContent({
    reports = [],
    onSaveReport = async () => { },
    onChangeStatus = () => { },
    onDeleteSelected = () => { },
}: Props) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return reports.filter((r) => {
            if (category !== "all" && r.category !== category) return false;
            if (!q) return true;
            return [r.title, r.description, r.locationLabel, r.reporterName ?? ""].some((text) =>
                text.toLowerCase().includes(q),
            );
        });
    }, [reports, query, category]);

    // Hanya laporan yang sedang terlihat yang ikut dihapus, supaya tidak ada yang terhapus tanpa terlihat.
    const selectedIds = visible.filter((r) => selected.has(r.id)).map((r) => r.id);
    const allSelected = visible.length > 0 && selectedIds.length === visible.length;

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const toggleAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            for (const r of visible) {
                if (allSelected) next.delete(r.id);
                else next.add(r.id);
            }
            return next;
        });

    const startCreate = () => {
        setEditingId(null);
        setCreating(true);
    };

    const startEdit = (id: string) => {
        setCreating(false);
        setEditingId(id);
    };

    const startDeleteMode = () => {
        setCreating(false);
        setEditingId(null);
        setDeleteMode(true);
    };

    const exitDeleteMode = () => {
        setDeleteMode(false);
        setSelected(new Set());
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Hapus ${selectedIds.length} laporan? Tindakan ini tidak bisa dibatalkan.`)) return;
        onDeleteSelected(selectedIds);
        exitDeleteMode();
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex min-w-0 flex-1 basis-64 text-muted max-sm:basis-full max-sm:flex-col max-sm:gap-2.5 sm:h-11 sm:items-center sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:focus-within:border-leaf">
                    <div className="flex h-11 min-w-0 items-center max-sm:w-full max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-surface max-sm:focus-within:border-leaf sm:flex-1">
                        <span className="pl-4">
                            <SearchIcon />
                        </span>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari judul, alamat, atau pelapor"
                            aria-label="Cari laporan"
                            className="h-full min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-muted"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryFilter)}
                        aria-label="Filter kategori"
                        className="h-11 cursor-pointer bg-transparent px-3 text-base font-semibold text-ink outline-none max-sm:w-full max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-surface max-sm:focus-visible:border-leaf sm:h-full sm:max-w-40 sm:rounded-r-2xl sm:border-l sm:border-line sm:text-sm"
                    >
                        <option value="all">Semua kategori</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {deleteMode ? (
                    <>
                        <button
                            type="button"
                            onClick={exitDeleteMode}
                            className="h-11 flex-none cursor-pointer rounded-2xl border border-line px-4 font-semibold text-ink hover:bg-ink/5 max-sm:flex-1"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={selectedIds.length === 0}
                            className="h-11 flex-none cursor-pointer rounded-2xl bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600 max-sm:flex-1"
                        >
                            Hapus{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={startCreate}
                            disabled={creating}
                            title="Tambah laporan"
                            aria-label="Tambah laporan"
                            className="inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-2xl bg-leaf text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 max-sm:w-auto max-sm:flex-1 max-sm:gap-2 max-sm:px-4"
                        >
                            <PlusIcon />
                            {/* <span className="font-semibold sm:hidden">Tambah laporan</span> */}
                        </button>
                        <button
                            type="button"
                            onClick={startDeleteMode}
                            disabled={reports.length === 0}
                            className="h-11 flex-none cursor-pointer rounded-2xl border border-red-300 px-4 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent max-sm:flex-1"
                        >
                            Hapus
                        </button>
                    </>
                )}
            </div>

            {/* Petunjuk saat mode hapus */}
            {deleteMode && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                    <span>Centang laporan yang ingin dihapus, lalu tekan Hapus.</span>
                    <button
                        type="button"
                        onClick={toggleAll}
                        disabled={visible.length === 0}
                        className="cursor-pointer font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {allSelected ? "Batal pilih semua" : "Pilih semua"}
                    </button>
                </div>
            )}

            {/* Daftar laporan */}
            <div className="flex flex-col gap-3.5">
                {/* Kartu tambah laporan: muncul paling atas */}
                {creating && (
                    <ReportFormCard
                        key="new"
                        onSave={async (draft) => {
                            await onSaveReport(draft);
                            setCreating(false);
                        }}
                        onCancel={() => setCreating(false)}
                    />
                )}

                {visible.length === 0 && !creating && (
                    <p className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-muted">
                        {reports.length === 0 ? "Belum ada laporan masuk." : "Tidak ada laporan yang cocok."}
                    </p>
                )}

                {visible.map((r) => {
                    // Kartu yang sedang diedit berubah jadi form di tempat yang sama
                    if (editingId === r.id) {
                        return (
                            <ReportFormCard
                                key={r.id}
                                report={r}
                                onSave={async (draft) => {
                                    await onSaveReport(draft, r.id);
                                    setEditingId(null);
                                }}
                                onCancel={() => setEditingId(null)}
                            />
                        );
                    }

                    const isSelected = selected.has(r.id);
                    return (
                        <article
                            key={r.id}
                            className={`flex gap-4 rounded-3xl border bg-surface p-3.5 transition-colors max-sm:flex-col sm:p-4 ${isSelected ? "border-red-400" : "border-line"
                                }`}
                        >
                            {/* Foto */}
                            <div className="h-44 w-full flex-none overflow-hidden rounded-2xl bg-ink/5 sm:h-auto sm:min-h-36 sm:w-48 sm:self-stretch">
                                {r.photoUrl ? (
                                    <img src={r.photoUrl} alt={r.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full min-h-36 flex-col items-center justify-center gap-1.5 text-muted">
                                        <ImageIcon />
                                        <span className="text-xs font-semibold">Tidak ada foto</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                {/* Judul, status (ubah status), edit atau centang */}
                                <div className="flex flex-wrap items-start justify-between gap-2.5">
                                    <div className="min-w-0 flex-1 basis-40">
                                        <h3
                                            className="truncate text-base font-bold text-ink sm:text-lg"
                                            title={r.title}
                                        >
                                            {r.title}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                                            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold">
                                                {r.category}
                                            </span>
                                            {r.editedByAdmin && (
                                                <span
                                                    className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-leaf"
                                                    title={`Judul asli: ${r.original?.title ?? ""}`}
                                                >
                                                    Diedit admin
                                                </span>
                                            )}
                                            <span>{formatDate(r.createdAt)}</span>
                                            {r.reporterName && <span>· {r.reporterName}</span>}
                                        </div>
                                    </div>

                                    {/* Tombol status: yang tampil di dalamnya adalah status saat ini */}
                                    <div className="relative flex-none">
                                        <span
                                            className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                                            style={{ background: STATUS[r.status].color }}
                                        />
                                        <select
                                            value={r.status}
                                            disabled={deleteMode}
                                            onChange={(e) => onChangeStatus(r, e.target.value as ReportStatus)}
                                            aria-label={`Ubah status laporan ${r.title}`}
                                            title="Ubah status"
                                            className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-surface pl-8 pr-8 text-sm font-semibold text-ink outline-none hover:bg-ink/5 focus-visible:border-leaf disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {STATUS_KEYS.map((key) => (
                                                <option key={key} value={key}>
                                                    {STATUS[key].label}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                                            <ChevronIcon />
                                        </span>
                                    </div>

                                    {deleteMode ? (
                                        <label className="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggle(r.id)}
                                                aria-label={`Pilih laporan ${r.title}`}
                                                className="h-5 w-5 cursor-pointer accent-red-600"
                                            />
                                        </label>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(r.id)}
                                            title="Edit laporan"
                                            aria-label={`Edit laporan ${r.title}`}
                                            className="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full border border-line text-muted hover:bg-ink/5 hover:text-ink"
                                        >
                                            <DotsIcon />
                                        </button>
                                    )}
                                </div>

                                {/* Alamat + buka maps */}
                                <div className="flex items-center gap-2.5 rounded-2xl bg-ink/5 px-3.5 py-2">
                                    <span className="text-muted">
                                        <PinIcon />
                                    </span>
                                    <span
                                        className="min-w-0 flex-1 truncate text-sm text-ink"
                                        title={r.locationLabel}
                                    >
                                        {r.locationLabel}
                                    </span>
                                    <a
                                        href={mapsUrl(r)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-none rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf hover:bg-leaf/25"
                                    >
                                        Buka maps
                                    </a>
                                </div>

                                {/* Deskripsi */}
                                <p className="line-clamp-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm leading-relaxed text-ink/80">
                                    {r.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}