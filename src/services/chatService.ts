import API from './api';

export const getMessages = async (sessionId: string) => {
    const response = await API.get(`/chat/messages/${sessionId}`);
    return response.data;
  };
  
  