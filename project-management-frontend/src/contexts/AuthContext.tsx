import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pmt-token');
    if (token) {
      authAPI.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('pmt-token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const result = await authAPI.login({ email, password });
    if (result.success && result.token) {
      const userData = await authAPI.getProfile();
      setUser(userData);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authAPI.register({ email, password });
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pmt-token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};