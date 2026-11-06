import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

type State = {
    status: "loading" | "ready" | "denied" | "error";
    latitude?: number;
    longitude?: number;
    label?: string;
};

export function useCurrentLocation() {
    const [state, setState] = useState<State>({ status: "loading" });

    const refresh = useCallback(async () => {
        setState({ status: "loading" });
        try {
            const perm = await Location.requestForegroundPermissionsAsync();
            if (perm.status !== "granted") {
                setState({ status: "denied" });
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = pos.coords;

            // Nama tempat dari koordinat. Kalau gagal, pakai koordinat saja.
            let label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            try {
                const [p] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (p) {
                    const parts = [p.street ?? p.name, p.district, p.city ?? p.subregion].filter(Boolean);
                    if (parts.length) label = parts.join(", ");
                }
            } catch {
                /* abaikan, pakai koordinat */
            }

            setState({ status: "ready", latitude, longitude, label });
        } catch {
            setState({ status: "error" });
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { ...state, refresh };
}