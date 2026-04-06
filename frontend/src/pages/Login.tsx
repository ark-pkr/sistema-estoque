import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSystemTheme } from "../context/SystemThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const { theme } = useSystemTheme();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email.trim()) {
      setErro("Informe seu e-mail ou usuário.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return;
    }

    setEnviando(true);

    try {
      const result = await login({
        email: email.trim(),
        senha,
      });

      if (!result.success) {
        setErro(result.message || "Não foi possível fazer login.");
        return;
      }

      navigate("/", { replace: true });
    } finally {
      setEnviando(false);
    }
  }

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${theme.cor_secundaria} 0%, ${theme.cor_primaria} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box",
    },
    card: {
      width: "100%",
      maxWidth: "460px",
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(255,255,255,0.35)",
      borderRadius: "28px",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
      padding: "30px",
      backdropFilter: "blur(10px)",
    },
    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      marginBottom: "22px",
    },
    logo: {
      width: "64px",
      height: "64px",
      objectFit: "contain",
      background: "#ffffff",
      borderRadius: "18px",
      padding: "6px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
      flexShrink: 0,
    },
    logoFallback: {
      width: "64px",
      height: "64px",
      borderRadius: "18px",
      background: `${theme.cor_primaria}18`,
      color: theme.cor_primaria,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
      fontSize: "24px",
      border: "1px solid #dbeafe",
      flexShrink: 0,
    },
    brandText: {
      minWidth: 0,
    },
    title: {
      margin: 0,
      fontSize: "30px",
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    subtitle: {
      margin: "8px 0 0",
      color: "#64748b",
      fontSize: "15px",
    },
    form: {
      display: "grid",
      gap: "16px",
      marginTop: "18px",
    },
    fieldWrap: {
      display: "grid",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#334155",
    },
    inputShell: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      border: "1px solid #cbd5e1",
      borderRadius: "16px",
      background: "#fff",
      padding: "0 14px",
      minHeight: "54px",
      transition: "0.2s ease",
    },
    input: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      padding: "14px 0",
      fontSize: "15px",
      color: "#0f172a",
    },
    toggleButton: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#64748b",
      padding: 0,
    },
    errorBox: {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
      borderRadius: "14px",
      padding: "12px 14px",
      fontWeight: 600,
      fontSize: "14px",
    },
    submitButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      width: "100%",
      minHeight: "54px",
      borderRadius: "16px",
      border: "none",
      background: theme.cor_primaria,
      color: "#fff",
      fontWeight: 800,
      fontSize: "15px",
      cursor: "pointer",
      boxShadow: "0 14px 28px rgba(37, 99, 235, 0.22)",
      marginTop: "4px",
    },
    footerText: {
      marginTop: "18px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "13px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandWrap}>
          {theme.logo_url ? (
            <img src={theme.logo_url} alt="Logo da empresa" style={styles.logo} />
          ) : (
            <div style={styles.logoFallback}>E</div>
          )}

          <div style={styles.brandText}>
            <h1 style={styles.title}>{theme.nome_sistema || "Sistema de Estoque"}</h1>
            <p style={styles.subtitle}>
              Acesse sua conta para continuar no painel administrativo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>E-mail ou usuário</label>
            <div style={styles.inputShell}>
              <Mail size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Digite seu e-mail ou usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputShell}>
              <Lock size={18} color="#64748b" />
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                style={styles.toggleButton}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro ? <div style={styles.errorBox}>{erro}</div> : null}

          <button type="submit" style={styles.submitButton} disabled={enviando}>
            <LogIn size={18} />
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.footerText}>
          Use suas credenciais cadastradas no sistema.
        </div>
      </div>
    </div>
  );
}