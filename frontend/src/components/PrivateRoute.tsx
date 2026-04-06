import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <h2 style={styles.title}>Carregando sessão</h2>
          <p style={styles.text}>Verificando suas credenciais de acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.ativo === false) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Acesso indisponível</h2>
          <p style={styles.text}>
            Sua conta está inativa no sistema. Fale com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--brand-bg, #eef2f7)",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    padding: "28px",
    textAlign: "center",
  },
  spinner: {
    width: "42px",
    height: "42px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid var(--brand-primary, #2563eb)",
    borderRadius: "999px",
    margin: "0 auto 18px",
    animation: "spin 0.9s linear infinite",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "24px",
    fontWeight: 900,
    color: "#0f172a",
  },
  text: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },
};