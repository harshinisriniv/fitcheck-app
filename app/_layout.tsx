
import { Stack } from "expo-router";
import React from "react";
import FontProvider from "@/components/fontsprovider";  // fix path case if needed

export default function RootLayout() {
  return (
    <FontProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </FontProvider>
  );
}
