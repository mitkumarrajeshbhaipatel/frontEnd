// src/screens/GoScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, SafeAreaView, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Linking,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

const GoScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { sessions } = useSessionContext();

  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const allCoordinates = [
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        ...sessions.map((s) => ({
          latitude: s.location.lat,
          longitude: s.location.lng,
        })),
      ];
      mapRef.current.fitToCoordinates(allCoordinates, {
        edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
        animated: true,
      });
    }
  }, [currentLocation, sessions]);

  const openExternalNavigation = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6e5be0" />
          <Text style={styles.loadingText}>Loading your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Unable to fetch location. Check permissions.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/*
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Navigate to Request</Text> 
          */
          
           }
          
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={currentLocation} title="You are here" pinColor="blue" />
          {sessions.map((session) => {
            const profile = session.requester_profile || session.helper_profile;
            return (
              <Marker
                key={session.session_id}
                coordinate={{ latitude: session.location.lat, longitude: session.location.lng }}
                title={profile?.name || 'User'}
                description={session.address || 'Address unknown'}
                pinColor="red"
                onPress={() => {
                  const distance = haversineDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    session.location.lat,
                    session.location.lng
                  );
                  const displayDistance = distance < 1000
                    ? `${Math.round(distance)} m`
                    : `${(distance / 1000).toFixed(2)} km`;
                  const timeMin = Math.max(1, Math.round((distance / 1000) / 5 * 60));
                  setSelectedDestination({
                    latitude: session.location.lat,
                    longitude: session.location.lng,
                    name: profile?.name || 'User',
                    address: session.address,
                    distance: displayDistance,
                    timeMin,
                  });
                }}
              />
            );
          })}
          {selectedDestination && (
            <Polyline
              coordinates={[
                { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                { latitude: selectedDestination.latitude, longitude: selectedDestination.longitude },
              ]}
              strokeColor="#6e5be0"
              strokeWidth={5}
            />
          )}
        </MapView>

        {selectedDestination && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Heading to: {selectedDestination.name}</Text>
            <Text style={styles.infoSubText}>{selectedDestination.address}</Text>
            <Text style={styles.infoSubText}>Approximate Distance: {selectedDestination.distance}</Text>
            <Text style={styles.infoSubText}>Estimated Time: {selectedDestination.timeMin} mins</Text>

            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => openExternalNavigation(selectedDestination.latitude, selectedDestination.longitude)}
            >
              <Text style={styles.navigateButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default GoScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#faf6f5',
    zIndex: 999,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#000' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6e5be0',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  infoCard: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  infoSubText: { fontSize: 14, color: '#555', marginBottom: 5 },
  navigateButton: {
    backgroundColor: '#4e8cff',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
