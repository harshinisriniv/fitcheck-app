import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image } from 'react-native';
import { router } from 'expo-router'; 
import { getAuth, signOut } from 'firebase/auth';

const auth = getAuth();

async function handleLogout() {
  try {
    await signOut(auth);
    // Optionally, redirect user after logout:
    router.replace('/');  // or whatever your login screen route is
  } catch (error) {
    console.error('Error signing out: ', error);
    alert('Failed to log out, please try again.');
  }
}

export default function SettingsPage() {
  return (
    <View style={styles.container}>
      {/* Curved Top Box */}
      <View style={styles.curvedTopBox}>
        <Text style={styles.signupText}>Settings.</Text>
      
        <TouchableOpacity
  style={styles.button}
  onPress={() => router.push('/editprofile')}
>
  <View style={styles.buttonContent}>
    <Text style={styles.buttonText}>EDIT PROFILE</Text>
    <Image
      source={require('@/assets/forward.png')}
      style={styles.icon}
      resizeMode="contain"
    />
  </View>
</TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>LOG OUT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton}  onPress={() => router.push('/deleteaccount')}
        >
          <Text style={styles.deleteButtonText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363636',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  curvedTopBox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 700,
    backgroundColor: '#fff',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    paddingTop: 200, // ⬅️ increase this to push buttons down
    paddingHorizontal: 24,
    shadowColor: '#E0DEDE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 13,
    
  },

icon: {
  width: 35,
  height: 39,
  marginLeft:119,
},

buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
},


  button: {
    backgroundColor: '#3A3D3F',
    paddingVertical: 15,
    paddingHorizontal:45,
    borderRadius: 70,
    height: 60,
    marginBottom: 25,
    alignItems: 'flex-start', 
    shadowColor: '#ccc',
    marginTop:10,
    width: 310,
   justifyContent: 'center',
   alignSelf: 'center',

  },

  buttonText: {
    textAlign: 'left',
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing:0.2,
    
  },

  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: 310,
    borderRadius: 10,
    alignItems: 'center',
    marginTop:30,
    justifyContent: 'center',
   alignSelf: 'center',
   height: 60,
   borderColor: '#EA6363',  
   borderWidth: 1,
  
  },

  deleteButtonText: {
    fontSize: 16,
    color: '#EA6363',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing:0.2,
  },
  signupText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 50,
    color: '#000',
    position: 'absolute',
    left: 56,       
    top: 80,        
    width: 282,      
    textAlign: 'center',
    lineHeight: 45,
    paddingTop: 60,
  },
});
