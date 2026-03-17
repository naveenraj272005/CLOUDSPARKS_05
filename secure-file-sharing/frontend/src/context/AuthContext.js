// src/context/AuthContext.js
// Provides global auth state (user, token) across the app

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on page refresh
    const token = localStorage.getItem("idToken");
    const email = localStorage.getItem("userEmail");
    return token ? { email, token } : null;
  });

  const login = (token, email) => {
    localStorage.setItem("idToken", token);   // axiosClient reads "idToken"
    localStorage.setItem("userEmail", email);
    setUser({ email, token });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
