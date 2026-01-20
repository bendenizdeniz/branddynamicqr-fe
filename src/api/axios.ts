// api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Her istekten önce token'ı localStorage'dan alıp Authorization header'ına ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Token'ı nerede tutuyorsanız (cookie/localStorage)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;