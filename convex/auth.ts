import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { type DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Password<DataModel>({
            // Hanya email dan nama yang diambil dari klien.
            // role TIDAK pernah diset dari sini supaya tidak bisa dimanipulasi.
            profile(params) {
                const email = String(params.email ?? "").trim().toLowerCase();
                const name = typeof params.name === "string" ? params.name.trim() : "";
                return name ? { email, name } : { email };
            },
            validatePasswordRequirements(password: string) {
                if (!password || password.length < 8) {
                    throw new ConvexError("Password minimal 8 karakter.");
                }
            },
        }),
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
            // existingUserId null berarti user baru, bukan login ulang
            if (existingUserId === null) {
                await ctx.db.patch(userId, { role: "user" });
            }
        },
    },
});