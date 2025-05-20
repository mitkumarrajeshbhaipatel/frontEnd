import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { Alert } from 'react-native';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';

const POLL_INTERVAL = 10000; // 10 seconds

const useNotificationSocket = () => {
  const { user } = useAuth();
  const { addNotification } = useNotificationContext();
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const notifications = await getNotifications(user.id);
        if (!isMounted) return;

        const newNotifications = notifications.filter((n) => !seenNotifications.has(n.notification_id));

        for (const notification of newNotifications) {
          //await markNotificationAsRead(notification.notification_id);
          addNotification(notification);
          //Alert.alert(notification.title, notification.message);
        }

        setSeenNotifications(new Set(notifications.map((n) => n.notification_id)));
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id, addNotification, seenNotifications]);
};

export default useNotificationSocket;
