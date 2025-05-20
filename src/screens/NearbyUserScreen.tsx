// src/screens/NearbyUserScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNearbyUsers } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Define the NearbyUser structure
interface NearbyUser {
  user_id: string;
  latitude: number;
  longitude: number;
  profile?: {
    name: string,
    bio?: string;
    is_available: boolean;
    avatar_url?: string;
    country?: string;
    trust_badges: string[];
    total_sessions: number;
    average_rating: number;
    verification_status: string;
  };
}

const NearbyUserScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNearbyUsers();
    }
  }, [user]);

  const fetchNearbyUsers = async () => {
    try {
      setLoading(true);
      const response = await getNearbyUsers(user.id, 2); // radius 2km
      setNearbyUsers(response);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: NearbyUser }) => (
    <TouchableOpacity style={styles.userItem}>
      {/* Avatar */}
      {item.profile?.avatar_url ? (
        <Image source={{ uri: item.profile.avatar_url }} style={styles.avatar} />
      ) : (
        <Ionicons name="person-circle-outline" size={50} color="#6e5be0" />
      )}

      {/* Info */}
      <View style={styles.userInfo}>
        {/* Username or fallback */}
        <Text style={styles.userName}>
        {item.profile?.name ? `${item.profile.name}` : 'Unnamed User'}
        </Text>

        {/* Bio */}
        <Text style={styles.userDetail}>
          {item.profile?.bio || 'No bio available'}
        </Text>

        {/* Rating and Sessions */}
        <Text style={styles.userDetail}>
          Rating: {item.profile?.average_rating?.toFixed(1) ?? 'N/A'} ⭐ | Sessions: {item.profile?.total_sessions ?? 0}
        </Text>

        {/* Trust badges if any */}
        {item.profile?.trust_badges.length ? (
          <Text style={styles.badgesText}>
            Badges: {item.profile.trust_badges.join(', ')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6e5be0" />
          <Text style={styles.loadingText}>Loading nearby users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        {/*
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Users</Text>
        </View>
        */}

        {/* User List */}
        {nearbyUsers.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No users nearby right now 😢</Text>
          </View>
        ) : (
          <FlatList
            data={nearbyUsers}
            keyExtractor={(item) => item.user_id}
            renderItem={renderUserItem}
            contentContainerStyle={{ padding: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NearbyUserScreen;

// ---- Styles ----

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#faf6f5',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6e5be0' },
  emptyText: { fontSize: 18, color: '#555', textAlign: 'center', marginTop: 20 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  userInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  userDetail: { fontSize: 13, color: '#555' },
  badgesText: { fontSize: 12, color: '#6e5be0', marginTop: 5 },
});
