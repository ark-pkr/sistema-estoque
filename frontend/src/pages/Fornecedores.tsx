import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Building2,
  Phone,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Fornecedor = {
  id: number;
  nome: string;
  contato?: string;
  cidade?: string;
};

const initialForm = {
  nome: "",
  contato: "",
  cidade: "",
};

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<Fornecedor[]>([]);
  const [form, setForm] = useState(initialForm);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState<Fornecedor | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function limparFeedback() {
    setFeedback({ type: "info", message: "" });
  }

  async function carregarFornecedores() {
    try {
      const response = await api.get("/fornecedores/");
      const dados = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setFornecedores(dados);
      setFornecedoresFiltrados(dados);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.detail || "Erro ao carregar fornecedores.",
      });
    }
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    if (!busca.trim()) {
      setFornecedoresFiltrados(fornecedores);
      return;
    }

    const termo = busca.toLowerCase();

    const filtrados = fornecedores.filter((fornecedor) => {
      return (
        fornecedor.nome.toLowerCase().includes(termo) ||
        (fornecedor.contato || "").toLowerCase().includes(termo) ||
        (fornecedor.cidade || "").toLowerCase().includes(termo)
      );
    });

    setFornecedoresFiltrados(filtrados);
  }, [busca, fornecedores]);

  function limparFormulario() {
    setForm(initialForm);
    setEditandoId(null);
  }

  function preencherFormulario(fornecedor: Fornecedor) {
    limparFeedback();
    setForm({
      nome: fornecedor.nome || "",
      contato: fornecedor.contato || "",
      cidade: fornecedor.cidade || "",
    });
    setEditandoId(fornecedor.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    limparFeedback();
    setLoading(true);

    try {
      if (editandoId) {
        await api.put(`/fornecedores/${editandoId}/`, form);
        setFeedback({
          type: "success",
          message: "Fornecedor atualizado com sucesso.",
        });
      } else {
        await api.post("/fornecedores/", form);
        setFeedback({
          type: "success",
          message: "Fornecedor cadastrado com sucesso.",
        });
      }

      limparFormulario();
      await carregarFornecedores();
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.detail ||
        error?.response?.data?.nome?.[0] ||
        "Erro ao salvar fornecedor.";

      setFeedback({
        type: "error",
        message: mensagem,
      });
    } finally {
      setLoading(false);
    }
  }

  function abrirModalExclusao(fornecedor: Fornecedor) {
    limparFeedback();
    setFornecedorParaExcluir(fornecedor);
  }

  function fecharModalExclusao() {
    if (excluindo) return;
    setFornecedorParaExcluir(null);
  }

  async function confirmarExclusaoFornecedor() {
    if (!fornecedorParaExcluir) return;

    setExcluindo(true);
    limparFeedback();

    try {
      await api.delete(`/fornecedores/${fornecedorParaExcluir.id}/`);
      await carregarFornecedores();

      setFeedback({
        type: "success",
        message: "Fornecedor excluído com sucesso.",
      });

      if (editandoId === fornecedorParaExcluir.id) {
        limparFormulario();
      }

      setFornecedorParaExcluir(null);
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.detail ||
        "Não foi possível excluir o fornecedor. Ele pode estar vinculado a produtos.";

      setFeedback({
        type: "error",
        message: mensagem,
      });
    } finally {
      setExcluindo(false);
    }
  }

  function limparBusca() {
    setBusca("");
  }

  const resumo = useMemo(() => {
    return {
      total: fornecedores.length,
      exibidos: fornecedoresFiltrados.length,
      comContato: fornecedores.filter((f) => !!f.contato?.trim()).length,
      comCidade: fornecedores.filter((f) => !!f.cidade?.trim()).length,
    };
  }, [fornecedores, fornecedoresFiltrados]);

  return (
    <MainLayout
      title="Fornecedores"
      subtitle="Cadastre, edite e gerencie os fornecedores do sistema"
    >
      <div style={styles.pageScroller}>
        <FeedbackMessage type={feedback.type} message={feedback.message} />

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <Truck size={18} />
              </span>
              <span style={styles.cardLabel}>Total de fornecedores</span>
            </div>
            <strong style={styles.cardValue}>{resumo.total}</strong>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <Search size={18} />
              </span>
              <span style={styles.cardLabel}>Exibidos na busca</span>
            </div>
            <strong style={styles.cardValue}>{resumo.exibidos}</strong>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <Phone size={18} />
              </span>
              <span style={styles.cardLabel}>Com contato</span>
            </div>
            <strong style={styles.cardValue}>{resumo.comContato}</strong>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <Building2 size={18} />
              </span>
              <span style={styles.cardLabel}>Com cidade</span>
            </div>
            <strong style={styles.cardValue}>{resumo.comCidade}</strong>
          </div>
        </div>

        <div style={styles.gridLayout}>
          <section style={styles.formSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                {editandoId ? "Editar fornecedor" : "Cadastrar fornecedor"}
              </h2>

              {editandoId && (
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={limparFormulario}
                >
                  <RotateCcw size={16} />
                  Cancelar edição
                </button>
              )}
            </div>

            <div style={styles.formCard}>
              <form onSubmit={handleSubmit} style={styles.formGrid}>
                <input
                  placeholder="Nome do fornecedor"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  style={styles.input}
                  required
                />

                <input
                  placeholder="Contato"
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  style={styles.input}
                />

                <input
                  placeholder="Cidade"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  style={styles.input}
                />

                <div style={styles.buttonRow}>
                  <button type="submit" style={styles.submitButton} disabled={loading}>
                    {loading
                      ? "Salvando..."
                      : editandoId
                      ? "Atualizar Fornecedor"
                      : "Salvar Fornecedor"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section style={styles.listSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Lista de fornecedores</h2>
            </div>

            <div style={styles.searchBar}>
              <div style={styles.searchInputWrap}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nome, contato ou cidade"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <button type="button" style={styles.clearSearchButton} onClick={limparBusca}>
                Limpar
              </button>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Contato</th>
                      <th>Cidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresFiltrados.length > 0 ? (
                      fornecedoresFiltrados.map((fornecedor) => (
                        <tr key={fornecedor.id}>
                          <td>{fornecedor.id}</td>
                          <td style={styles.nameCell}>{fornecedor.nome}</td>
                          <td>{fornecedor.contato || "-"}</td>
                          <td>{fornecedor.cidade || "-"}</td>
                          <td>
                            <div style={styles.actions}>
                              <button
                                type="button"
                                style={styles.editButton}
                                onClick={() => preencherFormulario(fornecedor)}
                              >
                                <Pencil size={14} />
                                Editar
                              </button>
                              <button
                                type="button"
                                style={styles.deleteButton}
                                onClick={() => abrirModalExclusao(fornecedor)}
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={styles.emptyCell}>
                          Nenhum fornecedor encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!fornecedorParaExcluir}
        title="Excluir fornecedor"
        message={
          fornecedorParaExcluir
            ? `Tem certeza que deseja excluir o fornecedor "${fornecedorParaExcluir.nome}"?`
            : ""
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={excluindo}
        onConfirm={confirmarExclusaoFornecedor}
        onCancel={fecharModalExclusao}
      />
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageScroller: {
    maxHeight: "calc(100vh - 180px)",
    overflowY: "auto",
    paddingRight: "4px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  cardIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  cardValue: {
    fontSize: "28px",
    color: "#0f172a",
    fontWeight: 800,
  },
  gridLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 420px) 1fr",
    gap: "18px",
    alignItems: "start",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  listSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minWidth: 0,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  formCard: {
    background: "#fff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "20px",
    maxHeight: "680px",
    overflowY: "auto",
  },
  formGrid: {
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
  buttonRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  submitButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.18)",
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInputWrap: {
    flex: 1,
    minWidth: "280px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "0 12px",
    boxSizing: "border-box",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "15px",
  },
  clearSearchButton: {
    background: "#475569",
    color: "#fff",
    border: "none",
    padding: "11px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  tableCard: {
    background: "#fff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "12px",
    width: "100%",
    maxHeight: "680px",
    overflowY: "auto",
    minWidth: 0,
  },
  tableWrapper: {
    overflowX: "auto",
    overflowY: "visible",
    width: "100%",
  },
  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    background: "#fff",
  },
  nameCell: {
    fontWeight: 700,
    color: "#0f172a",
    minWidth: "220px",
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
  deleteButton: {
    background: "#dc2626",
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