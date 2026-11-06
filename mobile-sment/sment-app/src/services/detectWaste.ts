import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { WASTE_CATEGORIES, WasteCategory } from "../constants/categories";

export type Detection = {
    label: WasteCategory;
    confidence: number; // 0 sampai 1
    source: "ml" | "dummy";
};

const ML_URL = process.env.EXPO_PUBLIC_ML_API_URL?.replace(/\/+$/, "");
const TIMEOUT_MS = 25000;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// "Plastic", "plastic_waste", "PLASTIC WASTE" -> dianggap sama
const norm = (s: string) => s.toLowerCase().replace(/waste/g, "").replace(/[^a-z]/g, "");
const toCategory = (label: string) => WASTE_CATEGORIES.find((c) => norm(c) === norm(label));

export async function detectWaste(photoUri: string): Promise<Detection> {
    if (!ML_URL) {
        await wait(900);
        return { label: "Plastic Waste", confidence: 0.9, source: "dummy" };
    }

    const form = new FormData();
    form.append("file", new File(photoUri)); // nama field harus "file" (sesuai FastAPI)

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(`${ML_URL}/predict`, {
            method: "POST",
            body: form, // jangan set Content-Type manual
            headers: { "ngrok-skip-browser-warning": "1" },
            signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Deteksi gagal (${res.status}): ${await res.text()}`);

        const data = await res.json(); // { label, confidence, probabilities }
        const label = toCategory(String(data.label));
        if (!label) throw new Error(`Label tidak dikenal dari server: "${data.label}"`);
        return { label, confidence: Number(data.confidence), source: "ml" };
    } finally {
        clearTimeout(timer);
    }
}