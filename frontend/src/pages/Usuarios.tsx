import { useEffect, useState } from "react";
import { Pencil, RotateCcw, Search, UserCog } from "lucide-react";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Usuario = {
  id: number;
  nome: string;
  username: string;
  email: string;
  tipo: string;
  ativo: boolean;
};

const initialForm = {
  nome: "",
  username: "",
  email: "",
  tipo: "vendedor",
  ativo: true,
  senha: "",
  confirmar_senha: "",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function limparFeedback() {
    setFeedback({ type: "info", message: "" });
  }

  async function carregarUsuarios() {
    try {
      const response = await api.get("/usuarios/");
      const dados = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setUsuarios(dados);
      setUsuariosFiltrados(dados);
    } catch {
      setFeedback({
        type: "error",
        message: "Erro ao carregar usuários.",
      });
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (!busca.trim()) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    const termo = busca.toLowerCase();
    setUsuariosFiltrados(
      usuarios.filter(
        (u) =>
          u.nome.toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo) ||
          u.tipo.toLowerCase().includes(termo)
      )
    );
  }, [busca, usuarios]);

  function limparFormulario() {
    setForm(initialForm);
    setEditandoId(null);
  }

  function preencherFormulario(usuario: Usuario) {
    setEditandoId(usuario.id);
    setForm({
      nome: usuario.nome,
      username: usuario.username,
      email: usuario.email,
      tipo: usuario.tipo,
      ativo: usuario.ativo,
      senha: "",
      confirmar_senha: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    limparFeedback();
    setLoading(true);

    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}/`, form);
        setFeedback({
          type: "success",
          message: "Usuário atualizado com sucesso.",
        });
      } else {
        await api.post("/usuarios/", form);
        setFeedback({
          type: "success",
          message: "Usuário cadastrado com sucesso.",
        });
      }

      limparFormulario();
      await carregarUsuarios();
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.detail ||
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.senha?.[0] ||
        error?.response?.data?.confirmar_senha?.[0] ||
        "Erro ao salvar usuário.";

      setFeedback({
        type: "error",
        message: mensagem,
      });
    } finally {
      setLoading(false);
    }
  }

  async function alternarStatus(usuario: Usuario) {
    try {
      await api.post(`/usuarios/${usuario.id}/alternar-status/`);
      await carregarUsuarios();
      setFeedback({
        type: "success",
        message: "Status do usuário atualizado com sucesso.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Erro ao alterar status do usuário.",
      });
    }
  }

  return (
    <MainLayout
      title="Usuários"
      subtitle="Cadastre e gerencie os perfis de acesso do sistema"
    >
      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.sectionTitle}>
              {editandoId ? "Editar usuário" : "Novo usuário"}
            </h2>

            {editandoId ? (
              <button type="button" style={styles.cancelButton} onClick={limparFormulario}>
                <RotateCcw size={16} />
                Cancelar
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={styles.input}
              required
            />

            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={styles.input}
              required
            />

            <input
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />

            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              style={styles.input}
            >
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="estoquista">Estoquista</option>
              <option value="vendedor">Vendedor</option>
            </select>

            <input
              type="password"
              placeholder={editandoId ? "Nova senha (opcional)" : "Senha"}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              style={styles.input}
            />

            <input
              type="password"
              placeholder={editandoId ? "Confirmar nova senha" : "Confirmar senha"}
              value={form.confirmar_senha}
              onChange={(e) => setForm({ ...form, confirmar_senha: e.target.value })}
              style={styles.input}
            />

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Usuário ativo
            </label>

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? "Salvando..." : editandoId ? "Atualizar usuário" : "Cadastrar usuário"}
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.sectionTitle}>Lista de usuários</h2>
          </div>

          <div style={styles.searchWrap}>
            <Search size={16} />
            <input
              placeholder="Buscar por nome, e-mail ou perfil"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.tipo}</td>
                      <td>{usuario.ativo ? "Ativo" : "Inativo"}</td>
                      <td>
                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={styles.editButton}
                            onClick={() => preencherFormulario(usuario)}
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            type="button"
                            style={styles.statusButton}
                            onClick={() => alternarStatus(usuario)}
                          >
                            <UserCog size={14} />
                            {usuario.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={styles.emptyCell}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 430px) 1fr",
    gap: "18px",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    gap: "12px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  cancelButton: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  submitButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "0 12px",
    marginBottom: "14px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "760px",
    borderCollapse: "collapse",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  editButton: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statusButton: {
    background: "#475569",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  emptyCell: {
    textAlign: "center",
    padding: "18px",
    color: "#64748b",
  },
};