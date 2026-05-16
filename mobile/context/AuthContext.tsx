import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, LoginData, RegisterData, User, Home, homesAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  currentHome: Home | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadCurrentHome: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHome, setCurrentHome] = useState<Home | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await loadUser();
        await loadCurrentHome();
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'authentification:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      await logout();
    }
  };

  const loadCurrentHome = async () => {
    try {
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      if (selectedHomeId) {
        const homeId = parseInt(selectedHomeId);
        const homes = await homesAPI.getHomes();
        const home = homes.find((h) => h.id === homeId);
        if (home) {
          setCurrentHome(home);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la maison actuelle:', error);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      await AsyncStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      await AsyncStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        currentHome,
        login,
        register,
        logout,
        loadUser,
        loadCurrentHome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
