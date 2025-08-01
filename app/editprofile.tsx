import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/firebase/firebaseConfig';
import { ShadowView } from 'react-native-inner-shadow';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function EditProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | null>(user?.photoURL || null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (uri: string, uid: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `profilePictures/${uid}.jpg`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (password) {
        await updatePassword(user, password);
      }

      let photoURL = user.photoURL;
      if (image && image !== user.photoURL) {
        photoURL = await uploadProfilePicture(image, user.uid);
      }

      if (username !== user.displayName || photoURL !== user.photoURL) {
        await updateProfile(user, { displayName: username, photoURL });
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          username,
          email,
          photoURL,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userDocRef, {
          username,
          email,
          photoURL,
        });
      }

      console.log('Profile updated!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.curvedTopBox}>
       
        <Text style={styles.title}>Edit Profile.</Text>

        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profilePic} />
          ) : (
            <View style={styles.placeholderPic}>
              <Text>Select Profile Picture</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>edit username</Text>
  <ShadowView
    inset
    shadowColor="#CCCCCC"
    shadowOffset={{ width: 0, height: 2 }}
    shadowBlur={5}
    style={styles.inputBox}
  >
    <TextInput
      value={username}
      onChangeText={setUsername}
      style={[styles.input, { color: '#9D9B9B' },{ paddingTop: 2, paddingLeft: 20 }]}
      placeholder="username"
      placeholderTextColor="#9D9B9B"
    />
  </ShadowView>
</View>

<View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>edit email</Text>
  <ShadowView
    inset
    shadowColor="#CCCCCC"
    shadowOffset={{ width: 0, height: 2 }}
    shadowBlur={5}
    style={styles.inputBox}
  >
    <TextInput
      value={email}
      onChangeText={setEmail}
      style={[styles.input,{ color: '#9D9B9B' }, { paddingTop: 2, paddingLeft: 20 }]}
      placeholder="email"
      placeholderTextColor="#9D9B9B"
      autoCapitalize="none"
      keyboardType="email-address"
    />
  </ShadowView>
</View>


        <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>edit password</Text>
  <ShadowView
    inset
    shadowColor="#CCCCCC"
    shadowOffset={{ width: 0, height: 2 }}
    shadowBlur={5}
    style={[styles.inputBox, { position: 'relative' }]} // use relative so it flows normally
  >
    <TextInput
      style={[styles.input, { paddingTop: 2, paddingLeft: 20 }]}
      placeholder="new password"
      autoCapitalize="none"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
      placeholderTextColor="#9D9B9B"
    />
  </ShadowView>
</View>

        <TouchableOpacity onPress={handleSave} style={{ marginTop: 30, alignSelf: 'center' }}>
             <Text style={styles.saveLink}>Save Changes</Text>
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
    bottom: 0, // 🟢 attach to bottom
    width: '100%',
    height: 700, // or more depending on how far up the curve should go
  
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
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 40,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 24,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontFamily: 'Poppins_500Medium',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,         
    borderColor: '#3A3D3F',  
  },
  placeholderPic: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 50,
    marginBottom: 5,
    color: '#5D5A5A',
    marginTop: 15,
  },
  inputBox: {
    width: '85%',
    height: 55,
    backgroundColor: '#F7F7F7',
    borderRadius: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#000',
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
  saveButton: {
    width: '50%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#413F3F',
    textShadowColor: '#9D9B9B', // soft black shadow (removed extra parenthesis)
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    // Optional: to align exactly with your title horizontal position:
    // You can tweak margin or padding here as needed
  },
  saveText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 70,
  },
});
