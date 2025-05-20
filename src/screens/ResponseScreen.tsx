// src/screens/ResponseScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { getMyMatches, respondToMatch } from '../services/matchmakingService';
import { getNearbyUsers } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

const ResponseScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchRequestsWithProfiles = async () => {
      try {
        if (user?.id) {
          const matchData = await getMyMatches(user.id);
          setRequests(matchData);

          const nearbyProfiles = await getNearbyUsers(user.id, 5);
          const map: Record<string, any> = {};
          nearbyProfiles.forEach((u: any) => {
            if (u.profile) map[u.user_id] = u.profile;
          });
          setProfilesMap(map);
        }
      } catch (err) {
        console.error('Error loading matches or profiles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestsWithProfiles();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'declined': return '#f44336';
      case 'expired': return '#9E9E9E';
      default: return '#FFC107';
    }
  };

  const handleAction = async (action: string) => {
    if (!selectedRequest) return;
    try {
      await respondToMatch(selectedRequest.match_id, action);
      const updatedRequests = requests.map((r) =>
        r.match_id === selectedRequest.match_id ? { ...r, status: action } : r
      );
      setRequests(updatedRequests);
    } catch (err) {
      console.error('Failed to respond to match:', err);
    } finally {
      setModalVisible(false);
      setSelectedRequest(null);
    }
  };

  const renderRequestItem = (item: any, type: 'sent' | 'received') => {
    const profile = type === 'sent' ? profilesMap[item.receiver_id] : profilesMap[item.requester_id];
    const name = profile?.name || 'User';
    const trust = profile?.average_rating?.toFixed(1) || 'N/A';
    const created = new Date(item.created_at).toLocaleString();
    const distance = item.distance || 'N/A';
    const status = item.status || 'pending';

    return (
      <TouchableOpacity
        key={item.match_id}
        onPress={() => {
          setSelectedRequest({ ...item, type });
          setModalVisible(true);
        }}
        style={styles.requestCard}
      >
        <View style={styles.requestLeft}>
          {item.request_type === 'photo' ? (
            <Feather name="camera" size={24} color="black" />
          ) : (
            <Feather name="video" size={24} color="black" />
          )}
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.requestTitle}>{name} ({trust})</Text>
              <Feather name="star" size={16} color="#FFD700" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.requestSubtitle}>Requested at {created}</Text>
            {type === 'sent' && (
              <View style={[styles.statusTag, { backgroundColor: getStatusColor(status) }]}>
                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.distanceText}>{distance}</Text>
      </TouchableOpacity>
    );
  };

  const sentRequests = requests.filter((r) => r.requester_id === user?.id);
  const receivedRequests = requests.filter((r) => r.receiver_id === user?.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/*
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Response</Text>
        </View>
        */}

        <Text style={styles.sectionTitle}>Requests on Map</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -27.4705,
            longitude: 153.0260,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {requests.map((req, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: req.latitude || -27.4705,
                longitude: req.longitude || 153.0260,
              }}
              pinColor="orange"
            />
          ))}
        </MapView>

        <Text style={styles.sectionTitle}>Requests Sent</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#6e5be0" />
        ) : sentRequests.length ? (
          sentRequests.map((item) => renderRequestItem(item, 'sent'))
        ) : (
          <Text style={styles.noDataText}>No sent requests.</Text>
        )}

        <Text style={styles.sectionTitle}>Requests Received</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#6e5be0" />
        ) : receivedRequests.length ? (
          receivedRequests.map((item) => renderRequestItem(item, 'received'))
        ) : (
          <Text style={styles.noDataText}>No received requests.</Text>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Request</Text>
            {selectedRequest?.type === 'received' ? (
              <>
                <Pressable style={styles.modalButton} onPress={() => handleAction('accepted')}>
                  <Text style={styles.modalButtonText}>Accept</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={() => handleAction('declined')}>
                  <Text style={styles.modalButtonText}>Decline</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.modalButton} onPress={() => handleAction('cancelled')}>
                <Text style={styles.modalButtonText}>Cancel Request</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15, color: '#666' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ResponseScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#000' },
  noDataText: { fontSize: 14, color: '#888', fontStyle: 'italic', marginBottom: 20 },
  map: {
    width: '100%', height: 200, borderRadius: 12, marginBottom: 20, borderWidth: 2, borderColor: '#d9d9ff',
  },
  requestCard: {
    flexDirection: 'row', backgroundColor: '#efefef', borderRadius: 15, padding: 15,
    alignItems: 'center', justifyContent: 'space-between', marginBottom: 15,
  },
  requestLeft: { flexDirection: 'row', alignItems: 'center' },
  requestTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  requestSubtitle: { fontSize: 13, color: '#666', marginTop: 3 },
  distanceText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  statusTag: {
    marginTop: 6, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, color: 'white', fontWeight: 'bold' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center'
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  modalButton: {
    backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
    marginTop: 10, width: '100%', alignItems: 'center'
  },
  modalButtonText: { color: '#fff', fontWeight: '600' }
});