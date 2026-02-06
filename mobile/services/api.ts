import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const URL = 'http://192.168.1.50:3000';
const API_URL = URL+'/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface RegisterData {
  firstname: string;
  lastname: string;
  mail: string;
  password: string;
  picture?: string;
}

export interface LoginData {
  mail: string;
  password: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  mail: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  picture?: string;
}

export interface ChangePasswordData {
  password: string;
}

export interface Permission {
  id: number;
  type: string;
  userId: number;
  homeId: number;
  createdAt: string;
  updatedAt: string;
  home?: Home;
}

export interface Home {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeUser {
  id: number;
  firstname: string;
  lastname: string;
  mail: string;
  picture?: string;
  permissionType: string;
  permissionId: number;
}

export interface CreateHomeData {
  name: string;
  userId: number;
}

export interface InviteLink {
  id: number;
  homeId: number;
  link: string;
  expirationDate: string;
  createdAt: string;
}

export interface CreateInviteLinkData {
  homeId: number;
}

export interface UseInviteLinkData {
  link: string;
  userId: number;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userId: number, data: UpdateUserData): Promise<User> => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  changePassword: async (userId: number, data: ChangePasswordData): Promise<User> => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  updateAvatar: async (userId: number, formData: FormData): Promise<User> => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const permissionsAPI = {
  getUserPermissions: async (userId: number): Promise<Permission[]> => {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data;
  },
};

export const homesAPI = {
  create: async (data: CreateHomeData): Promise<Home> => {
    const response = await api.post('/homes', data);
    return response.data;
  },

  findOne: async (id: number): Promise<Home> => {
    const response = await api.get(`/homes/${id}`);
    return response.data;
  },

  getHomeUsers: async (id: number): Promise<HomeUser[]> => {
    const response = await api.get(`/homes/${id}/users`);
    return response.data;
  },
};

export const inviteLinksAPI = {
  create: async (data: CreateInviteLinkData): Promise<InviteLink> => {
    const response = await api.post('/invite-links', data);
    return response.data;
  },

  getByHome: async (homeId: number): Promise<InviteLink[]> => {
    const response = await api.get(`/invite-links/home/${homeId}`);
    return response.data;
  },

  use: async (data: UseInviteLinkData): Promise<Permission> => {
    const response = await api.post('/invite-links/use', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/invite-links/${id}`);
  },
};

export default api;
