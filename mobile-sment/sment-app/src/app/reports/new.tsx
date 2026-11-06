import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import NewReportScreen from "../../screens/NewReportScreen";
import { convexErrorMessage } from "../../utils/convexError";

export default function NewReport() {
    const router = useRouter();
    const generateUploadUrl = useMutation(api.reports.generateUploadUrl);
    const createReport = useMutation(api.reports.create);

    const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

    return (
        <NewReportScreen
            onBack={goBack}
            onSubmit={async (input) => {
                try {
                    // 1. Unggah foto ke Convex Storage
                    const uploadUrl = await generateUploadUrl();
                    const res = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": input.photoMime },
                        body: new File(input.photoUri),
                    });
                    if (!res.ok) throw new Error("Upload foto gagal. Coba lagi.");
                    const { storageId } = await res.json();

                    // 2. Simpan laporan
                    await createReport({
                        title: input.title,
                        description: input.description,
                        category: input.category,
                        aiConfidence: input.aiConfidence,
                        photoId: storageId as Id<"_storage">,
                        latitude: input.latitude,
                        longitude: input.longitude,
                        locationLabel: input.locationLabel,
                    });
                } catch (e) {
                    // Pesan dari ConvexError (mis. "Anda belum login.") diteruskan ke layar.
                    throw new Error(convexErrorMessage(e, "Gagal mengirim laporan. Coba lagi."));
                }

                router.replace("/history");
            }}
        />
    );
}