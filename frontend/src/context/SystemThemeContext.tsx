import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api";

export type SystemTheme = {
  nome_empresa: string;
  nome_sistema: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  cor_fundo: string;
  cor_texto: string;
  cor_card: string;
  cor_botao_perigo: string;
  fonte_base: string;
  tamanho_fonte_base: number;
  tamanho_logo: number;
  raio_borda: number;
  largura_container: number;
  exibir_subtitulo_empresa: boolean;
  layout_compacto: boolean;
};

type SystemThemeContextType = {
  theme: SystemTheme;
  loading: boolean;
  refreshTheme: () => Promise<void>;
};

const defaultTheme: SystemTheme = {
  nome_empresa: "Minha Empresa",
  nome_sistema: "Sistema de Estoque",
  logo_url: null,
  cor_primaria: "#2563eb",
  cor_secundaria: "#0f172a",
  cor_fundo: "#eef2f7",
  cor_texto: "#0f172a",
  cor_card: "#ffffff",
  cor_botao_perigo: "#ef4444",
  fonte_base: "Inter",
  tamanho_fonte_base: 15,
  tamanho_logo: 44,
  raio_borda: 20,
  largura_container: 1500,
  exibir_subtitulo_empresa: true,
  layout_compacto: false,
};

const SystemThemeContext = createContext<SystemThemeContextType | undefined>(
  undefined
);

export function SystemThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SystemTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);

  function applyThemeToCssVars(nextTheme: SystemTheme) {
    const root = document.documentElement;

    root.style.setProperty("--brand-primary", nextTheme.cor_primaria);
    root.style.setProperty("--brand-secondary", nextTheme.cor_secundaria);
    root.style.setProperty("--brand-bg", nextTheme.cor_fundo);
    root.style.setProperty("--brand-text", nextTheme.cor_texto);
    root.style.setProperty("--brand-card", nextTheme.cor_card);
    root.style.setProperty("--brand-danger", nextTheme.cor_botao_perigo);
    root.style.setProperty("--brand-font", nextTheme.fonte_base);
    root.style.setProperty("--brand-font-size", `${nextTheme.tamanho_fonte_base}px`);
    root.style.setProperty("--brand-radius", `${nextTheme.raio_borda}px`);
    root.style.setProperty("--brand-logo-size", `${nextTheme.tamanho_logo}px`);
    root.style.setProperty("--brand-container-width", `${nextTheme.largura_container}px`);
  }

  async function refreshTheme() {
    try {
      const response = await api.get("/configuracoes/tema-atual/");
      const data = response.data;

      const normalized: SystemTheme = {
        nome_empresa: data?.nome_empresa || defaultTheme.nome_empresa,
        nome_sistema: data?.nome_sistema || defaultTheme.nome_sistema,
        logo_url: data?.logo_url || null,
        cor_primaria: data?.cor_primaria || defaultTheme.cor_primaria,
        cor_secundaria: data?.cor_secundaria || defaultTheme.cor_secundaria,
        cor_fundo: data?.cor_fundo || defaultTheme.cor_fundo,
        cor_texto: data?.cor_texto || defaultTheme.cor_texto,
        cor_card: data?.cor_card || defaultTheme.cor_card,
        cor_botao_perigo: data?.cor_botao_perigo || defaultTheme.cor_botao_perigo,
        fonte_base: data?.fonte_base || defaultTheme.fonte_base,
        tamanho_fonte_base: data?.tamanho_fonte_base || defaultTheme.tamanho_fonte_base,
        tamanho_logo: data?.tamanho_logo || defaultTheme.tamanho_logo,
        raio_borda: data?.raio_borda || defaultTheme.raio_borda,
        largura_container: data?.largura_container || defaultTheme.largura_container,
        exibir_subtitulo_empresa:
          data?.exibir_subtitulo_empresa ?? defaultTheme.exibir_subtitulo_empresa,
        layout_compacto: data?.layout_compacto ?? defaultTheme.layout_compacto,
      };

      setTheme(normalized);
      applyThemeToCssVars(normalized);
    } catch {
      setTheme(defaultTheme);
      applyThemeToCssVars(defaultTheme);
    }
  }

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        await refreshTheme();
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      loading,
      refreshTheme,
    }),
    [theme, loading]
  );

  return (
    <SystemThemeContext.Provider value={value}>
      {children}
    </SystemThemeContext.Provider>
  );
}

export function useSystemTheme() {
  const context = useContext(SystemThemeContext);

  if (!context) {
    throw new Error("useSystemTheme deve ser usado dentro de SystemThemeProvider");
  }

  return context;
}