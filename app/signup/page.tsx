import { auth, db } from '@/firebase/firebaseConfig'; // adjust path if needed
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ShadowView } from 'react-native-inner-shadow';



export default function Landing() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  async function checkUsernameExists(username: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
  const handleSignup = async () => {
    console.log("Signup initiated");
  
    // Log the input values
    console.log("email:", email);
    console.log("password:", password);
    console.log("username:", username);
  
    // Check if any field is empty
    if (!email.trim() || !password.trim() || !username.trim()) {
      console.log("One or more fields are empty");
      alert("Please fill all fields");
      return;
    }
  
    try {
      console.log("All fields filled. Attempting Firebase signup...");
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Firebase signup successful:", user.uid);
  
      // Save user info to Firestore with initial followers/following data
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        uid: user.uid,
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        // add any other fields you're saving
      });
  
      console.log("User saved to Firestore");
  
      alert("Account created!");
      // Optionally, redirect to a logged-in landing page
      // router.push('/somepage');
  
    } catch (error) {
      console.log("Signup failed:", error.message);
      alert(error.message);
    }
  };
  
  

  return (
    <View style={styles.container}>
       
       <View style={styles.curvedTopBox}>
             <Text style={styles.signupText}>Sign up here.</Text>
               
        <ShadowView
          inset
          shadowColor="#CCCCCC"
          shadowOffset={{ width: 0, height: 2 }}
          shadowBlur={5}
          style={[styles.inputBox, { position: 'absolute', top: 230, left: 40 }]}
        >
          <TextInput
             style={[styles.input,{ color: '#9D9B9B' }, { paddingVertical: 30,paddingLeft: -2}]} 
             value={email}
            onChangeText={setEmail}
            placeholder="email"
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
             style={[styles.input, { paddingTop: 27,paddingLeft: -2}]} 
             value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor="#9D9B9B"
          />
        </ShadowView>

        <ShadowView
          inset
          shadowColor="#CCCCCC"
          shadowOffset={{ width: 0, height: 2 }}
          shadowBlur={5}
          style={[styles.inputBox, { position: 'absolute', top: 430, left: 40 }]}
        >
          <TextInput
             style={[styles.input, { paddingTop: 27,paddingLeft: -2}]} 
             value={password}
             onChangeText={setPassword}
            placeholder="password"
            placeholderTextColor="#9D9B9B"
          />
        </ShadowView>
        <TouchableOpacity style={[styles.signupBox, { position: 'absolute', top: 500, left: 110 }]} onPress={handleSignup}>
            <Text style={styles.signupbutton}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
                console.log("Button clicked");
                router.push('/login/page');
              }}>
                <Text style={styles.linkText}>Log-in instead</Text>
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
      lineHeight: 45,
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
        height: 55,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#000',
      // important so it doesn't override shadow container's background
        borderRadius: 16,
      },
    linkText: {
    
      left: 113,           // same horizontal alignment as title
      top: 530,           // slightly below the title top:457 + title height + margin
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
  