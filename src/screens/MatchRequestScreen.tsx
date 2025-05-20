import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { requestMatch } from '../services/matchmakingService';
import { getNearbyUsers } from '../services/locationService';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface NearbyUser {
  user_id: string;
  latitude: number;
  longitude: number;
  profile?: {
    name: string;
    avatar_url?: string;
    country?: string;
    average_rating: number;
    trust_badges: string[];
    total_sessions: number;
  };
}

const MatchRequestScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [distanceFilter, setDistanceFilter] = useState('2km');
  const [details, setDetails] = useState('');
  const [requestType, setRequestType] = useState<'photo' | 'video'>('photo'); // ✅ lowercase, matching backend
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Please allow location permission.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error fetching location', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && user?.id) {
      fetchNearbyUsers();
    }
  }, [currentLocation, distanceFilter]);

  const fetchNearbyUsers = async () => {
    try {
      setLoadingUsers(true);
      const radiusKm = mapDistanceToKm(distanceFilter);
      const response = await getNearbyUsers(user!.id, radiusKm);
      setNearbyUsers(response);
    } catch (error) {
      console.error('Failed to fetch nearby users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const mapDistanceToKm = (d: string) => {
    if (d === '100m') return 0.1;
    if (d === '500m') return 0.5;
    if (d === '1km') return 1;
    if (d === '2km') return 2;
    if (d === '5km') return 5;
    return 2;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSendRequest = async () => {
    if (!user?.id || !currentLocation || !selectedUserId) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    try {
      const payload = {
        requester_id: user.id, 
        receiver_id: selectedUserId,
        request_type: 'photo',
        //request_type: requestType, // ✅ properly from user selection
        distance: distanceFilter,
        details,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
      await requestMatch(payload);
      Alert.alert('Success', 'Request sent successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to send request:', error);
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const renderUserItem = ({ item }: { item: NearbyUser }) => {
    let distanceText = '';
    if (currentLocation) {
      const distanceKm = calculateDistance(currentLocation.latitude, currentLocation.longitude, item.latitude, item.longitude);
      distanceText = `${distanceKm.toFixed(2)} km away`;
    }

    return (
      <TouchableOpacity
        style={[styles.userItem, selectedUserId === item.user_id && styles.selectedUserItem]}
        onPress={() => setSelectedUserId(item.user_id)}
      >
        {item.profile?.avatar_url ? (
          <Image source={{ uri: item.profile.avatar_url }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#6e5be0" />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.profile?.name || 'Unnamed User'}</Text>
          <Text style={styles.userDetail}>{item.profile?.country || 'Unknown country'}</Text>
          <Text style={styles.userDetail}>Rating: {item.profile?.average_rating?.toFixed(1) ?? 'N/A'} ⭐</Text>
          <Text style={styles.distanceText}>{distanceText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/*
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Request</Text>
        </View>
        */}

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
          <Text style={styles.label}>Your Location</Text>
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={currentLocation} />
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text>Loading Location...</Text>
            </View>
          )}

          <Text style={styles.label}>Select a User Nearby</Text>
          {loadingUsers ? (
            <ActivityIndicator size="small" color="#6e5be0" />
          ) : nearbyUsers.length ? (
            <FlatList
              data={nearbyUsers}
              keyExtractor={(item) => item.user_id}
              renderItem={renderUserItem}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text>No nearby users found.</Text>
          )}

          <Text style={styles.label}>Request Type</Text>
          <View style={styles.optionRow}>
            {['photo', 'video'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, requestType === type && styles.optionButtonActive]}
                onPress={() => setRequestType(type as 'photo' | 'video')}
              >
                <Text style={[styles.optionText, requestType === type && styles.optionTextActive]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Distance Filter</Text>
          <View style={styles.distanceContainer}>
            <Feather name="wifi" size={24} color="black" />
            <View style={styles.distanceOptions}>
              {['100m', '500m', '1km', '2km', '5km'].map((d) => (
                <TouchableOpacity key={d} onPress={() => setDistanceFilter(d)} style={styles.distanceButton}>
                  <Text style={[styles.distanceTextOption, distanceFilter === d && styles.distanceTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Details</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Input what you want..."
            multiline
            value={details}
            onChangeText={setDetails}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest}>
            <Text style={styles.sendButtonText}>Send Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MatchRequestScreen;

// ---- Styles ----

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 20, marginBottom: 10, color: '#000' },
  map: { width: '100%', height: 200, borderRadius: 12 },
  mapPlaceholder: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', borderRadius: 12 },
  optionRow: { flexDirection: 'row', marginTop: 10, marginBottom: 20 },
  optionButton: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  optionButtonActive: { borderColor: '#6e5be0', backgroundColor: '#f5f0ff' },
  optionText: { fontSize: 16, color: '#000' },
  optionTextActive: { color: '#6e5be0', fontWeight: 'bold' },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  distanceOptions: { flexDirection: 'row', marginLeft: 10, backgroundColor: '#f5f0ff', borderRadius: 8 },
  distanceButton: { paddingHorizontal: 15, paddingVertical: 8 },
  distanceTextOption: { fontSize: 14, color: '#000' },
  distanceTextActive: { color: '#6e5be0', fontWeight: 'bold', textDecorationLine: 'underline' },
  textArea: { height: 100, backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 10, padding: 10, textAlignVertical: 'top', marginBottom: 20 },
  sendButton: { backgroundColor: '#000', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, alignSelf: 'flex-end', marginBottom: 30 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userItem: { backgroundColor: '#fff', padding: 15, marginRight: 10, borderRadius: 10, alignItems: 'center', borderColor: '#ccc', borderWidth: 1 },
  selectedUserItem: { borderColor: '#6e5be0', borderWidth: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userInfo: { marginTop: 8, alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: '#000' },
  userDetail: { fontSize: 12, color: '#555', marginTop: 2 },
  distanceText: { fontSize: 12, color: '#888', marginTop: 2 },
});
