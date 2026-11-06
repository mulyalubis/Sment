import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

type Props = {
    image?: ImageSourcePropType;
};

export default function HeroCard({ image }: Props) {
    const c = useTheme();

    return (
        <View style={styles.wrap}>
            <View style={[styles.imageBox, { backgroundColor: c.hero }]}>
                {image ? (
                    <Image source={image} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.art}>
                        <View style={[styles.ring, styles.ringLarge, { backgroundColor: c.heroRing }]} />
                        <View style={[styles.ring, styles.ringSmall, { backgroundColor: c.surface }]} />
                        <Ionicons name="trash-outline" size={72} color={c.leaf} />
                        <View style={[styles.leafChip, { backgroundColor: c.leaf }]}>
                            <Ionicons name="leaf" size={16} color={c.bg} />
                        </View>
                    </View>
                )}
            </View>

            <Text style={[styles.title, { color: c.text }]}>
                Mau sekitar Anda bersih dan nyaman tanpa sampah yang berserakan?
            </Text>
            <Text style={[styles.sub, { color: c.textMuted }]}>
                Segera laporkan ke sment-app.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: "center" },
    imageBox: {
        width: "100%",
        height: 230,
        borderRadius: 28,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    image: { width: "100%", height: "100%" },
    art: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
    ring: { position: "absolute", borderRadius: 999 },
    ringLarge: { width: 180, height: 180 },
    ringSmall: { width: 120, height: 120 },
    leafChip: {
        position: "absolute",
        right: 24,
        top: 28,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        lineHeight: 28,
        letterSpacing: -0.3,
        textAlign: "center",
        marginTop: 18,
    },
    sub: { fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 4 },
});