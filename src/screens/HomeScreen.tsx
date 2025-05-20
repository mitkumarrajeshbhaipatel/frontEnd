// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSessionContext } from '../contexts/SessionContext';
import { socket } from '../utils/socket';
import useLocationUpdater from '../hooks/useLocationUpdater';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { useNotificationContext } from '../contexts/NotificationContext';
import { updateProfile } from '../services/profileService';
import { useProfile } from '../contexts/ProfileContext';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { activeSession } = useSessionContext();
  const { locationStatus } = useLocationUpdater();
  const { profile, setProfile } = useProfile(); // 🟰 Using context
  //const { notifications } = useNotificationContext();
  //useNotificationSocket();
  

  const [search, setSearch] = useState('');

  const myUserId = user?.id;
  const mySessionId = activeSession?.id;

  const toggleSwitch = async () => {
    if (!profile) return;

    const newAvailability = !profile.is_available;

    try {
      if (user?.id) {
        await updateProfile(user.id, { 
          ...profile, 
          is_available: newAvailability 
        });

        setProfile({ ...profile, is_available: newAvailability }); // ⬅️ Update context immediately
        console.log('Availability updated successfully.');
      }
    } catch (error) {
      console.error('Failed to update availability', error);
      Alert.alert('Error', 'Failed to update availability.');
    }
  };

  useEffect(() => {
    if (profile?.is_available && myUserId && mySessionId) {
      console.log('Connecting WebSocket...');
      socket.auth = { session_id: mySessionId, sender_id: myUserId };
      socket.connect();
    } else {
      console.log('Disconnecting WebSocket...');
      if (socket?.connected) {
        socket.disconnect();
      }
    }

    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, [profile?.is_available, myUserId, mySessionId]);

  if (!profile) {
    return (
      <ScrollView style={styles.container}>
        <Text>Loading profile...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* Location Status Indicator */}
      <View style={styles.locationStatusBar}>
        <View
          style={[styles.statusDot, { backgroundColor: locationStatus === 'active' ? '#4caf50' : '#f44336' }]}
        />
        <Text style={styles.statusText}>
          {locationStatus === 'active' ? 'Location Active' : 'Location Error'}
        </Text>
      </View>

      {/* Top Icons */}
      <View style={styles.topIconsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MatchRequest')}>
          <Ionicons name="camera-outline" size={70} color="#000" />
          <Text style={styles.iconLabel}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ResponceRequest')}>
          <MaterialCommunityIcons name="clipboard-outline" size={70} color="#000" />
          <Text style={styles.iconLabel}>Response</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Where to photo"
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons name="time-outline" size={24} color="#000" style={styles.searchIcon} />
      </View>

      {/* Availability Switch */}
      <View style={styles.availabilityRow}>
        <Switch
          trackColor={{ false: "#767577", true: "#6e5be0" }}
          thumbColor={profile.is_available ? "#ffffff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={profile.is_available}
        />
        <Text style={styles.availabilityText}>
          Availability: {profile.is_available ? 'On' : 'Off'}
        </Text>
      </View>

      {/* Menu Options */}
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('NearbyUser')}>
        <Feather name="search" size={24} color="#000" />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Nearby User</Text>
          <Text style={styles.menuSubtitle}>Search nearby users</Text>
        </View>
      </TouchableOpacity>
     
     {/*
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
        <Feather name="folder" size={24} color="#000" />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>History</Text>
          <Text style={styles.menuSubtitle}>View previous requests</Text>
        </View>
      </TouchableOpacity>
      */}

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Session')}>
        <Feather name="file-text" size={24} color="#000" />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Active Session</Text>
          <Text style={styles.menuSubtitle}>Check ongoing sessions</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6f5' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 40 },
  locationStatusBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '500', color: '#000' },
  topIconsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  iconButton: { alignItems: 'center', marginHorizontal: 20 },
  iconLabel: { marginTop: 10, fontSize: 16, fontWeight: '500', color: '#000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, marginBottom: 20, elevation: 2 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  searchIcon: { marginLeft: 10 },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  availabilityText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  menuTextContainer: { marginLeft: 15 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  menuSubtitle: { fontSize: 13, color: '#888', marginTop: 3 },
});
