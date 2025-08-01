import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";

export default function TagPost() {
  const { image } = useLocalSearchParams();
  const router = useRouter();
  const imageUri = image as string;

  const [tags, setTags] = useState<
    { x: number; y: number; label: string; link?: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTap, setCurrentTap] = useState<{ x: number; y: number } | null>(
    null
  );
  const [label, setLabel] = useState("");
  const [link, setLink] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [aesthetics, setAesthetics] = useState("");

  const handleImagePress = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrentTap({ x: locationX, y: locationY });
    setModalVisible(true);
  };

  const handleAddTag = () => {
    if (!label.trim()) {
      Alert.alert("Please enter a label for the tag.");
      return;
    }
    if (currentTap) {
      setTags((prev) => [
        ...prev,
        { x: currentTap.x, y: currentTap.y, label, link: link.trim() || undefined },
      ]);
      setLabel("");
      setLink("");
      setModalVisible(false);
    }
  };

  const handleDeleteTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDone = async () => {
    try {
      const tagLabels = tags.map(tag => tag.label.toLowerCase());
  
   
      const aestheticsArray = aesthetics
        .split(' ')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);
  
      await addDoc(collection(db, 'posts'), {
        imageUrl: imageUri,
        tags: tags,
        tagLabels: tagLabels,
        hashtags: hashtags,
        aesthetics: aestheticsArray,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous',
      });
  
      router.push('/tabs/03-post');
    } catch (error) {
      console.error("Failed to save post:", error);
      Alert.alert('Error', 'Failed to save your post.');
    }
  };
  
  const handleTagPress = (link?: string) => {
    if (link) {
      Linking.canOpenURL(link)
        .then((supported) => {
          if (supported) {
            Linking.openURL(link);
          } else {
            Alert.alert("Invalid URL", "Can't open this link.");
          }
        })
        .catch(() => {
          Alert.alert("Error", "Failed to open the link.");
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Tag Items</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {imageUri ? (
        <Pressable onPress={handleImagePress} style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={tag.link ? 0.6 : 1}
              onPress={() => handleTagPress(tag.link)}
              style={[
                styles.tagBubble,
                {
                  top: tag.y - 25,
                  left: tag.x - 70,
                },
              ]}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteTag(index)}
                style={styles.deleteTagButton}
              >
                <Text style={styles.deleteTagButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </Pressable>
      ) : (
        <Text style={styles.errorText}>No image provided.</Text>
      )}

      <Text style={styles.instructionText}>Tap photo to tag and link items</Text>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Store"
              value={label}
              onChangeText={setLabel}
              style={styles.input}
              autoFocus
            />
            <TextInput
              placeholder="Link the item!"
              value={link}
              onChangeText={setLink}
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
            />
           
            <TextInput
              placeholder="Describe the aesthetic (e.g. grunge y2k)"
              value={aesthetics}
              onChangeText={setAesthetics}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={handleAddTag} style={styles.addButton}>
              <Text style={{ color: "white", fontWeight: "600" }}>Add Tag</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setLabel("");
                setLink("");
              }}
              style={[styles.addButton, { backgroundColor: "#BDBDBD", marginTop: 10 }]}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#67686A",
    marginLeft: 30,
    marginTop: 20,
    marginBottom: 40,
    letterSpacing: 0.8,
  },
  doneButtonText: {
    color: "#909090",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    marginTop: 20,
    marginRight: 30,
    marginBottom: 40,
    letterSpacing: 0.8,
  },
  imageWrapper: {
    width: 330,
    height: 500,
    borderRadius: 30,
    backgroundColor: "#e9e9e9",
    overflow: "hidden",
    position: "relative",
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  instructionText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 20,
  },
  tagBubble: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteTagButton: {
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteTagButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    position: "relative",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
