import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { app } from '@/firebase/firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

export default function DeleteAccount() {
  const router = useRouter();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);

      Alert.alert('Account deleted', 'Your account has been successfully deleted.');

      router.replace('/');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to delete account.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.curvedTopBox}>
        <Text style={styles.signupText}>Delete Account.</Text>
        <Text style={styles.heading}>Do you wish to delete this account?</Text>
        <Text style={styles.warning}>
          Deleting account will result in removing all data on your account from our services. 
        </Text>
        <Text style={styles.warningagain}>
          This action is irreversible.
        </Text>
  
        {/* Buttons container */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.buttonText}>YES</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.push('/tabs/05-settings')}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
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
    height: 650,
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
  heading: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#000',
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: 'center',
    marginTop:36,
    marginHorizontal:30,
  },
  warning: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginHorizontal:30,
  },
  warningagain: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#979797',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginHorizontal:30,
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
    paddingTop: 25,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
    gap: 25,
  },
  button: {
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#000',
    width:10,
  },
  cancelButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#fff',
  },
  
});
