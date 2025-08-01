// components/FontProvider.tsx
import {
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    Poppins_500Medium,
    useFonts
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
  

SplashScreen.preventAutoHideAsync(); // Keeps splash screen up until fonts load

export default function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    Poppins_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash when fonts are ready
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <>{children}</>;
}
