"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { staticData } from '@/lib/static-data';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  commissionRuleId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('dragon-saloon-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('dragon-saloon-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get users from static data
      const users = await staticData.getUsers();

      // In a real app, this would hash the password and compare
      // For demo purposes, we'll use simple username/password combinations
      const validCredentials = [
        { username: 'admin', password: 'admin123', userId: 'admin1' },
        { username: 'red', password: 'staff123', userId: 'manager1' },
        { username: 'jake', password: 'staff123', userId: 'staff1' },
        { username: 'belle', password: 'staff123', userId: 'staff2' },
        { username: 'frank', password: 'staff123', userId: 'staff3' },
        { username: 'doc', password: 'staff123', userId: 'staff4' }
      ];

      const credentials = validCredentials.find(
        cred => cred.username === username && cred.password === password
      );

      if (!credentials) {
        return false;
      }

      // Find user in the users data
      const foundUser = users?.find(u => u.username === username);

      if (!foundUser || foundUser.status === 'INACTIVE') {
        return false;
      }

      const userSession: User = {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        role: foundUser.role,
        status: foundUser.status,
        commissionRuleId: foundUser.commissionRuleId
      };

      setUser(userSession);
      localStorage.setItem('dragon-saloon-user', JSON.stringify(userSession));
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dragon-saloon-user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading
    }}>
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