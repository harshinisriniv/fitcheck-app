import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

type User = {
  id: string;
  username: string;
  photoURL: string;
};

const Explore = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("username"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: User[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<User, "id">),
        }))
        // exclude current user here
        .filter((user) => user.id !== auth.currentUser?.uid);
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearchTerm(text);

    if (text.trim() === "") {
      // If search is empty, clear results (no list shown)
      setSearchResults([]);
      return;
    }

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => router.push(`/tabs/04-profile/${item.id}`)}
    >
      <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="search closets, aesthetics, stores, and more"
        value={searchTerm}
        onChangeText={handleSearch}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchTerm.trim() !== "" && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
              no users found
            </Text>
          }
        />
      )}
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontFamily: 'Poppins_700Bold',
      fontSize: 27,
      color: '#000',
  },
  searchBar: {
    marginTop:  15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
  },
});
