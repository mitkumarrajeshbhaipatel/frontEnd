import API from './api';

export const updateLocation = async (locationData: any) => {
    const response = await API.post('/location/update', locationData);
    return response.data;
  };
  
  export const getNearbyUsers = async (userId: string, radius_km: number) => {
    const response = await API.get(`/location/nearby/${userId}?radius_km=${radius_km}`);
    return response.data;
  };
  
  