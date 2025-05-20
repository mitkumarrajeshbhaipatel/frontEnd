// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, SafeAreaView, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/profileService';
import { getUserBadges, getUserReviews } from '../services/reviewService'
import { uploadAvatar } from '../services/mediaService';
import { useProfile } from '../contexts/ProfileContext';
import { changePassword } from '../services/authService'; 

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { profile, setProfile } = useProfile();

  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const handleChangePassword = async () => {
  if (!newPassword || !confirmPassword) {
    Alert.alert('Error', 'Both password fields are required.');
    return;
  }
  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match.');
    return;
  }
  try {
    await changePassword(token, newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(false);
    Alert.alert('Success', 'Password changed successfully.');
  } catch (error) {
    console.error('Password change error', error);
    Alert.alert('Error', 'Failed to change password.');
  }
};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id && !profile) {
          const data = await getProfile(user.id);
          setProfile(data);
          setBio(data?.bio || '');
          setCountry(data?.country || '');
        } else if (profile) {
          setBio(profile?.bio || '');
          setCountry(profile?.country || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, [user, profile]);

  const handleAvatarUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant permission to access media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image], // ✅ updated
        allowsEditing: true,
        quality: 0.7,
      });

    if (!result.canceled && result.assets?.length) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type,
      } as any);

      try {
        const uploadRes = await uploadAvatar(formData);
        const updatedProfile = { ...profile, avatar_url: uploadRes.url };
        await updateProfile(user.id, updatedProfile);
        setProfile(updatedProfile);
      } catch (error) {
        console.error('Avatar upload error', error);
        Alert.alert('Upload failed', 'Unable to upload avatar.');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!profile) {
        Alert.alert('Error', 'Profile data not loaded.');
        return;
      }

      const updatedProfile = {
        ...profile,
        bio,
        country,
      };

      await updateProfile(user.id, updatedProfile);
      setProfile(updatedProfile);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleAvatarUpload}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="camera-outline" size={30} color="#666" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.nameText}>{user.name}</Text>

          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={20} color="#6e5be0" />
            <Text style={styles.verifiedText}>
              {profile.verification_status === 'verified' ? 'Verified' : 'Pending'}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={20} color="black" />
            <Text style={styles.ratingText}>
              {profile.average_rating?.toFixed(1)} ({profile.total_sessions} sessions)
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.total_sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.trust_badges?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.is_available ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={styles.textArea}
            multiline
            placeholder="Write something about yourself"
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            style={styles.input}
            placeholder="Enter your country"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#eee', marginTop: 10 }]}
        onPress={() => setPasswordModalVisible(true)}
        >
        <Text style={[styles.buttonText, { color: '#6e5be0' }]}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
        >
        <View style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 20,
        }}>
            <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Change Password</Text>
            
            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 }}
            />
            <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                style={{ padding: 10 }}
                >
                <Text style={{ color: 'red' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={handleChangePassword}
                style={{ padding: 10 }}
                >
                <Text style={{ color: '#6e5be0', fontWeight: 'bold' }}>Submit</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>

    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6f5' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  verifiedText: { marginLeft: 5, fontSize: 14, color: '#555' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { marginLeft: 5, fontSize: 14, color: '#555' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 12, color: '#555', marginTop: 5, textAlign: 'center' },
  dividerVertical: { width: 1, height: 40, backgroundColor: '#ccc' },
  inputBox: { marginBottom: 15 },
  inputLabel: { fontSize: 14, marginBottom: 5, color: '#000' },
  input: {
    backgroundColor: '#e6e6f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: { fontSize: 14, color: '#000', fontWeight: '600' },
});
