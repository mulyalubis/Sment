import { useRouter } from "expo-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import HistoryScreen from "../screens/HistoryScreen";
import { convexErrorMessage } from "../utils/convexError";
import { Id } from "../../../../convex/_generated/dataModel";
import { Alert } from "react-native";


export default function History() {
    const router = useRouter();
    const { isAuthenticated } = useConvexAuth();
    const reports = useQuery(api.reports.listMine, isAuthenticated ? {} : "skip");
    const removeReport = useMutation(api.reports.remove);

    return (
        <HistoryScreen
            reports={reports ?? []}
            onCreateReport={() => router.push("/reports/new")}
            onOpenHome={() => router.replace("/")}
            onOpenProfile={() => router.push(isAuthenticated ? "/profile" : "/account")}
            onEditReport={(r) => router.push(`/reports/edit?id=${r.id}`)}
            onDeleteReport={async (r) => {
                try {
                    await removeReport({ id: r.id as Id<"reports"> });
                } catch (e) {
                    Alert.alert("Gagal menghapus", convexErrorMessage(e, "Coba lagi."));
                }
            }}
        />
    );
}