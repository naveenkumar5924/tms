import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authService,
  getBaseUrl,
  setBaseUrl,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState('');

  // Initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUrl = await getBaseUrl();
        setServerUrl(currentUrl);

        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {}
          }
          // Fetch fresh profile in background
          try {
            const profile = await authService.getProfile();
            setUser(profile);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
          } catch (profileErr) {
            console.warn('Profile fetch error, using stored user if any', profileErr);
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token: newToken, user: userData } = res;

    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Refresh profile failed:', err);
      throw err;
    }
  };

  const updateServerUrl = async (newUrl) => {
    const cleaned = await setBaseUrl(newUrl);
    setServerUrl(cleaned);
    return cleaned;
  };

  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isRegularUser = user?.role === 'User';
  const isStaff = user && !isSuperAdmin && !isRegularUser;

  const value = {
    user,
    token,
    loading,
    serverUrl,
    isAuthenticated: !!token,
    isSuperAdmin,
    isStaff,
    isRegularUser,
    login,
    logout,
    refreshProfile,
    updateServerUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
