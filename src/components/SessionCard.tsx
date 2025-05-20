import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SessionCardProps {
  sessionTitle: string;
  sessionStatus: string;
  onPress: () => void;
}

const SessionCard = ({ sessionTitle, sessionStatus, onPress }: SessionCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{sessionTitle}</Text>
      <Text style={[styles.status, { color: sessionStatus === 'completed' ? 'green' : 'orange' }]}>
        {sessionStatus.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

export default SessionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  status: { fontSize: 14, fontWeight: '600' },
});
