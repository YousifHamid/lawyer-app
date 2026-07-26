import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production & Local Fallback Server Endpoints
const PROD_URL = 'https://api.lawyer-app.sd/api';
const LOCAL_URL = 'http://172.20.10.2:4000/api';

const BASE_URL = process.env.NODE_ENV === 'production' ? PROD_URL : LOCAL_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
