import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Anda belum login.");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new ConvexError("Hanya admin yang boleh mengakses ini.");
    return userId;
}

const emptyStats = { total: 0, pending: 0, in_progress: 0, completed: 0, rejected: 0 };

// Semua pengguna beserta jumlah laporannya per status.
export const listWithStats = query({
    args: {},
    handler: async (ctx) => {
        const adminId = await requireAdmin(ctx);
        const [users, reports] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("reports").collect(),
        ]);

        const stats = new Map<string, typeof emptyStats>();
        for (const r of reports) {
            const s = stats.get(r.userId) ?? { ...emptyStats };
            s.total++;
            s[r.status]++;
            stats.set(r.userId, s);
        }

        return users
            .map((u) => ({
                id: u._id,
                ...(u.name ? { name: u.name } : {}),
                ...(u.email ? { email: u.email } : {}),
                ...(u.image ? { image: u.image } : {}),
                role: u.role ?? ("user" as const),
                disabled: u.disabled ?? false,
                isSelf: u._id === adminId,
                createdAt: new Date(u._creationTime).toISOString(),
                ...(stats.get(u._id) ?? emptyStats),
            }))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
});

export const changeRole = mutation({
    args: { id: v.id("users"), role: v.union(v.literal("admin"), v.literal("user")) },
    handler: async (ctx, { id, role }) => {
        const adminId = await requireAdmin(ctx);
        if (id === adminId) throw new ConvexError("Anda tidak bisa mengubah role akun sendiri.");
        const target = await ctx.db.get(id);
        if (!target) throw new ConvexError("Pengguna tidak ditemukan.");
        await ctx.db.patch(id, { role });
    },
});

export const setDisabled = mutation({
    args: { id: v.id("users"), disabled: v.boolean() },
    handler: async (ctx, { id, disabled }) => {
        const adminId = await requireAdmin(ctx);
        if (id === adminId) throw new ConvexError("Anda tidak bisa menonaktifkan akun sendiri.");
        const target = await ctx.db.get(id);
        if (!target) throw new ConvexError("Pengguna tidak ditemukan.");
        await ctx.db.patch(id, { disabled });
    },
});