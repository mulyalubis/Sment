import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { formatDateTime } from "../utils/format";
import { Report } from "../types/report";
import LocationTile from "./LocationTile";
import ReportPhoto from "./ReportPhoto";
import StatusBadge from "./StatusBadge";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    report: Report;
    onEdit?: (report: Report) => void;
    onDelete?: (report: Report) => void;
};

const TILE = 92;

export default function ReportCard({ report, onEdit, onDelete }: Props) {
    const c = useTheme();

    // Laporan yang sudah diproses admin tidak boleh diubah/dihapus (dijaga juga di server).
    const editable = report.status === "pending";

    const confirmDelete = () => {
        Alert.alert("Hapus laporan?", `"${report.title}" akan dihapus permanen.`, [
            { text: "Batal", style: "cancel" },
            { text: "Hapus", style: "destructive", onPress: () => onDelete?.(report) },
        ]);
    };

    return (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            {/* Kiri: foto, lalu lokasi di bawahnya */}
            <View style={styles.left}>
                <ReportPhoto uri={report.photoUrl} size={TILE} />
                <LocationTile
                    latitude={report.latitude}
                    longitude={report.longitude}
                    label={report.locationLabel}
                    size={TILE}
                />
            </View>

            {/* Kanan: judul + aksi, kategori + tanggal, status, deskripsi */}
            <View style={styles.right}>
                <View style={styles.row}>
                    <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                        {report.title}
                    </Text>

                    {editable && (onEdit || onDelete) && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <Pressable
                                    onPress={() => onEdit(report)}
                                    hitSlop={8}
                                    accessibilityRole="button"
                                    accessibilityLabel="Edit laporan"
                                    style={styles.actionButton}
                                >
                                    <Ionicons name="create-outline" size={20} color={c.textMuted} />
                                </Pressable>
                            )}
                            {onDelete && (
                                <Pressable
                                    onPress={confirmDelete}
                                    hitSlop={8}
                                    accessibilityRole="button"
                                    accessibilityLabel="Hapus laporan"
                                    style={styles.actionButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color={c.danger} />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaText}>
                        <Text style={[styles.category, { color: c.leaf }]} numberOfLines={1}>
                            {report.category}
                        </Text>
                        <Text style={[styles.date, { color: c.textMuted }]} numberOfLines={1}>
                            {formatDateTime(report.createdAt)}
                        </Text>
                    </View>
                    <StatusBadge status={report.status} />
                </View>

                <View style={[styles.descBox, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                    <Text style={[styles.desc, { color: c.text }]} numberOfLines={5}>
                        {report.description}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 12,
        borderRadius: 22,
        borderWidth: 1,
        padding: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    actions: { flexDirection: "row", gap: 10 },
    actionButton: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
    left: { gap: 8 },
    right: { flex: 1, gap: 8 },
    title: { flex: 1, fontSize: 16, fontWeight: "800", lineHeight: 21 },
    metaRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
    metaText: { flex: 1 },
    category: { fontSize: 13, fontWeight: "700" },
    date: { fontSize: 12, marginTop: 2 },
    descBox: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        padding: 10,
    },
    desc: { fontSize: 13, lineHeight: 19 },
});