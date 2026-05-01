import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  getUsers: () => API.get('/auth/users'),
};

// Projects
export const projectsAPI = {
  getAll: () => API.get('/projects'),
  getOne: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getStats: () => API.get('/tasks/stats'),
  getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
  create: (projectId, data) => API.post(`/tasks/project/${projectId}`, data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
};

export default API;
