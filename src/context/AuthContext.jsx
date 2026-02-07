import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    };
    loadSession();
  }, []);

  const signin = async (payload) => {
    const response = await api.signin(payload);
    console.log('Signin response:', response);
    const nextUser = {
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    };
    setUser(nextUser);
    setToken(response.token);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    return response;
  };

  const signupOwner = async (payload) => {
    const response = await api.signupOwner(payload);
    console.log('Signup response:', response);
    const nextUser = {
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    };
    setUser(nextUser);
    setToken(response.token);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    return response;
  };

  const signupMechanic = async (payload) => {
    const response = await api.signupMechanic(payload);
    console.log('Signup response:', response);
    const nextUser = {
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    };
    setUser(nextUser);
    setToken(response.token);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    return response;
  };

  const signout = () => {
    setUser(null);
    setToken(null);
    SecureStore.deleteItemAsync(TOKEN_KEY);
    SecureStore.deleteItemAsync(USER_KEY);
  };

  const value = useMemo(
    () => ({ user, token, signin, signupOwner, signupMechanic, signout, ready }),
    [user, token, ready]
  );

  if (!ready) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
