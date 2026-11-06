import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { statusLaporan } from "./schema";

// Kategori yang diterima server (sama dengan kelas model ML).
const CATEGORIES = ["Organic Waste", "Plastic Waste", "Paper Waste"];

// ---------------------------------------------------------------------------
// Helper keamanan
// ---------------------------------------------------------------------------

async function requireUser(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Anda belum login.");
    const user = await ctx.db.get(userId);
    if (user?.disabled) throw new ConvexError("Akun Anda dinonaktifkan oleh admin.");
    return userId;
}

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const userId = await requireUser(ctx);
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new ConvexError("Hanya admin yang boleh mengakses ini.");
    return userId;
}

// ---------------------------------------------------------------------------
// Helper validasi
// ---------------------------------------------------------------------------

function checkTitle(value: string) {
    const title = value.trim();
    if (title.length < 3 || title.length > 100) {
        throw new ConvexError("Judul harus 3 sampai 100 karakter.");
    }
    return title;
}

function checkDescription(value: string) {
    const description = value.trim();
    if (description.length < 5 || description.length > 1000) {
        throw new ConvexError("Deskripsi harus 5 sampai 1000 karakter.");
    }
    return description;
}

function checkCategory(value: string) {
    if (!CATEGORIES.includes(value)) throw new ConvexError("Kategori sampah tidak valid.");
    return value;
}

function checkCoordinates(latitude: number, longitude: number) {
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new ConvexError("Koordinat lokasi tidak valid.");
    }
}

function checkLocationLabel(value: string) {
    return value.trim().slice(0, 200) || "Lokasi tidak diketahui";
}

// Validasi bersama untuk update user/admin
function validateReportFields(args: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
}) {
    const title = checkTitle(args.title);
    const description = checkDescription(args.description);
    const category = checkCategory(args.category);
    checkCoordinates(args.latitude, args.longitude);
    return { title, description, category };
}

// ---------------------------------------------------------------------------
// Helper Konversi Dokumen
// ---------------------------------------------------------------------------

async function reporterNameOf(ctx: QueryCtx, userId: Doc<"reports">["userId"]) {
    const user = await ctx.db.get(userId);
    return user?.name ?? user?.email ?? undefined;
}

async function toReport(
    ctx: QueryCtx,
    r: Doc<"reports">,
    reporterName?: string,
    asAdmin = false,
) {
    const photoUrl = r.photoId ? await ctx.storage.getUrl(r.photoId) : null;
    const e = asAdmin ? r.adminEdits : undefined; // user tidak pernah melihat adminEdits
    return {
        id: r._id,
        userId: r.userId,
        source: r.source ?? ("user" as const),
        ...(reporterName ? { reporterName } : {}),
        title: e?.title ?? r.title,
        description: e?.description ?? r.description,
        category: r.category,
        status: r.status,
        latitude: e?.latitude ?? r.latitude,
        longitude: e?.longitude ?? r.longitude,
        locationLabel: e?.locationLabel ?? r.locationLabel,
        createdAt: new Date(r._creationTime).toISOString(),
        ...(photoUrl ? { photoUrl } : {}),
        ...(r.aiConfidence !== undefined ? { aiConfidence: r.aiConfidence } : {}),
        ...(r.adminNote ? { adminNote: r.adminNote } : {}),
        ...(asAdmin && r.adminEdits
            ? {
                editedByAdmin: true,
                original: {
                    title: r.title,
                    description: r.description,
                    locationLabel: r.locationLabel,
                    latitude: r.latitude,
                    longitude: r.longitude,
                },
            }
            : {}),
    };
}

// ---------------------------------------------------------------------------
// User (mobile)
// ---------------------------------------------------------------------------

// Langkah 1 upload foto: minta URL upload, lalu kirim file dengan fetch(POST).
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireUser(ctx);
        return await ctx.storage.generateUploadUrl();
    },
});

// Langkah 2: simpan laporan baru. Status awal selalu "pending".
export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
        aiConfidence: v.optional(v.number()),
        latitude: v.number(),
        longitude: v.number(),
        locationLabel: v.string(),
        photoId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx);

        const title = checkTitle(args.title);
        const description = checkDescription(args.description);
        const category = checkCategory(args.category);
        checkCoordinates(args.latitude, args.longitude);

        if (
            args.aiConfidence !== undefined &&
            (args.aiConfidence < 0 || args.aiConfidence > 1)
        ) {
            throw new ConvexError("Nilai keyakinan AI tidak valid.");
        }

        return await ctx.db.insert("reports", {
            userId,
            source: "user",
            title,
            description,
            category,
            aiConfidence: args.aiConfidence,
            status: "pending",
            photoId: args.photoId,
            latitude: args.latitude,
            longitude: args.longitude,
            locationLabel: checkLocationLabel(args.locationLabel),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("reports"),
        title: v.string(),
        description: v.string(),
        category: v.string(),
        aiConfidence: v.optional(v.number()),
        latitude: v.number(),
        longitude: v.number(),
        locationLabel: v.string(),
        photoId: v.optional(v.id("_storage")), // hanya dikirim kalau foto diganti
    },
    handler: async (ctx, { id, ...args }) => {
        const userId = await requireUser(ctx);

        const report = await ctx.db.get(id);
        if (!report || report.userId !== userId) {
            throw new ConvexError("Laporan tidak ditemukan.");
        }
        if (report.status !== "pending") {
            throw new ConvexError("Laporan yang sudah diproses tidak bisa diubah.");
        }

        const { title, description, category } = validateReportFields(args);

        if (
            args.aiConfidence !== undefined &&
            (args.aiConfidence < 0 || args.aiConfidence > 1)
        ) {
            throw new ConvexError("Nilai keyakinan AI tidak valid.");
        }

        const patch: Partial<Doc<"reports">> = {
            title,
            description,
            category,
            latitude: args.latitude,
            longitude: args.longitude,
            locationLabel: checkLocationLabel(args.locationLabel),
        };

        if (args.aiConfidence !== undefined) {
            patch.aiConfidence = args.aiConfidence;
        } else if (category !== report.category) {
            // Kategori diubah manual: keyakinan AI yang lama tidak berlaku lagi.
            patch.aiConfidence = undefined;
        }

        if (args.photoId && args.photoId !== report.photoId) {
            patch.photoId = args.photoId;
            if (report.photoId) await ctx.storage.delete(report.photoId); // buang foto lama
        }

        await ctx.db.patch(id, patch);
    },
});

// Riwayat laporan milik user (halaman Riwayat dan Beranda).
export const listMine = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return [];

        const rows = await ctx.db
            .query("reports")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
        return await Promise.all(rows.map((r) => toReport(ctx, r)));
    },
});

// Detail satu laporan (pemilik atau admin).
export const get = query({
    args: { id: v.id("reports") },
    handler: async (ctx, { id }) => {
        const userId = await requireUser(ctx);
        const report = await ctx.db.get(id);
        if (!report) return null;

        const user = await ctx.db.get(userId);
        if (report.userId !== userId && user?.role !== "admin") {
            throw new ConvexError("Anda tidak punya akses ke laporan ini.");
        }
        return await toReport(
            ctx,
            report,
            await reporterNameOf(ctx, report.userId),
            user?.role === "admin",
        );
    },
});

// Ringkasan jumlah laporan milik user per status.
export const myStats = query({
    args: {},
    handler: async (ctx) => {
        const stats = { total: 0, pending: 0, in_progress: 0, completed: 0, rejected: 0 };

        const userId = await getAuthUserId(ctx);
        if (userId === null) return stats;

        const rows = await ctx.db
            .query("reports")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        stats.total = rows.length;
        for (const r of rows) stats[r.status]++;
        return stats;
    },
});

// Hapus laporan sendiri selama masih "pending".
export const remove = mutation({
    args: { id: v.id("reports") },
    handler: async (ctx, { id }) => {
        const userId = await requireUser(ctx);
        const report = await ctx.db.get(id);
        if (!report || report.userId !== userId) {
            throw new ConvexError("Laporan tidak ditemukan.");
        }
        if (report.status !== "pending") {
            throw new ConvexError("Laporan yang sudah diproses tidak bisa dihapus.");
        }
        if (report.photoId) await ctx.storage.delete(report.photoId);
        await ctx.db.delete(id);
    },
});

// ---------------------------------------------------------------------------
// Khusus admin (web)
// ---------------------------------------------------------------------------

// Semua laporan, bisa difilter berdasarkan status.
export const listAll = query({
    args: { status: v.optional(statusLaporan) },
    handler: async (ctx, { status }) => {
        await requireAdmin(ctx);
        const q = status
            ? ctx.db.query("reports").withIndex("by_status", (x) => x.eq("status", status))
            : ctx.db.query("reports");
        const rows = await q.order("desc").collect();

        const names = new Map<string, string | undefined>();
        const result = [];
        for (const r of rows) {
            if (!names.has(r.userId)) names.set(r.userId, await reporterNameOf(ctx, r.userId));
            result.push(await toReport(ctx, r, names.get(r.userId), true));
        }
        return result;

    },
});

// Ubah status saja (aksi cepat). Catatan lama tidak terhapus kalau adminNote tidak dikirim.
export const updateStatus = mutation({
    args: {
        id: v.id("reports"),
        status: statusLaporan,
        adminNote: v.optional(v.string()),
    },
    handler: async (ctx, { id, status, adminNote }) => {
        await requireAdmin(ctx);

        const report = await ctx.db.get(id);
        if (!report) throw new ConvexError("Laporan tidak ditemukan.");

        const note = adminNote?.trim();
        if (note && note.length > 500) {
            throw new ConvexError("Catatan admin maksimal 500 karakter.");
        }

        await ctx.db.patch(id, note === undefined ? { status } : { status, adminNote: note });
    },
});

export const statsAll = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const rows = await ctx.db.query("reports").collect();

        const byStatus = { pending: 0, in_progress: 0, completed: 0, rejected: 0 };
        const byCategory: Record<string, number> = {};
        for (const r of rows) {
            byStatus[r.status]++;
            byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
        }
        return { total: rows.length, byStatus, byCategory };
    },
});

// Hapus laporan apa pun beserta fotonya (Admin).
export const removeAny = mutation({
    args: { id: v.id("reports") },
    handler: async (ctx, { id }) => {
        await requireAdmin(ctx);
        const report = await ctx.db.get(id);
        if (!report) throw new ConvexError("Laporan tidak ditemukan.");
        if (report.photoId) await ctx.storage.delete(report.photoId);
        await ctx.db.delete(id);
    },
});

// Alias untuk konsistensi adminRemove
export const adminRemove = removeAny;

// Jumlah laporan per hari untuk grafik dashboard. Hari dihitung dalam WIB (UTC+7).
export const timeline = query({
    args: { days: v.number() },
    handler: async (ctx, { days }) => {
        await requireAdmin(ctx);

        const n = Math.min(Math.max(Math.floor(days), 1), 90);
        const WIB = 7 * 60 * 60 * 1000;
        const DAY = 24 * 60 * 60 * 1000;
        const key = (t: number) => new Date(t + WIB).toISOString().slice(0, 10);

        // 00:00 WIB hari ini (dalam ms UTC), mundur n-1 hari
        const todayStart = Math.floor((Date.now() + WIB) / DAY) * DAY - WIB;
        const since = todayStart - (n - 1) * DAY;

        const rows = await ctx.db
            .query("reports")
            .filter((q) => q.gte(q.field("_creationTime"), since))
            .collect();

        const counts: Record<string, number> = {};
        for (const r of rows) {
            const k = key(r._creationTime);
            counts[k] = (counts[k] ?? 0) + 1;
        }

        return Array.from({ length: n }, (_, i) => {
            const date = key(since + i * DAY);
            return { date, count: counts[date] ?? 0 };
        });
    },
});

// Admin membuat laporan sendiri (mis. temuan petugas lapangan).
export const adminCreate = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        locationLabel: v.string(),
        photoId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const adminId = await requireAdmin(ctx);

        const title = checkTitle(args.title);
        const description = checkDescription(args.description);
        const category = checkCategory(args.category);
        checkCoordinates(args.latitude, args.longitude);

        return await ctx.db.insert("reports", {
            userId: adminId,
            source: "admin",
            title,
            description,
            category,
            status: "pending",
            photoId: args.photoId,
            latitude: args.latitude,
            longitude: args.longitude,
            locationLabel: checkLocationLabel(args.locationLabel),
        });
    },
});

// Admin mengubah laporan. Laporan warga: isi disimpan sebagai adminEdits (hanya terlihat admin).
export const adminUpdate = mutation({
    args: {
        id: v.id("reports"),
        status: v.optional(statusLaporan),
        adminNote: v.optional(v.string()),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        locationLabel: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        // Dua field ini hanya berlaku untuk laporan buatan admin:
        category: v.optional(v.string()),
        photoId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const report = await ctx.db.get(args.id);
        if (!report) throw new ConvexError("Laporan tidak ditemukan.");
        const isAdminReport = report.source === "admin";

        if (
            !isAdminReport &&
            ((args.category !== undefined && args.category !== report.category) ||
                args.photoId !== undefined)
        ) {
            throw new ConvexError("Kategori dan foto laporan warga tidak dapat diubah.");
        }

        const patch: Partial<Omit<Doc<"reports">, "_id" | "_creationTime">> = {};

        // Status dan catatan: berlaku untuk semua laporan.
        if (args.status !== undefined) patch.status = args.status;
        if (args.adminNote !== undefined) {
            const note = args.adminNote.trim();
            if (note.length > 500) throw new ConvexError("Catatan admin maksimal 500 karakter.");
            patch.adminNote = note || undefined; // kosong = hapus catatan
        }

        // Validasi isi yang dikirim.
        const title = args.title !== undefined ? checkTitle(args.title) : undefined;
        const description =
            args.description !== undefined ? checkDescription(args.description) : undefined;
        const locationLabel =
            args.locationLabel !== undefined ? checkLocationLabel(args.locationLabel) : undefined;
        const { latitude, longitude } = args;

        const cur = isAdminReport ? undefined : report.adminEdits;
        if (latitude !== undefined || longitude !== undefined) {
            checkCoordinates(
                latitude ?? cur?.latitude ?? report.latitude,
                longitude ?? cur?.longitude ?? report.longitude,
            );
        }

        const touchesContent = [title, description, locationLabel, latitude, longitude].some(
            (x) => x !== undefined,
        );

        if (isAdminReport) {
            // Laporan buatan admin: ubah langsung.
            if (title !== undefined) patch.title = title;
            if (description !== undefined) patch.description = description;
            if (locationLabel !== undefined) patch.locationLabel = locationLabel;
            if (latitude !== undefined) patch.latitude = latitude;
            if (longitude !== undefined) patch.longitude = longitude;

            if (args.category !== undefined && args.category !== report.category) {
                patch.category = checkCategory(args.category);
                patch.aiConfidence = undefined;
            }
            if (args.photoId !== undefined && args.photoId !== report.photoId) {
                if (report.photoId) await ctx.storage.delete(report.photoId);
                patch.photoId = args.photoId;
            }
        } else if (touchesContent) {
            // Laporan warga: data asli tetap. Simpan hanya nilai yang berbeda dari aslinya.
            const pick = <T>(incoming: T | undefined, current: T | undefined, original: T) => {
                const value = incoming !== undefined ? incoming : current;
                return value !== undefined && value !== original ? value : undefined;
            };

            const edits: NonNullable<Doc<"reports">["adminEdits"]> = {};
            const t = pick(title, cur?.title, report.title);
            const d = pick(description, cur?.description, report.description);
            const l = pick(locationLabel, cur?.locationLabel, report.locationLabel);
            const la = pick(latitude, cur?.latitude, report.latitude);
            const lo = pick(longitude, cur?.longitude, report.longitude);
            if (t !== undefined) edits.title = t;
            if (d !== undefined) edits.description = d;
            if (l !== undefined) edits.locationLabel = l;
            if (la !== undefined) edits.latitude = la;
            if (lo !== undefined) edits.longitude = lo;

            patch.adminEdits = Object.keys(edits).length > 0 ? edits : undefined;
        }

        await ctx.db.patch(args.id, patch);
    },
});