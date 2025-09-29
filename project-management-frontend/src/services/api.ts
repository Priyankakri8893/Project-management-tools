import axios from 'axios';
import { LoginData, RegisterData, ProjectFormData, TaskFormData, User, Project, Task } from '../types';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'http://13.204.6.132:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmt-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginData) => {
    const response = await api.post('/user/login', data);
    if (response.data.success) {
      localStorage.setItem('pmt-token', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/user/signup', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data.data;
  },

  updateProfile: async (data: { name: string; password: string }) => {
    const response = await api.patch('/user/update', data);
    return response.data;
  },

  getUsers: async (key?: string) => {
    const params = key ? { key } : {};
    const response = await api.get('/user/list', { params });
    return response.data;
  },
};

export const projectAPI = {
  getProjects: async (params?: { key?: string; status?: string; page?: number }) => {
    const response = await api.get('/project', { params });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get(`/project/${id}`);
    return response.data;
  },

  createProject: async (data: ProjectFormData) => {
    const response = await api.post('/project', data);
    return response.data;
  },

  updateProject: async (id: string, data: ProjectFormData) => {
    const response = await api.patch(`/project/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`/project/${id}`);
    return response.data;
  },
};

export const taskAPI = {
  getTasks: async (projectId: string, params?: { key?: string; status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`/task/${projectId}`, { params });
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get('/task', { params: { id } });
    return response.data;
  },

  createTask: async (data: TaskFormData) => {
    const response = await api.post('/task', data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<TaskFormData>) => {
    const response = await api.patch(`/task/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/task/${id}`);
    return response.data;
  },
};

export default api;