import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthContextType {
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

export const AuthProvider: (props: { children: ReactNode }) => JSX.Element;
export const useAuth: () => AuthContextType;
