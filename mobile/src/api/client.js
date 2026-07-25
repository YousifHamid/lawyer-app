import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP الجهاز الحالي المتصل به الهاتف عبر الخادم
const BASE_URL = 'http://172.20.10.2:4000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
