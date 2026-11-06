import React from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = {
    uri?: string;
    detecting?: boolean;
    onCamera: () => void;
    onGallery: () => void;
};

export default function PhotoPicker({ uri, detecting, onCamera, onGallery }: Props) {
    const c = useTheme();

    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={onCamera}
                accessibilityRole="button"
                accessibilityLabel={uri ? "Ambil ulang foto" : "Ambil foto sampah"}
                style={[
                    styles.box,
                    { backgroundColor: c.surfaceAlt, borderColor: c.border },
                    !uri && styles.boxEmpty,
                ]}
            >
                {uri ? (
                    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="camera-outline" size={40} color={c.leaf} />
                        <Text style={[styles.placeholderText, { color: c.textMuted }]}>
                            Ketuk untuk memotret sampah
                        </Text>
                    </View>
                )}

                {detecting && (
                    <View style={styles.overlay}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.overlayText}>Mendeteksi jenis sampah...</Text>
                    </View>
                )}
            </Pressable>

            <View style={styles.actions}>
                <Pressable onPress={onCamera} hitSlop={8} style={styles.action} accessibilityRole="button">
                    <Ionicons name="camera" size={18} color={c.leaf} />
                    <Text style={[styles.actionText, { color: c.leaf }]}>{uri ? "Ambil ulang" : "Ambil foto"}</Text>
                </Pressable>
                <Pressable onPress={onGallery} hitSlop={8} style={styles.action} accessibilityRole="button">
                    <Ionicons name="images-outline" size={18} color={c.leaf} />
                    <Text style={[styles.actionText, { color: c.leaf }]}>Pilih dari galeri</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 10 },
    box: {
        height: 230,
        borderRadius: 24,
        borderWidth: 1,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    boxEmpty: { borderStyle: "dashed", borderWidth: 2 },
    image: { width: "100%", height: "100%" },
    placeholder: { alignItems: "center", gap: 8 },
    placeholderText: { fontSize: 14 },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    overlayText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    actions: { flexDirection: "row", justifyContent: "center", gap: 28 },
    action: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionText: { fontSize: 14, fontWeight: "700" },
});