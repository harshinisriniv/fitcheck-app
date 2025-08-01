import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db, auth } from '@/firebase/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function PostPage() {
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  
  const { image: imageParam, tags, aesthetics } = useLocalSearchParams();

  const parsedTags = tags ? JSON.parse(tags as string) : [];

  useEffect(() => {
    if (imageParam) {
      setImage(imageParam as string);
    }
  }, [imageParam]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadPost = async () => {
    if (!image) {
      Alert.alert('No image selected', 'Please pick an image first.');
      return;
    }

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const filename = `${auth.currentUser?.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `posts/${filename}`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      const aestheticArray = aesthetics
        ? (aesthetics as string)
            .split(' ')
            .map(word => word.trim().toLowerCase())
            .filter(Boolean)
        : [];

      await addDoc(collection(db, 'posts'), {
        imageUrl: downloadURL,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        tags: parsedTags,
        aesthetics: aestheticArray,
      });

      Alert.alert('Success', 'Post uploaded!');
      setImage(null);
      router.push('/tabs/04-profile'); 
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Error', 'Something went wrong uploading the post.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Post Outfit</Text>

        <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.7}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.uploadedImage} />
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  setImage(null);
                }}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.uploadText}>Upload Photo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tagButton}
          onPress={() => {
            if (image) {
              router.push({
                pathname: '/tagpost',
                params: { image },
              });
            } else {
              Alert.alert("No image", "Please upload a photo before tagging.");
            }
          }}
        >
          <Text style={styles.tagButtonText}>Tag Items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={uploadPost}>
          <Text style={styles.uploadBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#67686A',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 40,
    letterSpacing: 0.8,
  },
  uploadArea: {
    width: '80%',
    height: 500,
    backgroundColor: '#E9E9E9',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    color: '#C3C3C3',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative', 
  },
  clearButton: {
    position: 'absolute',
    top: 20,
    right: 30,
    backgroundColor: '#000000aa', // semi-transparent black
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  tagButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 15,
    marginBottom: 25,
    marginTop: 10,
    alignItems: 'center',
    width: '95%',
  },
  tagButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#333',
  },
  uploadBtn: {
    backgroundColor: '#413F3F',
    padding: 15,
    borderRadius: 100,
    width: '65%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  uploadBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});
