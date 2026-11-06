import React from "react";
import { LogBox, Platform } from "react-native";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";

// Error dari server sudah ditampilkan ke user lewat Alert, jadi kotak merah LogBox
// (hanya muncul saat development) disembunyikan. Log lengkap tetap ada di terminal Metro.
LogBox.ignoreLogs([/\[CONVEX/]);

const url = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!url) {
    throw new Error("EXPO_PUBLIC_CONVEX_URL belum diisi. Buat file mobile/.env (lihat .env.example).");
}

// unsavedChangesWarning dimatikan karena tidak berlaku di React Native.
const convex = new ConvexReactClient(url, { unsavedChangesWarning: false });

// Token login disimpan aman di keychain/keystore perangkat.
const secureStorage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
};

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ConvexAuthProvider
            client={convex}
            storage={Platform.OS === "web" ? undefined : secureStorage}
        >
            {children}
        </ConvexAuthProvider>
    );
}