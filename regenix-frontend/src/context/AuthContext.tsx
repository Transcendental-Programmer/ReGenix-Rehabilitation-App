import React, { createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User'
  },
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={{
      user: {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User'
      },
      isAuthenticated: true,
      isLoading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      updateProfile: async () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};