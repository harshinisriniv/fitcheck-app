import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { useRouter } from 'expo-router';

type Post = {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: any; 
};

type UserData = {
  username: string;
  photoURL: string;
};

export default function Feed() {
  const auth = getAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserData>>({});

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const currentUserId = currentUser.uid;

    async function fetchFollowingAndPosts() {
      try {
        // Get current user's following list
        const userDocRef = doc(db, 'users', currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setFollowingIds([]);
          setPosts([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const following: string[] = userData?.following || [];
        setFollowingIds(following);

        if (following.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Fetch user data for all followed users for username & photoURL
        const usersDataPromises = following.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            return {
              uid,
              username: data.username || 'user',
              photoURL: data.photoURL || null,
            };
          }
          return { uid, username: 'user', photoURL: null };
        });

        const usersDataArray = await Promise.all(usersDataPromises);
        const usersMapObj: Record<string, UserData> = {};
        usersDataArray.forEach(({ uid, username, photoURL }) => {
          usersMapObj[uid] = { username, photoURL };
        });
        setUsersMap(usersMapObj);

        // Query posts from followed users
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', 'in', following),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const fetchedPosts: Post[] = snapshot.docs.map(doc => {
            const data = doc.data() as Omit<Post, 'id'>;
            return {
              id: doc.id,
              ...data,
            };
          });
          setPosts(fetchedPosts);
          setLoading(false);
        });

        return () => unsubscribe();

      } catch (error) {
        console.error('Error fetching feed posts:', error);
        setLoading(false);
      }
    }

    fetchFollowingAndPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => {
    const user = usersMap[item.userId];
    return (
      <View style={styles.postContainer}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(`/tabs/04-profile/${item.userId}`)}
        >
          <Image
            source={
              user?.photoURL
                ? { uri: user.photoURL }
                : require('@/assets/user.png')
            }
            style={styles.userImage}
          />
          <Text style={styles.username}>{user?.username || 'user'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/postdetailview?id=${item.id}`)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        </TouchableOpacity>

        {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  if (posts.length === 0) {
    return (
      <View style={styles.noPostsContainer}>
        <Text style={styles.noPostsText}>No posts from people you follow yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      contentContainerStyle={{ padding: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginHorizontal:20,
   
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius:100,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
    backgroundColor: '#ddd',
    
  },
  username: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 500,
    backgroundColor: '#eee',
    borderRadius:0,
  },
  caption: {
    padding: 10,
    fontSize: 14,
    color: '#444',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 18,
    color: '#999',
  },
});
