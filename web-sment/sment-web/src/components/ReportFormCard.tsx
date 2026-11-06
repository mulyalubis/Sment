import { useState } from "react";
import type { ReactNode } from "react";
import { CATEGORIES, STATUS } from "../utils/reportMeta";
import type { ReportDraft, ReportRow, ReportStatus } from "../utils/reportMeta";

type Props = {
    report?: ReportRow; // kosong = tambah laporan baru
    onSave: (draft: ReportDraft) => Promise<void>;
    onCancel: () => void;
};

const MAX_PHOTO_MB = 8;

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

const PinIcon = () => (
    <Svg size={16}>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
);

const UploadIcon = () => (
    <Svg size={28}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m17 8-5-5-5 5" />
        <path d="M12 3v12" />
    </Svg>
);

const field =
    "rounded-2xl border border-line bg-surface text-ink outline-none placeholder:text-muted focus:border-leaf disabled:opacity-60";

// Status hanya ditampilkan di sini. Mengubahnya lewat tombol status di kartu laporan.
function StatusPill({ status }: { status: ReportStatus }) {
    return (
        <span
            className="inline-flex h-11 flex-none items-center gap-2 rounded-2xl border border-line px-3.5 text-sm font-semibold text-ink"
            title="Status diubah lewat tombol status di kartu laporan"
        >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[status].color }} />
            {STATUS[status].label}
        </span>
    );
}

export default function ReportFormCard({ report, onSave, onCancel }: Props) {
    const [title, setTitle] = useState(report?.title ?? "");
    const [description, setDescription] = useState(report?.description ?? "");
    const [category, setCategory] = useState(report?.category ?? "");
    const [locationLabel, setLocationLabel] = useState(report?.locationLabel ?? "");
    const [lat, setLat] = useState(report ? String(report.latitude) : "");
    const [lng, setLng] = useState(report ? String(report.longitude) : "");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const hasCoords =
        lat.trim() !== "" && lng.trim() !== "" && Number.isFinite(latNum) && Number.isFinite(lngNum);
    const shownPhoto = preview ?? report?.photoUrl ?? null;

    const pickFile = (picked: File | undefined) => {
        if (!picked) return;
        if (!picked.type.startsWith("image/")) {
            setError("File harus berupa gambar.");
            return;
        }
        if (picked.size > MAX_PHOTO_MB * 1024 * 1024) {
            setError(`Ukuran foto maksimal ${MAX_PHOTO_MB} MB.`);
            return;
        }
        setError(null);
        setFile(picked);
        const reader = new FileReader();
        reader.onload = () => setPreview(String(reader.result));
        reader.readAsDataURL(picked);
    };

    const fillMyLocation = () => {
        if (!navigator.geolocation) {
            setError("Browser ini tidak mendukung pengambilan lokasi.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setError(null);
                setLat(pos.coords.latitude.toFixed(6));
                setLng(pos.coords.longitude.toFixed(6));
            },
            () => setError("Tidak bisa mengambil lokasi. Izinkan akses lokasi di browser."),
        );
    };

    // Aturan sama dengan validasi di convex/reports.ts.
    const validate = (): string | null => {
        const t = title.trim();
        const d = description.trim();
        if (t.length < 3 || t.length > 100) return "Judul harus 3 sampai 100 karakter.";
        if (!CATEGORIES.some((c) => c === category)) return "Pilih kategori sampah.";
        if (locationLabel.trim() === "") return "Alamat atau nama lokasi wajib diisi.";
        if (!hasCoords || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) {
            return "Koordinat tidak valid. Latitude -90 sampai 90, longitude -180 sampai 180.";
        }
        if (d.length < 5 || d.length > 1000) return "Deskripsi harus 5 sampai 1000 karakter.";
        return null;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        const problem = validate();
        if (problem) {
            setError(problem);
            return;
        }

        setError(null);
        setSaving(true);
        try {
            await onSave({
                title: title.trim(),
                description: description.trim(),
                category,
                locationLabel: locationLabel.trim(),
                latitude: latNum,
                longitude: lngNum,
                ...(file ? { photoFile: file } : {}),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi.");
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={submit}
            noValidate
            className="flex gap-4 rounded-3xl border-2 border-leaf/60 bg-surface p-3.5 max-sm:flex-col sm:p-4"
        >
            {/* Foto: klik untuk memilih atau mengganti */}
            <div className="w-full flex-none sm:w-48 sm:self-stretch">
                <label className="relative flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-ink/5 text-muted hover:bg-ink/10 focus-within:ring-2 focus-within:ring-leaf sm:h-full sm:min-h-44">
                    {shownPhoto ? (
                        <>
                            <img src={shownPhoto} alt="Foto laporan" className="absolute inset-0 h-full w-full object-cover" />
                            <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-1.5 text-center text-xs font-semibold text-white">
                                Ganti foto
                            </span>
                        </>
                    ) : (
                        <>
                            <UploadIcon />
                            <span className="text-xs font-semibold">Pilih foto</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={saving}
                        onChange={(e) => pickFile(e.target.files?.[0])}
                    />
                </label>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
                {/* Judul, kategori, status */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        disabled={saving}
                        placeholder="Judul laporan"
                        aria-label="Judul laporan"
                        className={`${field} h-11 min-w-0 flex-1 basis-48 px-4 text-base font-bold placeholder:font-normal`}
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={saving}
                        aria-label="Kategori sampah"
                        className={`${field} h-11 flex-none cursor-pointer px-3 text-sm font-semibold`}
                    >
                        <option value="" disabled>
                            Pilih kategori
                        </option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <StatusPill status={report?.status ?? "pending"} />
                </div>

                {/* Alamat */}
                <div className={`${field} flex h-11 items-center gap-2.5 px-3.5 text-muted focus-within:border-leaf`}>
                    <PinIcon />
                    <input
                        type="text"
                        value={locationLabel}
                        onChange={(e) => setLocationLabel(e.target.value)}
                        disabled={saving}
                        placeholder="Alamat atau nama lokasi"
                        aria-label="Alamat laporan"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                    />
                </div>

                {/* Koordinat */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <input
                        type="number"
                        step="any"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        disabled={saving}
                        placeholder="Latitude"
                        aria-label="Latitude"
                        className={`${field} h-10 w-36 px-3.5 text-sm`}
                    />
                    <input
                        type="number"
                        step="any"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        disabled={saving}
                        placeholder="Longitude"
                        aria-label="Longitude"
                        className={`${field} h-10 w-36 px-3.5 text-sm`}
                    />
                    <button
                        type="button"
                        onClick={fillMyLocation}
                        disabled={saving}
                        className="h-10 cursor-pointer rounded-full bg-leaf/15 px-3.5 text-xs font-semibold text-leaf hover:bg-leaf/25 disabled:opacity-60"
                    >
                        Pakai lokasi saya
                    </button>
                    {hasCoords && (
                        <a
                            href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-leaf hover:underline"
                        >
                            Cek di maps
                        </a>
                    )}
                </div>

                {/* Deskripsi */}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    disabled={saving}
                    placeholder="Deskripsi laporan"
                    aria-label="Deskripsi laporan"
                    className={`${field} resize-y px-4 py-3 text-sm leading-relaxed`}
                />

                {error && (
                    <p role="alert" className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="h-11 cursor-pointer rounded-2xl border border-line px-4 font-semibold text-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-11 cursor-pointer rounded-2xl bg-leaf px-5 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Menyimpan…" : report ? "Simpan perubahan" : "Simpan laporan"}
                    </button>
                </div>
            </div>
        </form>
    );
}