import React, { createContext, useMemo, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { ImageSourcePropType } from "react-native";
import { useQuery } from "convex/react";

// Exported wallpaper context so all screens can read/update selection
export const WallpaperContext = createContext<{ index: number; setIndex: (i: number) => void }>({
  index: 0,
  setIndex: () => {},
});

// UI settings context (zoom + compact) shared across screens
export const UISettingsContext = createContext<{ zf: number; compact: boolean }>({
  zf: 0.4,
  compact: false,
});

const api: any = {
  displaySettings: {
    getByClientId: "displaySettings:getByClientId",
  },
};

// Ten preset wallpapers. Add files to assets and swap here when available.
// Currently includes three real images and repeats to reach 10 options.
export const WALLPAPERS: ImageSourcePropType[] = [
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
  require("../assets/myday_bg.png"),
];

// Use environment variable for Convex URL
// Ensure EXPO_PUBLIC_CONVEX_URL is properly loaded from .env file
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl || convexUrl.includes('placeholder-url')) {
  console.error('EXPO_PUBLIC_CONVEX_URL is not set or contains placeholder. Please check your .env file.');
}

const convex = new ConvexReactClient(convexUrl || "https://quixotic-gopher-969.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function Layout() {
  const [index, setIndex] = useState(0);
  const ctx = useMemo(() => ({ index, setIndex }), [index]);
  return (
    <ConvexProvider client={convex}>
      <WallpaperContext.Provider value={ctx}>
        <Inner />
      </WallpaperContext.Provider>
    </ConvexProvider>
  );
}

function Inner() {
  const ds = useQuery(api.displaySettings.getByClientId, { clientId: "default" }) as
    | { zoomLevel?: number; compactMode?: boolean }
    | undefined;
  const zf = (typeof ds?.zoomLevel === "number" ? ds.zoomLevel : 40) / 100;
  const compact = Boolean(ds?.compactMode);
  const ui = useMemo(() => ({ zf, compact }), [zf, compact]);
  return (
    <UISettingsContext.Provider value={ui}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="all" options={{ headerShown: false }} />
        <Stack.Screen name="completed" options={{ headerShown: false }} />
        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="reports" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </UISettingsContext.Provider>
  );
}
