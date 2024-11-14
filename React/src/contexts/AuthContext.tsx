import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  loading: boolean;
  redirectPath: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  setRedirectPath: (path: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      return Date.now() > exp;
    } catch {
      return true;
    }
  };

  const fetchUserRole = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/user_management/user-profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRole(data.role);
      } else {
        throw new Error("Failed to fetch user role");
      }
    } catch (error) {
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string, newRefreshToken: string) => {
    console.log("Login: token received", newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    await fetchUserRole(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    setRedirectPath(null);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
      } else {
        fetchUserRole(token);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        loading,
        redirectPath,
        login,
        logout,
        setRedirectPath,
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
