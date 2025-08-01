import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';  // import useSegments
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_300Light,
  Poppins_800ExtraBold,
  Poppins_500Medium,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync(); // ensures splash screen stays while fonts load

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_300Light,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_500Medium,
    Poppins_900Black,
  });

  // This hook gives you the current route segments (like path parts)
  const segments = useSegments();

  useEffect(() => {
    console.log('Current navigation segments:', segments);
  }, [segments]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // wait for fonts to load

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#9D9B9B',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          height: 75,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      {/* Feed */}
      <Tabs.Screen
        name="01-feed"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('@/assets/house.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#000' : '#9D9B9B',
                resizeMode: 'contain',
                marginTop: 20,
              }}
            />
          ),
        }}
      />

      {/* Explore */}
      <Tabs.Screen
        name="02-explore"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('@/assets/loupe.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#000' : '#9D9B9B',
                resizeMode: 'contain',
                marginTop: 20,
              }}
            />
          ),
        }}
      />

      {/* Post */}
      <Tabs.Screen
        name="03-post"
        options={{
          tabBarIcon: () => (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
                shadowColor: '#9D9B9B',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              <Ionicons name="add" size={40} color="#fff" />
            </View>
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="04-profile/index"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('@/assets/clothes-hanger.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#000' : '#9D9B9B',
                resizeMode: 'contain',
                marginTop: 20,
              }}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="05-settings"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('@/assets/settings.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#000' : '#9D9B9B',
                resizeMode: 'contain',
                marginTop: 23,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
  name="04-profile/[uid]"
  options={{
    href: null, // hides this route from showing as a tab
  }}
/>

    </Tabs>
  );
}
