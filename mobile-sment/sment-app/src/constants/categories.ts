import { Ionicons } from "@expo/vector-icons";

export const WASTE_CATEGORIES = ["Organic Waste", "Plastic Waste", "Paper Waste"] as const;
export type WasteCategory = (typeof WASTE_CATEGORIES)[number];

export const CATEGORY_META: Record<
    WasteCategory,
    { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
    "Organic Waste": { label: "Organik", icon: "leaf-outline" },
    "Plastic Waste": { label: "Plastik", icon: "beaker-outline" },
    "Paper Waste": { label: "Kertas", icon: "document-text-outline" },
};