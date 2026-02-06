import React, { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const signin = async (payload) => {
    const response = await api.signin(payload);
    console.log('Signin response:', response);
    setUser({
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    });
    setToken(response.token);
    return response;
  };

  const signupOwner = async (payload) => {
    const response = await api.signupOwner(payload);
    console.log('Signup response:', response);
    setUser({
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    });
    setToken(response.token);
    return response;
  };

  const signupMechanic = async (payload) => {
    const response = await api.signupMechanic(payload);
    console.log('Signup response:', response);
    setUser({
      id: response.userId,
      role: response.role,
      firstName: response.firstName || response.name || '',
      surname: response.surname || '',
      name: response.name || response.firstName || '',
      email: response.email,
    });
    setToken(response.token);
    return response;
  };

  const signout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, signin, signupOwner, signupMechanic, signout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
