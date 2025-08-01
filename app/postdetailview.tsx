import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';

type Post = {
  id: string;
  userId: string;
  imageUrl: string;
  tags?: { x: number; y: number; label: string; link?: string }[];
  description?: string;
};

export default function PostDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [postUserName, setPostUserName] = useState<string | null>(null); // <-- new state for username
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 20 * 2 - 6 * 2 * numColumns) / numColumns;

  // Check if post is saved in user's inspo
  const checkIfSaved = async () => {
    if (!post) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const inspoDocRef = doc(db, 'users', userId, 'inspo', post.id);
    const inspoSnap = await getDoc(inspoDocRef);
    setIsSaved(inspoSnap.exists());
  };

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const postData = snap.data() as Omit<Post, 'id'>;
          const fullPost = { id: snap.id, ...postData };
          setPost(fullPost);

          // Fetch post owner's username here
          const userDoc = await getDoc(doc(db, 'users', fullPost.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.username) {
              setPostUserName(userData.username);
            } else {
              setPostUserName('User'); // fallback
            }
          } else {
            setPostUserName('User'); // fallback
          }

          await checkIfSaved();

          fetchUserPosts(fullPost.userId, snap.id);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async (userId: string, excludePostId: string) => {
      const q = query(collection(db, 'posts'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const posts: Post[] = [];
      snap.forEach((doc) => {
        if (doc.id !== excludePostId) {
          posts.push({ id: doc.id, ...(doc.data() as Omit<Post, 'id'>) });
        }
      });
      setUserPosts(posts);
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'posts', post.id));
            Alert.alert('Deleted', 'Post has been deleted.');
            router.replace('/tabs/04-profile');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post.');
            console.error('Delete error:', error);
          }
        },
      },
    ]);
  };

  const handleUnsave = async () => {
    if (!post) return;
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const inspoDocRef = doc(db, 'users', userId, 'inspo', post.id);
      await deleteDoc(inspoDocRef);

      setIsSaved(false);
      Alert.alert('Removed', 'Image removed from your inspo.');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove image from inspo.');
      console.error('Unsave error:', error);
    }
  };

  const handleSave = async () => {
    if (!post) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const inspoDocRef = doc(db, 'users', userId, 'inspo', post.id);

      await setDoc(inspoDocRef, {
        postId: post.id,
        imageUrl: post.imageUrl,
        savedAt: new Date(),
      });

      setIsSaved(true);
      Alert.alert('Saved', 'Image saved to your inspo!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image.');
      console.error('Save error:', error);
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={{ margin: 6 }}
      onPress={() => router.push(`/postdetailview?id=${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: imageSize, height: imageSize, borderRadius: 12 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const isOwner = post?.userId === auth.currentUser?.uid;

  const otherPostsHeader = isOwner
    ? 'Your Other Outfits'
    : `${postUserName ? postUserName : "User's"}'s Other Outfits`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67686A" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.outfitLabel}>
        {postUserName ? `${postUserName}'s Outfit` : 'Outfit'}
      </Text>

      {isOwner && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Image source={require('@/assets/bin.png')} style={styles.icon} />
        </TouchableOpacity>
      )}

      <TouchableWithoutFeedback onPress={() => setShowTags(!showTags)}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Tags overlay */}
          {showTags && post.tags && post.tags.length > 0 && (
            <View style={styles.tagsOverlay}>
              {post.tags.map(({ x, y, label, link }) => (
                <TouchableOpacity
                  key={`${label}-${x}-${y}`}
                  style={[styles.tagAbsolute, { left: x, top: y }]}
                  onPress={() => {
                    if (link) {
                      Linking.openURL(link).catch(() =>
                        Alert.alert('Error', 'Failed to open link')
                      );
                    }
                  }}
                  activeOpacity={link ? 0.7 : 1}
                >
                  <Text style={styles.tagText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={isSaved ? handleUnsave : handleSave}
          >
            <Image
              source={
                isSaved
                  ? require('@/assets/bookmark (1).png')
                  : require('@/assets/bookmark.png')
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      {post.tags && post.tags.length > 0 && (
        <Text style={styles.tapToViewTagsText}>Tap to view tags</Text>
      )}

      {userPosts.length > 0 && (
        <>
          <View style={styles.otherPostsHeaderContainer}>
            <Text style={styles.otherPostsHeaderText}>{otherPostsHeader}</Text>
          </View>

          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 50,
              paddingHorizontal: 0,
            }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    position: 'relative',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  outfitLabel: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.5,
    color: '#413F3F',
    zIndex: 20,
  },
  imageWrapper: {
    width: '90%',
    marginTop: 80,
    height: 500,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#E9E9E9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  tagsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  tagAbsolute: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1.0,
    shadowRadius: 3,
  },
  deleteBtn: {
    position: 'absolute',
    top: 60,
    right: 40,
    zIndex: 20,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  tapToViewTagsText: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#67686A',
    marginBottom: 10,
    textAlign: 'center',
  },
  otherPostsHeaderContainer: {
    width: Dimensions.get('window').width,
    backgroundColor: '#fff',
    paddingVertical: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  otherPostsHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#413F3F',
    textAlign: 'center',
    paddingHorizontal: 15,
    letterSpacing: 0.2,
    fontFamily: 'Poppins_600SemiBold',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#67686A',
  },
});
