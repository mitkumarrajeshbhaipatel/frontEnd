import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useNotificationContext } from '../contexts/NotificationContext';
import NotificationItem from '../components/NotificationItem';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { markNotificationAsRead } from '../services/notificationService';

const NotificationsScreen = () => {
  const { notifications, addNotification } = useNotificationContext();

  useNotificationSocket();

  const sortedNotifications = [...notifications].sort((a, b) =>
    new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
  );

  const handleNotificationPress = async (item: any) => {
    if (!item.is_read) {
      try {
        await markNotificationAsRead(item.notification_id);
        addNotification({ ...item, is_read: true }); // update in context
      } catch (error) {
        Alert.alert('Error', 'Failed to mark as read.');
      }
    }
    // Optional: Navigate or show full detail
    Alert.alert(item.title, item.message);
  };

  if (sortedNotifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No notifications yet.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => item.notification_id}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.title}
            message={item.message}
            date={item.created_at || ''}
            isRead={item.is_read ?? false}
            type={item.notification_type || 'system'}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
