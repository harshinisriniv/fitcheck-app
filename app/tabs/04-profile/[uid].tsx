import { db } from '@/firebase/firebaseConfig';
import MasonryList from '@react-native-seoul/masonry-list';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';

type Post = {
  id: string;
  imageUrl: string;
};

export default function UserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const uid = params.uid as string;

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const [selectedTab, setSelectedTab] = useState<'outfits' | 'inspo'>('outfits');
  const [posts, setPosts] = useState<Post[]>([]);
  const [inspo, setInspo] = useState<Post[]>([]);
  const [username, setUsername] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  // Fetch posts for user
  useEffect(() => {
    if (!uid) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const userPosts = snapshot.docs.map(doc => {
        const data = doc.data() as Omit<Post, 'id'>;
        return {
          id: doc.id,
          ...data,
        };
      });
      setPosts(userPosts);
    });

    return () => unsubscribe();
  }, [uid]);

  // Fetch inspo for user
  useEffect(() => {
    if (!uid) return;

    const inspoRef = collection(db, 'users', uid, 'inspo');
    const unsubscribe = onSnapshot(inspoRef, (snapshot) => {
      const savedPosts = snapshot.docs.map(doc => {
        const data = doc.data() as Omit<Post, 'id'>;
        return {
          id: doc.id,
          ...data,
        };
      });
      setInspo(savedPosts);
    });

    return () => unsubscribe();
  }, [uid]);

  // Fetch username, profile pic, followers, following, and check if current user follows
  useEffect(() => {
    if (!uid) return;

    async function fetchUserInfo() {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData?.username ?? 'username');
          setProfilePic(userData?.photoURL ?? null);

          const followersArray: string[] = userData?.followers ?? [];
          const followingArray: string[] = userData?.following ?? [];

          setFollowersCount(followersArray.length);
          setFollowingCount(followingArray.length);

          if (currentUserId) {
            setIsFollowing(followersArray.includes(currentUserId));
          }
        } else {
          setUsername('username');
          setProfilePic(null);
          setFollowersCount(0);
          setFollowingCount(0);
          setIsFollowing(false);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUsername('username');
        setProfilePic(null);
        setFollowersCount(0);
        setFollowingCount(0);
        setIsFollowing(false);
      }
      setLoadingUser(false);
    }

    fetchUserInfo();
  }, [uid, currentUserId]);

  //follow
  async function toggleFollow() {
    if (!currentUserId || !uid || currentUserId === uid) return;

    setButtonLoading(true);

    const userRef = doc(db, 'users', uid);
    const currentUserRef = doc(db, 'users', currentUserId);

    try {
      if (isFollowing) {
        await Promise.all([
          updateDoc(userRef, { followers: arrayRemove(currentUserId) }),
          updateDoc(currentUserRef, { following: arrayRemove(uid) }),
        ]);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(c - 1, 0));
      } else {
        await Promise.all([
          updateDoc(userRef, { followers: arrayUnion(currentUserId) }),
          updateDoc(currentUserRef, { following: arrayUnion(uid) }),
        ]);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }

    setButtonLoading(false);
  }

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push(`/postdetailview?id=${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: '93%',
          height: 150 + Math.random() * 150,
          borderRadius: 12,
          margin: 6,
          backgroundColor: '#eee',
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (loadingUser) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Closet</Text>

      <View style={styles.profileHeader}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require('@/assets/user.png')
          }
          style={styles.pfp}
        />
        <Text style={styles.username}>{username || 'Loading...'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Followers</Text>
            <Text style={styles.statNumber}>{followersCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Outfits</Text>
            <Text style={styles.statNumber}>{posts.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Following</Text>
            <Text style={styles.statNumber}>{followingCount}</Text>
          </View>
        </View>

        {/* follow logic */}
        {currentUserId !== uid && (
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing ? styles.unfollow : styles.follow,
            ]}
            onPress={toggleFollow}
            disabled={buttonLoading}
          >
            <Text style={styles.buttonText}>
              {buttonLoading ? 'Please wait...' : isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.toggleContainer}>
        <View
          style={[
            styles.highlight,
            selectedTab === 'inspo' ? styles.highlightRight : styles.highlightLeft,
          ]}
        />
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('outfits')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'outfits' && styles.activeTabText,
            ]}
          >
            Outfits
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('inspo')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'inspo' && styles.activeTabText,
            ]}
          >
            Inspo
          </Text>
        </TouchableOpacity>
      </View>

      <MasonryList
        data={selectedTab === 'outfits' ? posts : inspo}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderItem as (info: { item: any }) => React.ReactElement}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 8,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#67686A',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pfp: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3A3D3F',
  },
  username: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#67686A',
    marginBottom: 20,
    letterSpacing: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 30,
    width: '80%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#3A3D3F',
    letterSpacing: 1.0,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  followButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 100,
    backgroundColor: '#000',
    borderRadius: 25,
  },
  follow: {
    backgroundColor: '#000',
  },
  unfollow: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 1.0,
  },
  toggleContainer: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    height: 55,
    marginHorizontal: 30,
    marginTop: -3,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  highlight: {
    position: 'absolute',
    top: 7,
    width: 180,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#fff',
    zIndex: 0,
  },
  highlightLeft: {
    left: 9,
  },
  highlightRight: {
    right: 9,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#A3A3A3',
    fontSize: 15,
    letterSpacing: 1.0,
  },
  activeTabText: {
    color: '#050101',
  },
});
