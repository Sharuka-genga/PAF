import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  isAdmin: () => boolean;
  isTechnician: () => boolean;
  loadUser: () => Promise<User | null>;
  setAuthToken: (token: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Immediately load cached user so routes don't flash
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token with backend silently
      loadUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (): Promise<User | null> => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authAPI.login({ email, password });
    const { token, id, name, email: userEmail, roles, profilePicture } = response.data.data;
    localStorage.setItem('token', token);
    const userData: User = {
      id,
      name,
      email: userEmail,
      profilePicture,
      roles: Array.isArray(roles) ? roles : Object.values(roles),
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const response = await authAPI.register({ name, email, password });
    const { token, id, name: userName, email: userEmail, roles, profilePicture } = response.data.data;
    localStorage.setItem('token', token);
    const userData: User = {
      id,
      name: userName,
      email: userEmail,
      profilePicture,
      roles: Array.isArray(roles) ? roles : Object.values(roles),
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const deleteAccount = async () => {
    await authAPI.deleteMe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.roles?.includes('ADMIN') ?? false;
  const isTechnician = () => user?.roles?.includes('TECHNICIAN') ?? false;

  const setAuthToken = async (token: string): Promise<User | null> => {
    localStorage.setItem('token', token);
    const userData = await loadUser();
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, isAdmin, isTechnician, loadUser, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
