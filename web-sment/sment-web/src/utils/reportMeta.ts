export type ReportStatus = "pending" | "in_progress" | "completed" | "rejected";

// Bentuknya sama dengan hasil reports.listAll di Convex (ditambah reporterName).
export type ReportRow = {
    id: string;
    title: string;
    description: string;
    category: string;
    status: ReportStatus;
    latitude: number;
    longitude: number;
    locationLabel: string;
    createdAt: string;
    photoUrl?: string;
    reporterName?: string;
    source?: "user" | "admin";
    editedByAdmin?: boolean;
    original?: {
        title: string;
        description: string;
        locationLabel: string;
        latitude: number;
        longitude: number;
    };
};

// Data yang diisi admin di kartu tambah / edit laporan.
export type ReportDraft = {
    title: string;
    description: string;
    category: string;
    locationLabel: string;
    latitude: number;
    longitude: number;
    photoFile?: File; // hanya ada kalau foto dipilih atau diganti
};

// Warna dan label sama dengan STATUS di Dashboard dan aplikasi mobile.
export const STATUS: Record<ReportStatus, { label: string; color: string }> = {
    pending: { label: "Pending", color: "#9AA5A3" },
    in_progress: { label: "In Progress", color: "#4BA3E3" },
    completed: { label: "Completed", color: "#3DBE7A" },
    rejected: { label: "Rejected", color: "#E5604F" },
};

export const STATUS_KEYS = Object.keys(STATUS) as ReportStatus[];

// Sama dengan kategori hasil model ML (CATEGORIES di convex/reports.ts).
export const CATEGORIES = ["Organic Waste", "Plastic Waste", "Paper Waste"] as const;