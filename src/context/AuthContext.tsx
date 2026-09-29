import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  facultyType?: 'mentor' | 'advisor';
  registerNumber?: string;
  department?: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: any | null;
  loading: boolean;
  login: (identifier: string, password: string, role?: string) => Promise<{ success: boolean; redirectUrl?: string; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getRedirectPath = (currentUser: User): string => {
    if (currentUser.role === 'student') return '/student/dashboard';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'faculty') {
      return currentUser.facultyType === 'advisor'
        ? '/faculty/advisor/dashboard'
        : '/faculty/mentor/dashboard';
    }
    return '/login';
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('cc_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cc_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('cc_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string, role?: string) => {
    try {
      const res = await authService.login({ identifier, password, role });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('cc_token', newToken);
        localStorage.setItem('cc_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

        // Fetch full profile
        try {
          const profileRes = await authService.getMe();
          if (profileRes.data.profile) {
            setProfile(profileRes.data.profile);
          }
        } catch {
          // ignore
        }

        const redirectUrl = res.data.redirectUrl || getRedirectPath(newUser);
        return { success: true, redirectUrl };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
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
