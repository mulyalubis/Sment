import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { formatDate } from "../utils/format";
import { Report } from "../types/report";
import StatusBadge from "./StatusBadge";

type Props = { report: Report };

export default function ReportRow({ report }: Props) {
    const c = useTheme();
    return (
        <View style={[styles.row, { borderTopColor: c.border }]}>
            {report.photoUrl ? (
                <Image source={{ uri: report.photoUrl }} style={styles.thumb} />
            ) : (
                <View style={[styles.thumb, styles.thumbEmpty, { backgroundColor: c.surfaceAlt }]}>
                    <Ionicons name="image-outline" size={20} color={c.textMuted} />
                </View>
            )}
            <View style={styles.body}>
                <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
                    {report.title}
                </Text>
                <Text style={[styles.meta, { color: c.textMuted }]}>
                    {report.category}, {formatDate(report.createdAt)}
                </Text>
            </View>
            <StatusBadge status={report.status} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingTop: 14,
        marginTop: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    thumb: { width: 48, height: 48, borderRadius: 12 },
    thumbEmpty: { alignItems: "center", justifyContent: "center" },
    body: { flex: 1 },
    title: { fontSize: 14, fontWeight: "600" },
    meta: { fontSize: 12, marginTop: 2 },
});