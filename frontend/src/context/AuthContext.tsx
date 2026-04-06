import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api";

export type UserRole = "admin" | "gerente" | "estoquista" | "vendedor" | string;

export type User = {
  id: number;
  nome: string;
  email: string;
  tipo: UserRole;
  ativo?: boolean;
};

type LoginPayload = {
  email: string;
  senha: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

function salvarSessao(access: string, refresh: string, user: User | null) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

function limparSessao() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function normalizeUser(data: any): User {
  return {
    id: Number(data?.id ?? 0),
    nome: data?.nome || data?.email || "Usuário",
    email: data?.email || "",
    tipo: data?.tipo || "vendedor",
    ativo: data?.ativo ?? true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      limparSessao();
      return;
    }

    try {
      const response = await api.get("/usuarios/me/");
      const normalizedUser = normalizeUser(response.data);

      setUser(normalizedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } catch {
      setUser(null);
      limparSessao();
    }
  }

async function login(payload: LoginPayload) {
  try {
    const response = await api.post("/token/", {
      email: payload.email,
      password: payload.senha,
    });

    const access = response.data?.access || response.data?.access_token || null;
    const refresh = response.data?.refresh || response.data?.refresh_token || "";
    const userData = response.data?.user || null;

    if (!access) {
      return {
        success: false,
        message: "Token de acesso não retornado pelo servidor.",
      };
    }

    const normalizedUser = userData
      ? normalizeUser(userData)
      : null;

    salvarSessao(access, refresh, normalizedUser);
    setUser(normalizedUser);

    if (!normalizedUser) {
      await refreshUser();
    }

    return { success: true };
  } catch (error: any) {
    const data = error?.response?.data;

    const message =
      data?.detail ||
      data?.email?.[0] ||
      data?.password?.[0] ||
      data?.non_field_errors?.[0] ||
      "Não foi possível fazer login.";

    return {
      success: false,
      message,
    };
  }
}

  function logout() {
    setUser(null);
    limparSessao();
    window.location.href = "/login";
  }

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const token = getAccessToken();

        if (!token) {
          if (active) {
            setUser(null);
          }
          return;
        }

        await refreshUser();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}