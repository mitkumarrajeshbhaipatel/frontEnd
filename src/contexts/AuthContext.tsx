// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, register as registerApi } from '../services/authService';
import { getProfile } from '../services/profileService'; 
import { useProfile } from '../contexts/ProfileContext';

interface AuthContextProps {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const { setProfile } = useProfile(); 

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const accessToken = response.data.access_token;

    if (accessToken) {
      setToken(accessToken);
      setUser(response.data.user)
      await AsyncStorage.setItem('token', accessToken);
    } else {
      throw new Error('Login failed: No token received');
    }

    const fetchedProfile = await getProfile(response.data.user.id);
    setProfile(fetchedProfile);
  };

  const register = async (name: string, email: string, password: string) => {
    await registerApi(name, email, password);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be inside an AuthProvider');
  }
  return context;
};
