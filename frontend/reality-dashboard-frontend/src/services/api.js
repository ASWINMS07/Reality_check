import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (data) => {
  console.log('API Request: POST /auth/signup', data);
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const login = async (data) => {
  console.log('API Request: POST /auth/login', data);
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const updateUser = async (data) => {
  console.log('API Request: PUT /user/update', data);
  const response = await api.put('/user/update', data);
  return response.data;
};

export const changePassword = async (data) => {
  console.log('API Request: PUT /user/change-password', data);
  const response = await api.put('/user/change-password', data);
  return response.data;
};

export const fetchTasks = async () => {
  console.log('API Request: GET /tasks');
  try {
    const response = await api.get('/tasks');
    console.log('API Response: GET /tasks', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error: GET /tasks', error);
    throw error;
  }
};

export const createTask = async (data) => {
  console.log('API Request: POST /tasks', data);
  try {
    const response = await api.post('/tasks', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('API Response: POST /tasks', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error: POST /tasks', error);
    throw error;
  }
};

export const updateTask = async (id, data) => {
  console.log(`API Request: PUT /tasks/${id}`, data);
  try {
    const response = await api.put(`/tasks/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`API Response: PUT /tasks/${id}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: PUT /tasks/${id}`, error);
    throw error;
  }
};

export const fetchAnalytics = async () => {
  console.log('API Request: GET /analytics');
  try {
    const response = await api.get('/analytics');
    console.log('API Response: GET /analytics', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error: GET /analytics', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  console.log(`API Request: DELETE /tasks/${id}`);
  try {
    const response = await api.delete(`/tasks/${id}`);
    console.log(`API Response: DELETE /tasks/${id}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: DELETE /tasks/${id}`, error);
    throw error;
  }
};

export const startTask = async (id) => {
  console.log(`API Request: POST /tasks/${id}/start`);
  try {
    const response = await api.post(`/tasks/${id}/start`);
    console.log(`API Response: POST /tasks/${id}/start`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: POST /tasks/${id}/start`, error);
    throw error;
  }
};

export const stopTask = async (id) => {
  console.log(`API Request: POST /tasks/${id}/stop`);
  try {
    const response = await api.post(`/tasks/${id}/stop`);
    console.log(`API Response: POST /tasks/${id}/stop`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: POST /tasks/${id}/stop`, error);
    throw error;
  }
};
