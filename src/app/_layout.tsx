import "react-native-gesture-handler";
import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PreferencesProvider, usePreferences, useResolvedScheme } from "../preferences";
import { SessionProvider, useSession } from "../session";
import { darkPalette, lightPalette } from "../theme/palettes";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <SessionProvider>
            <ThemedShell />
          </SessionProvider>
        </PreferencesProvider>
      </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const scheme = useResolvedScheme();
  const { ready: preferencesReady } = usePreferences();
  const { ready: sessionReady, token } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const ready = preferencesReady && sessionReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const root = segments[0];
    const guest = root === "chat" || root === "login";
    if (!token && !guest) router.replace("/chat");
    if (token && guest) router.replace("/activities");
  }, [ready, router, segments, token]);

  return (
    <View style={scheme === "dark" ? darkPalette : lightPalette} className="flex-1 bg-background">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
    </View>
  );
}
