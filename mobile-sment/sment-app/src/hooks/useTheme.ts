import { useColorScheme } from "react-native";
import { palettes, Palette } from "../constants/theme";

// Mengikuti mode terang/gelap perangkat.
export function useTheme(): Palette {
    const scheme = useColorScheme();
    return scheme === "light" ? palettes.light : palettes.dark;
}