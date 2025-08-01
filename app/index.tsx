import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../assets/logo.png';


export default function Landing() {
  const router = useRouter();
  

  return (
    <View style={styles.container}>
        <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Welcome to fitCheck.</Text>

      <TouchableOpacity onPress={() => {
        console.log("Button clicked");
        router.push('/signup/page');
      }}>
        <Text style={styles.linkText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 45,
    color: '#000',
    position: 'absolute',
    left: 79,         // X position from Figma
    top: 530,         // Y position from Figma
    width: 282,       // Optional, only if text wraps in design
    textAlign: 'left',
    lineHeight: 48,
  },
  logo: {
   
    width: 300,         // or whatever size fits your design
    height: 300,
    top: -23,           // Y-position from Figma
    left: -3,          // X-position from Figma
    resizeMode: 'contain',
  },
  linkText: {
  
    left: -3,           // same horizontal alignment as title
    top: 20,           // slightly below the title top:457 + title height + margin
    fontFamily: 'Poppins_500Medium',
    fontSize: 20,
    color: '#5D5A5A',
     // Drop shadow
     textShadowColor: 'rgba(125, 125, 125, 0.75)',    // soft black shadow
     textShadowOffset: { width: 0, height: 2 },   // increase if you want more separation
     textShadowRadius: 6,           
  },
});
