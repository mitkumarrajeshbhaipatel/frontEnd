import API from './api';

export const createSession = async (sessionData: any) => {
    const response = await API.post('/sessions/create', sessionData);
    return response.data;
  };
  
  export const updateSessionStatus = async (sessionId: string, status: string) => {
    const response = await API.post(`/sessions/update-status/${sessionId}`, { status });
    return response.data;
  };
  
  export const getSessionByMatch = async (matchId: string) => {
    const response = await API.get(`/sessions/by-match/${matchId}`);
    return response.data;
  };
  