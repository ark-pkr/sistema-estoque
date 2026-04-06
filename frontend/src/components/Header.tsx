import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <header style={styles.header}>
      <h2 style={styles.logo}>Sistema de Estoque</h2>

      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/produtos" style={styles.link}>Produtos</Link>
        <Link to="/fornecedores" style={styles.link}>Fornecedores</Link>
        <Link to="/movimentacoes" style={styles.link}>Movimentações</Link>
        <Link to="/importar" style={styles.link}>Importar</Link>

        <button onClick={handleLogout} style={styles.button}>
          Sair
        </button>
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "#1f2937",
    color: "#fff",
    flexWrap: "wrap",
    gap: "12px",
  },
  logo: {
    margin: 0,
    fontSize: "22px",
  },
  nav: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 500,
  },
  button: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};