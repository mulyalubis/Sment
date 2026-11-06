// Taruh di folder yang sama dengan route "buat laporan" (mis. src/app/report/edit.tsx),
// supaya path import di bawah ini sama dengan file tersebut.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import NewReportScreen from "../../screens/NewReportScreen";
import { convexErrorMessage } from "../../utils/convexError";

export default function EditReport() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const report = useQuery(api.reports.get, id ? { id: id as Id<"reports"> } : "skip");
    const generateUploadUrl = useMutation(api.reports.generateUploadUrl);
    const updateReport = useMutation(api.reports.update);

    const goBack = () => (router.canGoBack() ? router.back() : router.replace("/history"));

    if (report === undefined) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (report === null) {
        return (
            <View style={styles.center}>
                <Text>Laporan tidak ditemukan.</Text>
                <Pressable onPress={goBack}>
                    <Text style={styles.link}>Kembali</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <NewReportScreen
            initial={report}
            onBack={goBack}
            onSubmit={async (input) => {
                try {
                    // Unggah foto hanya kalau diganti
                    let photoId: Id<"_storage"> | undefined;
                    if (input.photoChanged) {
                        const uploadUrl = await generateUploadUrl();
                        const res = await fetch(uploadUrl, {
                            method: "POST",
                            headers: { "Content-Type": input.photoMime },
                            body: new File(input.photoUri),
                        });
                        if (!res.ok) throw new Error("Upload foto gagal. Coba lagi.");
                        const { storageId } = await res.json();
                        photoId = storageId as Id<"_storage">;
                    }

                    await updateReport({
                        id: report.id as Id<"reports">,
                        title: input.title,
                        description: input.description,
                        category: input.category,
                        aiConfidence: input.aiConfidence,
                        latitude: input.latitude,
                        longitude: input.longitude,
                        locationLabel: input.locationLabel,
                        photoId,
                    });
                } catch (e) {
                    throw new Error(convexErrorMessage(e, "Gagal menyimpan perubahan. Coba lagi."));
                }

                router.replace("/history");
            }}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    link: { color: "#2e7d32", fontWeight: "600" },
});