import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import {
  registerStudent,
  registerTutor,
  login as apiLogin,
  getProfile,
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile if token exists
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((res) => {
          setUser(res.data.data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    const { token, user: userData } = response.data.data;
    if (token) {
      localStorage.setItem('token', token);
      setUser(userData);
    } else {
      throw new Error('No token returned from API');
    }
  };

  const register = async (data: any) => {
    let response;
    if (data.role === 'tutor') {
      response = await registerTutor(data);
    } else {
      response = await registerStudent(data);
    }
    const { token, user: userData } = response.data.data;
    if (token) {
      localStorage.setItem('token', token);
      setUser(userData);
    } else {
      throw new Error('No token returned from API');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
