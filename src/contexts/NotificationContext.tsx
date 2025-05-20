import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  created_at?: string;
  is_read?: boolean;
  notification_type?: string;
}


interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prevNotifications) => {
      if (prevNotifications.find((n) => n.notification_id === notification.notification_id)) {
        return prevNotifications;
      }
      return [...prevNotifications, notification];
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to consume notification context safely
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
