import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { setAuthToken, clearAuthToken } from "../services/api";
import GitHubService from "../services/githubService";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  hasGithubAccess: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        const { data } = await api.get("/auth/me");
        setUser(data);
      } else {
        clearAuthToken();
        setUser(null);
      }
    } catch (error) {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    const githubService = new GitHubService();
    githubService.connect();
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
