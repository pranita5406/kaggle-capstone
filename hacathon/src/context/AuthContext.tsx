"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useDashboard } from "@/context/DashboardContext";

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string;
  role: string;
  login: (userName: string, role: string) => void;
  logout: () => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for session on mount
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("sentinel-session");
    }
    return false;
  });
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sentinel-user") || "Incoming Nurse";
    }
    return "Incoming Nurse";
  });
  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sentinel-role") || "RN";
    }
    return "RN";
  });

  const login = useCallback((newUserName: string, newRole: string) => {
    setUserName(newUserName);
    setRole(newRole);
    localStorage.setItem("sentinel-session", "true");
    localStorage.setItem("sentinel-user", newUserName);
    localStorage.setItem("sentinel-role", newRole);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(() => {
    // Wipe all sensitive data
    localStorage.removeItem("sentinel-session");
    localStorage.removeItem("sentinel-user");
    localStorage.removeItem("sentinel-role");
    localStorage.removeItem("sentinel-patient-context");
    
    // Clear sensitive cookies if any
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    setIsAuthenticated(false);
    setUserName("Incoming Nurse");
    setRole("RN");
  }, []);

  const logout = useCallback(() => {
    clearSession();
    // Redirect will be handled by component
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userName,
        role,
        login,
        logout,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
