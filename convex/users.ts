import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";


// Data user yang sedang login (null kalau belum login)
export const me = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;

        const user = await ctx.db.get(userId);
        if (user === null) return null;

        return {
            name: user.name ?? null,
            email: user.email ?? null,
            role: user.role ?? "user",
        };
    },
});

// Ubah profil sendiri
export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Belum login");
        await ctx.db.patch(userId, args);
    },
});

export const setRole = internalMutation({
    args: { email: v.string(), role: v.union(v.literal("user"), v.literal("admin")) },
    handler: async (ctx, { email, role }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .unique();
        if (!user) throw new Error("User tidak ditemukan");
        await ctx.db.patch(user._id, { role });
    },
});
