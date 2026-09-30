import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { fullName: string; email: string; phone?: string; password: string }) => Promise<User>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const roles: Role[] = ["ADMIN", "STAFF", "CUSTOMER"];
const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
const readUser = () => {
  try {
    const value = JSON.parse(localStorage.getItem("user") || "null") as User | null;
    if (!value?.id || !value.role?.code || !roles.includes(value.role.code)) return null;
    return value;
  } catch { return null; }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readUser);
  const [isInitializing, setIsInitializing] = useState(true);
  const persist = (data: { user: User; accessToken: string; refreshToken: string }) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    return data.user;
  };
  const login = useCallback(async (email: string, password: string) => persist((await api.post("/auth/login", { email, password })).data.data), []);
  const register = useCallback(async (input: { fullName: string; email: string; phone?: string; password: string }) => persist((await api.post("/auth/register", input)).data.data), []);
  const updateUser = useCallback((nextUser: User) => { localStorage.setItem("user", JSON.stringify(nextUser)); setUser(nextUser); }, []);
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try { await api.post("/auth/logout", { refreshToken }); } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      if (!localStorage.getItem("accessToken")) {
        clearSession();
        setUser(null);
        setIsInitializing(false);
        return;
      }
      try {
        const currentUser = (await api.get<{ data: User }>("/auth/me")).data.data;
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    void verifySession();
  }, []);

  const value = useMemo(() => ({ user, isInitializing, login, register, updateUser, logout }), [user, isInitializing, login, register, updateUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phai duoc dung trong AuthProvider");
  return context;
};

export const homeForRole = (role: Role) => role === "ADMIN" ? "/admin/dashboard" : role === "STAFF" ? "/staff/dashboard" : "/customer/dashboard";
