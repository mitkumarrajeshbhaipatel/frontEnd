import API from './api';

export const requestMatch = async (requestData: any) => {
    const response = await API.post('/matchmaking/request', requestData);
    return response.data;
  };
  
  export const respondToMatch = async (matchId: string, status: string) => {
    const response = await API.post(`/matchmaking/respond/${matchId}`, { status });
    return response.data;
  };
  
  export const getMyMatches = async (userId: string) => {
    const response = await API.get(`/matchmaking/my-matches/${userId}`);
    return response.data;
  };