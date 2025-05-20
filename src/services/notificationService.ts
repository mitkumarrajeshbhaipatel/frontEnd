import API from './api';

export const createNotification = async (notificationData: any) => {
    const response = await API.post('/notifications/', notificationData);
    return response.data;
  };
  
  export const getNotifications = async (userId: string) => {
    const response = await API.get(`/notifications/${userId}`);
    return response.data;
  };
  
  export const markNotificationAsRead = async (notificationId: string) => {
    const response = await API.post(`/notifications/mark-read/${notificationId}`);
    return response.data;
  };