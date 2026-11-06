import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Redirect, useRouter } from "expo-router";
import { api } from "../../../../convex/_generated/api";
import ProfileScreen from "../screens/ProfileScreen";

export default function Profile() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");

    // Setelah keluar (atau belum login), kembali ke halaman akun
    if (!isLoading && !isAuthenticated) {
        return <Redirect href="/account" />;
    }

    return (
        <ProfileScreen
            name={me?.name ?? me?.email?.split("@")[0] ?? "Pengguna"}
            email={me?.email ?? ""}
            onLogout={signOut}
            onCreateReport={() => router.push("/reports/new")}
            onOpenPrivacy={() => { }}
            onOpenHome={() => router.replace("/")}
            onOpenHistory={() => router.replace("/history")}
        />
    );
}