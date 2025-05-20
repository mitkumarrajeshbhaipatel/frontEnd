import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';

const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { sessions } = useSessionContext();
  const { user } = useAuth();

  const filteredSessions = sessions.filter(
    (session) => session.status !== 'cancelled' && session.status !== 'end'
  );

  const handleOpenChat = (sessionId: string) => {
    navigation.navigate('SessionChat', {
      sessionId,
    });
  };

  const renderSessionItem = ({ item }: any) => {
    const isRequester = item.requester_id === user?.id;
    const otherProfile = isRequester ? item.helper_profile : item.requester_profile;

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => handleOpenChat(item.session_id)}
      >
        <Text style={styles.sessionName}>{otherProfile?.name || 'User'} 💬</Text>
        <Text style={styles.sessionMeta}>{item.address || 'Unknown address'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/*<Text style={styles.title}>Active Sessions</Text>*/}

        {filteredSessions.length === 0 ? (
          <Text style={styles.noSessionText}>No active sessions</Text>
        ) : (
          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item.session_id}
            renderItem={renderSessionItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  sessionItem: {
    padding: 15,
    backgroundColor: '#e8e2fc',
    borderRadius: 12,
    marginBottom: 10,
  },
  sessionName: { fontSize: 18, color: '#000' },
  sessionMeta: { fontSize: 14, color: '#555', marginTop: 4 },
  noSessionText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
});
