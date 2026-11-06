import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useConvexAuth } from "convex/react";
import AppProviders from "../providers/AppProviders";
import { useTheme } from "../hooks/useTheme";

function AuthGate() {
  const c = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const onAccount = segments[0] === "account";

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && onAccount) router.replace("/");
  }, [isLoading, isAuthenticated, onAccount, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="account" />
        <Stack.Screen name="reports/new" options={{ animation: "slide_from_bottom" }} />
      </Stack>

      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: c.bg }]}>
          <ActivityIndicator color={c.leaf} size="large" />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGate />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", justifyContent: "center" },
});