import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar, { TabKey } from "../components/BottomBar";
import ReportCard from "../components/ReportCard";
import { useTheme } from "../hooks/useTheme";
import { Report } from "../types/report";

type Props = {
    reports?: Report[];
    onCreateReport?: () => void;
    onOpenHome?: () => void;
    onOpenProfile?: () => void;
    onEditReport?: (report: Report) => void;
    onDeleteReport?: (report: Report) => void;
};

export default function HistoryScreen({
    reports = [],
    onCreateReport = () => { },
    onOpenHome = () => { },
    onOpenProfile = () => { },
    onEditReport = () => { },
    onDeleteReport = () => { },
}: Props) {
    const c = useTheme();

    const handleTab = (key: TabKey) => {
        if (key === "home") onOpenHome();
        if (key === "profile") onOpenProfile();
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={["top"]}>
            <FlatList
                data={reports}
                keyExtractor={(r) => r.id}
                renderItem={({ item }) => <ReportCard report={item} onEdit={onEditReport} onDelete={onDeleteReport} />}
                contentContainerStyle={styles.content}
                ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: c.text }]}>Riwayat laporan</Text>
                        <Text style={[styles.sub, { color: c.textMuted }]}>
                            {reports.length} laporan. Status diperbarui otomatis oleh admin.
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={40} color={c.textMuted} />
                        <Text style={[styles.emptyText, { color: c.textMuted }]}>
                            Belum ada laporan. Ketuk tombol kamera untuk membuat laporan pertama.
                        </Text>
                    </View>
                }
            />

            <BottomBar active="history" onTab={handleTab} onCreate={onCreateReport} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 140 },
    header: { marginBottom: 16 },
    title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
    sub: { fontSize: 14, marginTop: 4 },
    empty: { alignItems: "center", gap: 12, paddingVertical: 60, paddingHorizontal: 24 },
    emptyText: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});