import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@ecowaste.com',
    role: 'admin',
    regionId: 'region-1',
  },
  driver: {
    id: 'driver-1',
    name: 'Amal Perera',
    email: 'driver@ecowaste.com',
    role: 'driver',
    regionId: 'region-1',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers.admin); // Start as admin for demo

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - replace with actual API call
    if (email.includes('admin')) {
      setUser(mockUsers.admin);
      return true;
    } else if (email.includes('driver')) {
      setUser(mockUsers.driver);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(role === 'admin' ? mockUsers.admin : mockUsers.driver);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
