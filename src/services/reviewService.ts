import API from './api';

export const submitReview = async (reviewData: any) => {
    const response = await API.post('/reviews/', reviewData);
    return response.data;
  };
  
  export const getUserReviews = async (userId: string) => {
    const response = await API.get(`/reviews/${userId}`);
    return response.data;
  };
  
  export const getUserBadges = async (userId: string) => {
    const response = await API.get(`/reviews/badges/${userId}`);
    return response.data;
  };