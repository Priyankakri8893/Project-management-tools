export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  owner: {
    _id: string;
    name: string;
  };
  completedAt: Date | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: Date | null;
  assignedTo: string | null;
  project: string;
}

export interface ApiResponse<T = any> {
  msg: string;
  success: boolean;
  data?: T;
  error?: string;
  token?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  status?: 'active' | 'completed';
}

export interface TaskFormData {
  title: string;
  description: string;
  status?: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignedTo?: string;
  project: string;
}