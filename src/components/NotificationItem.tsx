import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NotificationItemProps {
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: string;
  onPress?: () => void;
}

const NotificationItem = ({ title, message, date, isRead, type, onPress }: NotificationItemProps) => {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    session: 'event',
    chat: 'chat',
    admin: 'admin-panel-settings',
    system: 'notifications',
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, !isRead && styles.unread]}>
        <MaterialIcons
          name={iconMap[type] || 'notifications'}
          size={28}
          color={isRead ? '#aaa' : '#6e5be0'}
          style={styles.icon}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.date}>{new Date(date).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    elevation: 1,
  },
  unread: {
    backgroundColor: '#e8e6ff',
  },
  icon: {
    marginRight: 12,
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  message: {
    color: '#555',
    marginTop: 4,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
