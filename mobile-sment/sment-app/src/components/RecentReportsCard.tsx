import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { Report } from "../types/report";
import ReportRow from "./ReportRow";

type Props = {
    reports: Report[];
    onSeeAll: () => void;
    maxItems?: number;
};

export default function RecentReportsCard({ reports, onSeeAll, maxItems = 4 }: Props) {
    const c = useTheme();
    const recent = reports.slice(0, maxItems);

    return (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: c.text }]}>Laporan terbaru Anda</Text>
                <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
                    <Text style={[styles.link, { color: c.leaf }]}>Lihat semua</Text>
                </Pressable>
            </View>

            {recent.length === 0 ? (
                <Text style={[styles.empty, { color: c.textMuted }]}>
                    Belum ada laporan. Ketuk tombol kamera untuk melaporkan sampah pertama Anda.
                </Text>
            ) : (
                recent.map((r) => <ReportRow key={r.id} report={r} />)
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 24, borderWidth: 1, padding: 18 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 17, fontWeight: "700" },
    link: { fontSize: 14, fontWeight: "600" },
    empty: { fontSize: 14, lineHeight: 20, marginTop: 14 },
});