export const palettes = {
    dark: {
        bg: "#0D1A19",
        surface: "#152826",
        surfaceAlt: "#1C3431",
        border: "#25423E",
        text: "#EAF4F1",
        textMuted: "#8FA9A4",
        hero: "#12302C",
        heroRing: "#1B4A43",
        accent: "#F2B63D", // kunyit: aksi utama
        onAccent: "#2B1E00",
        leaf: "#52C7B0",
        link: "#F2A23A", // teks tautan (oranye)
        danger: "#F0705F",
    },
    light: {
        bg: "#EEF4F2",
        surface: "#FFFFFF",
        surfaceAlt: "#E3EDEA",
        border: "#D3E1DD",
        text: "#10231F",
        textMuted: "#5B746E",
        hero: "#D6EBE5",
        heroRing: "#BFE0D7",
        accent: "#E8A416",
        onAccent: "#2B1E00",
        leaf: "#1F8F7C",
        link: "#B35F00",
        danger: "#C73E2E",
    },
};

export type Palette = typeof palettes.dark;