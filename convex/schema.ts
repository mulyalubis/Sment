import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const statusLaporan = v.union(
    v.literal("pending"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("rejected")
);

// Alias lama, supaya import yang memakai nama ini tetap jalan.
export const statusValidator = statusLaporan;

export default defineSchema({
    ...authTables,

    // Tabel users bawaan Convex Auth + kolom role.
    // role kosong dianggap "user". Admin hanya diset lewat CLI (lihat users.setRole).
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
        disabled: v.optional(v.boolean()), // true = akun dinonaktifkan oleh admin
    }).index("email", ["email"]),

    reports: defineTable({
        userId: v.id("users"),
        title: v.string(),
        description: v.string(),
        category: v.string(), // hasil AI atau pilihan user: "Plastic Waste", dst.
        aiConfidence: v.optional(v.number()),
        status: statusLaporan,
        adminNote: v.optional(v.string()),
        // Asal laporan. Kosong = dikirim warga lewat aplikasi mobile.
        source: v.optional(v.union(v.literal("user"), v.literal("admin"))),
        // Jejak koreksi kategori oleh admin (supaya pelapor tahu dan data asli tidak hilang).
        categoryEditedByAdmin: v.optional(v.boolean()),
        originalCategory: v.optional(v.string()),
        // Hasil editan admin pada laporan warga. Hanya terlihat di panel admin.
        adminEdits: v.optional(
            v.object({
                title: v.optional(v.string()),
                description: v.optional(v.string()),
                locationLabel: v.optional(v.string()),
                latitude: v.optional(v.number()),
                longitude: v.optional(v.number()),
            }),
        ),
        photoId: v.optional(v.id("_storage")),
        latitude: v.number(),
        longitude: v.number(),
        locationLabel: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),
});