import API from './api';

export const createProfile = async (profileData: any) => {
    const response = await API.post('/profiles/', profileData);
    return response.data;
  };
  
  export const updateProfile = async (userId: string, profileData: any) => {
    const response = await API.put(`/profiles/${userId}`, profileData);
    return response.data;
  };
  
  export const getProfile = async (userId: string) => {
    const response = await API.get(`/profiles/${userId}`);
    return response.data;
  };
  
  export const deleteProfile = async (userId: string) => {
    const response = await API.delete(`/profiles/${userId}`);
    return response.data;
  };
  