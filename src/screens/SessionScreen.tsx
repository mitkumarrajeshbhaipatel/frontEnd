// src/screens/SessionScreen.tsx with navigation to review screen

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Pressable, Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getMyMatches } from '../services/matchmakingService';
import { getSessionByMatch, updateSessionStatus } from '../services/sessionService';
import { getNearbyUsers } from '../services/locationService';
import { useSessionContext } from '../contexts/SessionContext';


const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'PhotoAid/1.0 (photoaid@example.com)', // REQUIRED
            'Accept-Language': 'en', // Optional
          },
        }
      );
  
      if (!response.ok) {
        const text = await response.text();
        console.error(`HTTP error: ${response.status}`, text);
        throw new Error(`HTTP ${response.status}`);
      }
  
      const data = await response.json();
      return data.display_name || 'Unknown Location';
    } catch (err) {
      console.error('🌍 Reverse geocoding error:', err);
      return 'Unknown Location';
    }
  };

const SessionScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    sessions,
    setSessions,
    updateSessionStatusLocally,
    updateSessionAddress,
    updateSessionProfiles
  } = useSessionContext();

  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'As Requester' | 'As Receiver'>('All');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) fetchSessions();
    }, [user])
  );

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const matches = await getMyMatches(user.id);
      const active = matches.filter((m: any) => m.status === 'accepted');
      const sessionPromises = active.map((match: any) => getSessionByMatch(match.match_id));
      const sessionResults = await Promise.all(sessionPromises);
      const validSessions = sessionResults.filter((s) => s && ['created', 'started', 'completed', 'cancelled'].includes(s.status));
      setSessions(validSessions);

      const nearbyProfiles = await getNearbyUsers(user.id, 5);
      const profileMap: Record<string, any> = {};
      nearbyProfiles.forEach((u: any) => {
        if (u.profile) profileMap[u.user_id] = u.profile;
      });

      await Promise.all(
        validSessions.map(async (s) => {
          if (!s.address) {
            const address = await reverseGeocode(s.location.lat, s.location.lng);
            updateSessionAddress(s.session_id, address);
          }

          const requesterProfile = profileMap[s.requester_id];
          const helperProfile = profileMap[s.helper_id];

          if (requesterProfile || helperProfile) {
            updateSessionProfiles(s.session_id, {
              requester: requesterProfile,
              helper: helperProfile
            });
          }
        })
      );
    } catch (err) {
      console.error('Failed to load sessions or profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus(sessionId, status);
      updateSessionStatusLocally(sessionId, status);
      Alert.alert('Success', `Session ${status} successfully.`);
      setModalVisible(false);

      if (status === 'completed') {
        const session = sessions.find(s => s.session_id === sessionId);
        const targetUserId = user?.id === session?.requester_id ? session?.helper_id : session?.requester_id;
        navigation.navigate('Rating', {
          session_id: sessionId,
          reviewer_id: user?.id,
          target_user_id: targetUserId,
        });
      }
    } catch (err) {
      console.error(`Error updating session status:`, err);
      Alert.alert('Error', 'Could not update session.');
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (selectedFilter === 'As Requester') return session.requester_id === user?.id;
    if (selectedFilter === 'As Receiver') return session.helper_id === user?.id;
    return true;
  });

  const renderSessionCard = (session: any) => {
    const isRequester = session.requester_id === user?.id;
    const profile = isRequester ? session.helper_profile : session.requester_profile;

    return (
      <TouchableOpacity
        key={session.session_id}
        style={styles.sessionCard}
        onPress={() => {
          setSelectedSession(session);
          setModalVisible(true);
        }}
      >
        <Text style={styles.sessionTopText}>
          {isRequester ? 'You sent a request' : 'You received a request'} on {new Date(session.created_at).toLocaleString()}
        </Text>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={20} color="#000" />
          <Text style={styles.infoText}>{session.address || 'Fetching address...'}</Text>
        </View>

        {profile && (
          <View style={styles.infoRow}>
            <Feather name="user" size={20} color="#000" />
            <Text style={styles.infoText}>{profile.name || 'User'} ({profile.average_rating?.toFixed(1) ?? 'N/A'} ⭐️)</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-clock" size={20} color="#000" />
          <Text style={styles.infoText}>Status: {session.status}</Text>
        </View>
           

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        {/*
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Sessions</Text>
        </View>
         */}

        <View style={styles.filterRow}>
          {['All', 'As Requester', 'As Receiver'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, selectedFilter === f && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(f as any)}
            >
              <Text style={[styles.filterButtonText, selectedFilter === f && styles.filterButtonTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6e5be0" />
        ) : filteredSessions.length === 0 ? (
          <Text style={styles.footerText}>No sessions available.</Text>
        ) : (
          filteredSessions.map(renderSessionCard)
        )}

        <View style={styles.divider} />
        <Text style={styles.footerText}>Total Ongoing Sessions: {filteredSessions.length}</Text>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Session</Text>
            {selectedSession?.requester_id === user?.id && (
              <Pressable style={styles.modalButton} onPress={() => handleStatusChange(selectedSession.session_id, 'completed')}>
                <Text style={styles.modalButtonText}>Complete</Text>
              </Pressable>
            )}
            <Pressable style={styles.modalButton} onPress={() => handleStatusChange(selectedSession.session_id, 'cancelled')}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15, color: '#666' }}>Close</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
            style={styles.modalButton}
            onPress={() => {
                setModalVisible(false);
                navigation.navigate('Report', { session: selectedSession });
            }}
            >
            <Text style={styles.modalButtonText}>Report</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SessionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  filterButton: {
    borderWidth: 1, borderColor: '#aaa', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5,
  },
  filterButtonActive: { backgroundColor: '#d9d9ff', borderColor: '#6e5be0' },
  filterButtonText: { fontSize: 14, color: '#666' },
  filterButtonTextActive: { color: '#4e4c9a', fontWeight: '600' },
  sessionCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2,
  },
  sessionTopText: { fontSize: 15, fontWeight: '600', marginBottom: 15, color: '#000' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 14, marginLeft: 10, color: '#333' },
  divider: { height: 1, backgroundColor: '#aaa', marginVertical: 20 },
  footerText: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#000' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center'
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  modalButton: {
    backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
    marginTop: 10, width: '100%', alignItems: 'center'
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});


/*
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSessionContext } from '../contexts/SessionContext';

const SessionScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { sessions, fetchSessions, updateSessionStatusLocally, updateSessionAddress, updateSessionProfiles } = useSessionContext();

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchSessions(user.id);
        setLoading(false);
      }
    }, [user])
  );

  const renderSessionCard = (session: any) => {
    return (
      <TouchableOpacity key={session.session_id} style={styles.sessionCard}>
        <Text>{session.status}</Text>
      
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#6e5be0" />
        ) : (
          sessions.map(renderSessionCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SessionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  filterButton: {
    borderWidth: 1, borderColor: '#aaa', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5,
  },
  filterButtonActive: { backgroundColor: '#d9d9ff', borderColor: '#6e5be0' },
  filterButtonText: { fontSize: 14, color: '#666' },
  filterButtonTextActive: { color: '#4e4c9a', fontWeight: '600' },
  sessionCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2,
  },
  sessionTopText: { fontSize: 15, fontWeight: '600', marginBottom: 15, color: '#000' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 14, marginLeft: 10, color: '#333' },
  divider: { height: 1, backgroundColor: '#aaa', marginVertical: 20 },
  footerText: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#000' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center'
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  modalButton: {
    backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
    marginTop: 10, width: '100%', alignItems: 'center'
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});
*/