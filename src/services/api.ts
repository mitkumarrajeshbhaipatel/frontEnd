/*
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.0.181:8000'; // Update this when you deploy to production
//const API_BASE_URL = 'http://203.56.147.114:8000'; // Update this when you deploy to production


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token automatically into headers
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

*/

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_BASE_URL = 'http://10.0.0.181:8000'; // Your backend URL
const API_BASE_URL = 'https://photoaid.onrender.com'; // Your backend URL


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token automatically into headers
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token'); // ✅ Correct key
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
