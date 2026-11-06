import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { STATUS_META } from "../constants/status";
import { ReportStatus } from "../types/report";

type Props = { status: ReportStatus };

export default function StatusBadge({ status }: Props) {
    const meta = STATUS_META[status];
    return (
        <View style={[styles.badge, { backgroundColor: meta.color + "26" }]}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { fontSize: 11, fontWeight: "700" },
});