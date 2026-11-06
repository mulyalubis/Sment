export type ReportStatus = "pending" | "in_progress" | "completed" | "rejected";

export type Report = {
    id: string;
    userId?: string;
    title: string;
    description: string;
    category: string; // hasil AI, mis. "Plastic Waste"
    status: ReportStatus;
    photoUrl?: string;
    latitude: number;
    longitude: number;
    locationLabel: string;
    createdAt: string; // ISO
    aiConfidence?: number;
    adminNote?: string;
};