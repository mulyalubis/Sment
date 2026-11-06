import { Ionicons } from "@expo/vector-icons";
import { ReportStatus } from "../types/report";

export const STATUS_ORDER: ReportStatus[] = [
    "pending",
    "in_progress",
    "completed",
    "rejected",
];

export const STATUS_META: Record<
    ReportStatus,
    { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
    pending: { label: "Pending", icon: "time-outline", color: "#9AA5A3" },
    in_progress: { label: "In Progress", icon: "construct-outline", color: "#4BA3E3" },
    completed: { label: "Completed", icon: "checkmark-circle-outline", color: "#3DBE7A" },
    rejected: { label: "Rejected", icon: "close-circle-outline", color: "#E5604F" },
};