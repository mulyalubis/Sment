import React, { useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryPicker from "../components/CategoryPicker";
import LocationField from "../components/LocationField";
import PhotoPicker from "../components/PhotoPicker";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { WasteCategory, CATEGORY_META } from "../constants/categories";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useTheme } from "../hooks/useTheme";
import { Detection, detectWaste } from "../services/detectWaste";
import { Report } from "../types/report";

export type NewReportInput = {
    photoUri: string;
    photoMime: string;
    /** true kalau foto baru dipilih (wajib diunggah). false = pakai foto lama (mode edit). */
    photoChanged: boolean;
    category: WasteCategory;
    aiConfidence?: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    locationLabel: string;
};

type ScrollViewHandle = React.ComponentRef<typeof ScrollView>;

type Props = {
    onSubmit: (input: NewReportInput) => Promise<void>;
    onBack: () => void;
    /** Diisi saat mengedit laporan yang sudah ada. */
    initial?: Report;
};

export default function NewReportScreen({ onSubmit, onBack, initial }: Props) {
    const c = useTheme();
    const location = useCurrentLocation();
    const isEdit = !!initial;

    // Saat keyboard terbuka, gulir otomatis ke kolom yang sedang diketik.
    const scrollRef = useRef<ScrollViewHandle>(null);
    const fieldY = useRef<Record<string, number>>({});
    const track = (key: string) => ({
        onLayout: (e: LayoutChangeEvent) => {
            fieldY.current[key] = e.nativeEvent.layout.y;
        },
    });
    const scrollToField = (key: string) => () => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({
                y: Math.max((fieldY.current[key] ?? 0) - 24, 0),
                animated: true,
            });
        }, 150);
    };

    const [photo, setPhoto] = useState<{ uri: string; mime: string } | null>(
        initial?.photoUrl ? { uri: initial.photoUrl, mime: "image/jpeg" } : null
    );
    const [photoChanged, setPhotoChanged] = useState(!isEdit);
    const [detecting, setDetecting] = useState(false);
    const [detection, setDetection] = useState<Detection | null>(null);
    const [detectError, setDetectError] = useState("");
    const [category, setCategory] = useState<WasteCategory | undefined>(
        initial?.category as WasteCategory | undefined
    );
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Mode edit: pakai lokasi laporan sampai pengguna menekan "perbarui lokasi".
    const [keepInitialLocation, setKeepInitialLocation] = useState(isEdit);
    const lat = keepInitialLocation ? initial?.latitude : location.latitude;
    const lng = keepInitialLocation ? initial?.longitude : location.longitude;
    const locLabel = keepInitialLocation ? initial?.locationLabel : location.label;

    const runDetection = async (uri: string) => {
        setDetecting(true);
        setDetectError("");
        setDetection(null);
        try {
            const result = await detectWaste(uri);
            setDetection(result);
            setCategory(result.label);
        } catch (e: any) {
            console.log("detectWaste error:", e);
            setDetectError("Deteksi otomatis gagal. Pilih kategori secara manual.");
        } finally {
            setDetecting(false);
        }
    };

    const handleAsset = (result: ImagePicker.ImagePickerResult) => {
        if (result.canceled) return;
        const asset = result.assets[0];
        setPhoto({ uri: asset.uri, mime: asset.mimeType ?? "image/jpeg" });
        setPhotoChanged(true);
        runDetection(asset.uri);
    };

    const openCamera = async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Izin kamera diperlukan", "Aktifkan izin kamera di pengaturan perangkat.");
            return;
        }
        handleAsset(await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 }));
    };

    const openGallery = async () => {
        handleAsset(
            await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 })
        );
    };

    const hint = (() => {
        if (detectError) return detectError;
        if (!detection) return undefined;
        const name = CATEGORY_META[detection.label].label;
        const pct = Math.round(detection.confidence * 100);
        return detection.source === "dummy"
            ? `Hasil contoh: ${name} (${pct}%). Model AI belum terhubung.`
            : `Terdeteksi AI: ${name} (${pct}%). Anda bisa mengubahnya.`;
    })();

    const locationReady =
        keepInitialLocation ||
        (location.status === "ready" &&
            location.latitude !== undefined &&
            location.longitude !== undefined);

    const valid =
        !!photo &&
        !!category &&
        locationReady &&
        title.trim().length >= 3 &&
        description.trim().length >= 5;

    const handleSubmit = async () => {
        if (!valid || !photo || !category || !locationReady) return;
        setSubmitting(true);
        setSubmitError("");
        try {
            await onSubmit({
                photoUri: photo.uri,
                photoMime: photo.mime,
                photoChanged,
                category,
                // Confidence hanya disimpan kalau kategori akhir sama dengan tebakan AI.
                aiConfidence: detection && detection.label === category ? detection.confidence : undefined,
                title: title.trim(),
                description: description.trim(),
                latitude: lat!,
                longitude: lng!,
                locationLabel: locLabel ?? "",
            });
        } catch (e: any) {
            const message = e?.message ?? "Gagal mengirim laporan. Coba lagi.";
            setSubmitError(message);
            Alert.alert(isEdit ? "Gagal menyimpan perubahan" : "Gagal mengirim laporan", message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={["top", "bottom"]}>
            <KeyboardAvoidingView style={styles.flex} behavior="padding">
                <View style={styles.header}>
                    <Pressable
                        onPress={onBack}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Kembali"
                    >
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </Pressable>
                    <Text style={[styles.title, { color: c.text }]}>
                        {isEdit ? "Edit laporan" : "Buat laporan"}
                    </Text>
                </View>

                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <PhotoPicker
                        uri={photo?.uri}
                        detecting={detecting}
                        onCamera={openCamera}
                        onGallery={openGallery}
                    />

                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: c.text }]}>Jenis sampah</Text>
                        <CategoryPicker value={category} onChange={setCategory} hint={hint} />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: c.text }]}>Lokasi</Text>
                        <LocationField
                            status={keepInitialLocation ? "ready" : location.status}
                            label={locLabel}
                            onRefresh={() => {
                                setKeepInitialLocation(false);
                                location.refresh();
                            }}
                        />
                    </View>

                    <View {...track("title")}>
                        <TextField
                            label="Judul laporan"
                            placeholder="Mis. Botol plastik di selokan"
                            value={title}
                            onChangeText={setTitle}
                            onFocus={scrollToField("title")}
                            maxLength={100}
                            returnKeyType="next"
                        />
                    </View>

                    <View {...track("description")}>
                        <TextField
                            label="Deskripsi"
                            placeholder="Jelaskan kondisi sampah dan lokasinya"
                            value={description}
                            onChangeText={setDescription}
                            onFocus={scrollToField("description")}
                            maxLength={1000}
                            multiline
                        />
                    </View>

                    {!!submitError && (
                        <Text style={[styles.error, { color: c.danger }]} accessibilityLiveRegion="polite">
                            {submitError}
                        </Text>
                    )}

                    <PrimaryButton
                        label={isEdit ? "Simpan perubahan" : "Kirim laporan"}
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={!valid || detecting}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 12 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
    content: { paddingHorizontal: 20, paddingBottom: 40, gap: 18 },
    section: { gap: 8 },
    sectionLabel: { fontSize: 14, fontWeight: "600" },
    error: { fontSize: 13, textAlign: "center" },
});