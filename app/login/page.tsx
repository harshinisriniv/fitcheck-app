import { auth, db } from '@/firebase/firebaseConfig';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ShadowView } from 'react-native-inner-shadow';


export default function Landing() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!username || !password) {
      alert('Please fill in both fields');
      return;
    }

    try {
      // First, fetch the email associated with the username
      const q = query(collection(db, 'users'), where('username', '==', username.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No account found with that username');
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const email = userData.email;

      // Now sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/tabs/04-profile');

      // Navigate somewhere after login:
      // router.push('/home');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        alert('Incorrect password');
      } else {
        alert(err.message);
      }
    }
  }
  

  

  return (
    <View style={styles.container}>
       
       <View style={styles.curvedTopBox}>
             <Text style={styles.signupText }>Log in here.</Text>
            
       
        <ShadowView
          inset
          shadowColor="#CCCCCC"
          shadowOffset={{ width: 0, height: 2 }}
          shadowBlur={5}
          style={[styles.inputBox, { position: 'absolute', top: 230, left: 40 }]}
        >
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[styles.input, { paddingTop: 27,paddingLeft: -2}]} 
            placeholder="username"
            placeholderTextColor="#9D9B9B"
          />
        </ShadowView>

        <ShadowView
          inset
          shadowColor="#CCCCCC"
          shadowOffset={{ width: 0, height: 2 }}
          shadowBlur={5}
          style={[styles.inputBox, { position: 'absolute', top: 330, left: 40 }]}
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { paddingTop: 27,paddingLeft: -2}]} 
            placeholder="password"
            placeholderTextColor="#9D9B9B"
          />
        </ShadowView>
        <TouchableOpacity
          style={[styles.signupBox, { position: 'absolute', top: 400, left: 108 }]}
          onPress={handleLogin}>
          <Text style={styles.signupbutton}>Log In</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => {
                console.log("Button clicked");
                router.push('/signup/page');
              }}>
                <Text style={styles.linkText}>Sign-up instead</Text>
              </TouchableOpacity>
    </View>
    
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#363636',
      paddingHorizontal: 24,
    },
    signupText: {
      fontFamily: 'Poppins_700Bold',
      fontSize: 50,
      color: '#000',
      position: 'absolute',
      left: 50,         // X position from Figma
      top: 80,         // Y position from Figma
      width: 282,       // Optional, only if text wraps in design
      textAlign: 'center',
      lineHeight: 50,
      paddingTop: 15,
    },
    curvedTopBox: {
        position: 'absolute',
        bottom: 0, // 🟢 attach to bottom
        width: '100%',
        height: 680, // or more depending on how far up the curve should go
      
        backgroundColor: '#F2F2F2',
      
        borderTopLeftRadius: 110,
        borderTopRightRadius: 110,
      
        // optional padding inside
        paddingTop: 40,
        paddingHorizontal: 24,

        shadowColor: '#E0DEDE',
        shadowOffset: { width: 0, height: 0}, // 🔽 flips shadow upward
        shadowOpacity: 1.00,
        shadowRadius: 13,
      },
      inputBox: {
        width: '90%',
        height: 55,
        backgroundColor: '#F7F7F7',       // Match your Figma background
        borderRadius: 25,                 // Rounded corners
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#000',
      },
      signupBox: {
        width: '50%',
        height: 50,
        backgroundColor: '#000',       // Match your Figma background
        borderRadius: 25,                 // Rounded corners
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#000',
      },
      input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#000',
        backgroundColor: 'transparent', // important so it doesn't override shadow container's background
        borderRadius: 16,
      },
    linkText: {
    
      left: 102,           // same horizontal alignment as title
      top: 430,           // slightly below the title top:457 + title height + margin
      fontFamily: 'Poppins_500Medium',
      fontSize: 16,
      color: '#7C7C7C',
       // Drop shadow
       textShadowColor: '#9D9B9B)',    // soft black shadow
       textShadowOffset: { width: 0, height: 2 },   // increase if you want more separation
       textShadowRadius: 3,           
    },
    signupbutton: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#fff',
      
        left: -80,         // X position from Figma
        top: -13,         // Y position from Figma
        width: 282,       // Optional, only if text wraps in design
        textAlign: 'center',
        lineHeight: 45,
        paddingTop: 15,
      },
  });

function setInputValue(value: any) {
  throw new Error('Function not implemented.');
}
  