import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  gender?: string;
  age?: number;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // register: (email: string, password: string, name: string, gender: string, age: number) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    gender: string,
    age: number,
    height: number,
    weight: number
  ) => Promise<void>;
  
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, gender: string, age: number,height: number,
    weight: number) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        gender,
        age,
        height,
        weight
      });
      
      

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = { ...res.data.user, ...data };
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Update profile failed:', error.response?.data?.error || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextProps = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
