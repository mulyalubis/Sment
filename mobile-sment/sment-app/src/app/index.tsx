import { useRouter } from "expo-router";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import HomeScreen from "../screens/HomeScreen";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me);
  const reports = useQuery(api.reports.listMine, isAuthenticated ? {} : "skip");

  return (
    <HomeScreen
      userName={me?.name ?? "Warga"}
      reports={reports ?? []}
      onCreateReport={() => router.push("/reports/new")}
      onOpenHistory={() => router.replace("/history")}
      onOpenProfile={() => router.replace(isAuthenticated ? "/profile" : "/account")}
    />
  );
}