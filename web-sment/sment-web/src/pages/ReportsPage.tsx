import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import LaporanContent from "../components/ReportsContent";
import Sidebar from "../components/Sidebar";
import type { ReportDraft } from "../utils/reportMeta";

// Tampilkan pesan dari ConvexError (mis. "Hanya admin yang boleh mengakses ini.").
const showError = (e: unknown) =>
    window.alert(e instanceof ConvexError ? String(e.data) : "Terjadi kesalahan. Coba lagi.");

export default function ReportPage() {
    const me = useQuery(api.users.me);
    const isAdmin = me?.role === "admin";

    // "skip" supaya query khusus admin tidak dipanggil oleh akun non-admin.
    const reports = useQuery(api.reports.listAll, isAdmin ? {} : "skip");
    const updateStatus = useMutation(api.reports.updateStatus);
    const removeAny = useMutation(api.reports.removeAny);
    const generateUploadUrl = useMutation(api.reports.generateUploadUrl);
    const adminCreate = useMutation(api.reports.adminCreate);
    const adminUpdate = useMutation(api.reports.adminUpdate);

    // Unggah foto ke Convex Storage, kembalikan storageId (undefined kalau tidak ada foto).
    const uploadPhoto = async (file?: File) => {
        if (!file) return undefined;
        const url = await generateUploadUrl();
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        if (!res.ok) throw new Error("Gagal mengunggah foto.");
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        return storageId;
    };

    // Dipanggil form: tanpa id = tambah, dengan id = edit. Error dilempar supaya tampil di dalam form.
    const saveReport = async (draft: ReportDraft, id?: string) => {
        try {
            const { photoFile, ...fields } = draft;

            if (!id) {
                const photoId = await uploadPhoto(photoFile);
                await adminCreate({ ...fields, ...(photoId ? { photoId } : {}) });
                return;
            }

            const original = reports?.find((r) => r.id === id);
            if (!original) throw new Error("Laporan tidak ditemukan.");

            if (original.source === "admin") {
                // Laporan buatan admin: semua boleh diubah.
                const photoId = await uploadPhoto(photoFile);
                await adminUpdate({ id: id as Id<"reports">, ...fields, ...(photoId ? { photoId } : {}) });
            } else {
                // Laporan warga: kategori dan foto tidak dikirim, sisanya jadi editan admin.
                const { category: _category, ...editable } = fields;
                await adminUpdate({ id: id as Id<"reports">, ...editable });
            }
        } catch (e) {
            throw new Error(
                e instanceof ConvexError
                    ? String(e.data)
                    : e instanceof Error
                        ? e.message
                        : "Gagal menyimpan. Coba lagi.",
            );
        }
    };

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

    return (
        <Sidebar
            user={me}
            heading={
                <>
                    Laporan <span className="font-normal text-muted">({reports?.length ?? 0})</span>
                </>
            }
        >
            <LaporanContent
                reports={reports ?? []}
                onSaveReport={saveReport}
                onChangeStatus={(r, status) =>
                    void updateStatus({ id: r.id as Id<"reports">, status }).catch(showError)
                }
                onDeleteSelected={(ids) =>
                    void Promise.all(
                        ids.map((id) => removeAny({ id: id as Id<"reports"> })),
                    ).catch(showError)
                }
            />
        </Sidebar>
    );
}