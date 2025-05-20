import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = (name: string, email: string, password: string) => {
    return api.post('/auth/register', {
      name,
      email: email.toLowerCase(),
      password,
    });
  };
  
  export const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', null, {
        params: {
          email: email.toLowerCase(),
          password,
        },
      });
  
      console.log('Login API success:', response.data);
  
      const access_token = response.data.access_token;
      console.log(access_token);
      if (access_token) {
        await AsyncStorage.setItem('token', access_token);
      }
  
      return response;
    } catch (error: any) {
      console.error('Login error:', error?.response?.data || error.message);
      throw error;
    }
  };
  
  export const forgetPassword = (email: string) => {
    return api.post('/auth/forget-password', null, {
      params: {
        email: email.toLowerCase(),
      },
    });
  };
  

export const changePassword = (token: string, newPassword: string) => {
  return api.post('/auth/change-password', null, { params: { token, new_password: newPassword } });
};
