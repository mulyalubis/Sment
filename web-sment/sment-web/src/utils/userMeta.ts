export type UserRole = "admin" | "user";

// Bentuknya sama dengan hasil userAdmin.listWithStats di Convex.
export type UserRow = {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role: UserRole;
    disabled: boolean;
    isSelf: boolean;
    createdAt: string;
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    rejected: number;
};

export const ROLES: { key: UserRole; label: string }[] = [
    { key: "admin", label: "Admin" },
    { key: "user", label: "User" },
];