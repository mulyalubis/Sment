import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx } from "../_generated/server";

export async function requireAdmin(ctx: QueryCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Belum login");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Khusus admin");
    return user;
}