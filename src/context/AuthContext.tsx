import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService, LoginCredentials, RegisterPayload } from '../services/authService';
import { checkBackendHealth } from '../services/api';
import { societyStore } from '../services/store';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendConnected: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateCurrentUser: (updated: Partial<User>) => void;
  checkConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
    const isUp = await checkBackendHealth();
    setBackendConnected(isUp);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkConnection();
        const storedToken = localStorage.getItem('smart_neighbour_token');
        const storedUser = localStorage.getItem('smart_neighbour_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // If no stored credentials, stay logged out so unauthenticated users are directed to /login
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to 401 unauthorized events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkConnection]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('smart_neighbour_token', response.token);
      localStorage.setItem('smart_neighbour_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('smart_neighbour_token', response.token);
      localStorage.setItem('smart_neighbour_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  // Demo role switcher for project presentation
  const switchRole = (newRole: UserRole) => {
    const users = societyStore.getUsers();
    let targetUser: User | undefined;

    if (newRole === 'ADMIN') {
      targetUser = users.find(u => u.role === 'ADMIN') || {
        ...users[0],
        id: 'usr-admin-1',
        role: 'ADMIN',
        name: 'Srikumar',
        apartmentNumber: '101',
        block: 'Block A (Society Office)',
        trustScore: 98,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      };
    } else {
      targetUser = users.find(u => u.role === 'RESIDENT') || users[0];
    }

    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('smart_neighbour_user', JSON.stringify(targetUser));
    }
  };

  const updateCurrentUser = (updated: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem('smart_neighbour_user', JSON.stringify(updatedUser));

    // Update in store
    const users = societyStore.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      societyStore.setUsers(users);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'RESIDENT',
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        backendConnected,
        login,
        register,
        logout,
        switchRole,
        updateCurrentUser,
        checkConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
