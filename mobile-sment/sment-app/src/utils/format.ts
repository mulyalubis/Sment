export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${date}, ${time}`;
}