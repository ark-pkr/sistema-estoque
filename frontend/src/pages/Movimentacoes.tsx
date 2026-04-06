import { useEffect, useMemo, useState } from "react";
import {  RefreshCcw, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Produto = {
  id: number;
  nome: string;
  codigo: string;
};

type Movimentacao = {
  id: number;
  produto?: number | null;
  produto_nome?: string;
  tipo: string;
  quantidade: number | string;
  motivo?: string;
  observacao?: string;
  usuario_nome?: string;
  data?: string;
};


export default function Movimentacoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipoUrl = (searchParams.get("tipo") || "").toUpperCase();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<Movimentacao[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    produto: "",
    tipo: "REPOSICAO",
    quantidade: "",
    motivo: "Reposição de estoque",
    observacao: "",
  });

  const [salvando, setSalvando] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function formatDate(value?: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pt-BR");
  }

  function aplicarFiltros(lista: Movimentacao[]) {
    let resultado = [...lista];

    if (tipoUrl) {
      resultado = resultado.filter(
        (item) => (item.tipo || "").toUpperCase() === tipoUrl
      );
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();

      resultado = resultado.filter((item) => {
        const produto = (item.produto_nome || "").toLowerCase();
        const tipo = (item.tipo || "").toLowerCase();
        const motivo = (item.motivo || "").toLowerCase();
        const observacao = (item.observacao || "").toLowerCase();
        const usuario = (item.usuario_nome || "").toLowerCase();

        return (
          produto.includes(termo) ||
          tipo.includes(termo) ||
          motivo.includes(termo) ||
          observacao.includes(termo) ||
          usuario.includes(termo)
        );
      });
    }

    return resultado;
  }

async function carregarBase() {
  setLoading(true);
  setFeedback({ type: "info", message: "" });

  try {
    const [produtosRes, movimentacoesRes] = await Promise.all([
      api.get("/produtos/"),
      api.get("/movimentacoes/"),
    ]);

    const produtosLista = Array.isArray(produtosRes.data)
      ? produtosRes.data
      : produtosRes.data?.results || [];

    const movimentacoesLista = Array.isArray(movimentacoesRes.data)
      ? movimentacoesRes.data
      : movimentacoesRes.data?.results || [];

    setProdutos(produtosLista);
    setMovimentacoes(movimentacoesLista);
    setMovimentacoesFiltradas(aplicarFiltros(movimentacoesLista));
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    setFeedback({
      type: "error",
      message:
        data?.detail ||
        data?.erro ||
        data?.message ||
        `Não foi possível carregar as movimentações.${status ? ` (${status})` : ""}`,
    });

    console.error("Erro ao carregar movimentações:", data || error);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    carregarBase();
  }, []);

  useEffect(() => {
    setMovimentacoesFiltradas(aplicarFiltros(movimentacoes));
  }, [movimentacoes, tipoUrl, busca]);

  function limparFiltroTipo() {
    const next = new URLSearchParams(searchParams);
    next.delete("tipo");
    setSearchParams(next);
  }

  function limparFormulario() {
    setForm({
      produto: "",
      tipo: "REPOSICAO",
      quantidade: "",
      motivo: "Reposição de estoque",
      observacao: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.produto) {
      setFeedback({ type: "warning", message: "Selecione um produto." });
      return;
    }

    const quantidade = Number(String(form.quantidade).replace(",", "."));
    if (!quantidade || quantidade <= 0) {
      setFeedback({ type: "warning", message: "Informe uma quantidade válida." });
      return;
    }

    setSalvando(true);
    setFeedback({ type: "info", message: "" });

    try {
      if (form.tipo === "REPOSICAO") {
        await api.post(`/produtos/${form.produto}/repor-estoque/`, {
          quantidade,
          motivo: form.motivo,
          observacao: form.observacao,
        });
      } else {
        await api.post("/movimentacoes/", {
          produto: Number(form.produto),
          tipo: form.tipo,
          quantidade,
          motivo: form.motivo,
          observacao: form.observacao,
        });
      }

      setFeedback({
        type: "success",
        message: "Movimentação registrada com sucesso.",
      });

      limparFormulario();
      await carregarBase();
    } catch (error: any) {
      const data = error?.response?.data;
      setFeedback({
        type: "error",
        message:
          data?.detail ||
          data?.erro ||
          data?.quantidade?.[0] ||
          data?.produto?.[0] ||
          "Não foi possível registrar a movimentação.",
      });
    } finally {
      setSalvando(false);
    }
  }

  const resumo = useMemo(() => {
    const entradas = movimentacoes.filter(
      (item) => ["ENTRADA", "REPOSICAO"].includes((item.tipo || "").toUpperCase())
    ).length;

    const saidas = movimentacoes.filter(
      (item) => (item.tipo || "").toUpperCase() === "SAIDA"
    ).length;

    return {
      total: movimentacoes.length,
      entradas,
      saidas,
    };
  }, [movimentacoes]);

  return (
    <MainLayout
      title="Movimentações"
      subtitle="Acompanhe entradas, saídas, ajustes e reposições do estoque"
    >
      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <section style={styles.formCard}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Nova Movimentação</h2>
          <p style={styles.panelSubtitle}>
            Use “Reposição” para aumentar o estoque sem editar o produto.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <select
            style={styles.input}
            value={form.produto}
            onChange={(e) => setForm((prev) => ({ ...prev, produto: e.target.value }))}
          >
            <option value="">Selecione o produto</option>
            {produtos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.codigo} - {item.nome}
              </option>
            ))}
          </select>

          <select
            style={styles.input}
            value={form.tipo}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                tipo: e.target.value,
                motivo:
                  e.target.value === "REPOSICAO"
                    ? "Reposição de estoque"
                    : prev.motivo,
              }))
            }
          >
            <option value="REPOSICAO">Reposição</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="AJUSTE">Ajuste</option>
          </select>

          <input
            style={styles.input}
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={(e) => setForm((prev) => ({ ...prev, quantidade: e.target.value }))}
          />

          <input
            style={styles.input}
            placeholder="Motivo"
            value={form.motivo}
            onChange={(e) => setForm((prev) => ({ ...prev, motivo: e.target.value }))}
          />

          <input
            style={styles.input}
            placeholder="Observação"
            value={form.observacao}
            onChange={(e) => setForm((prev) => ({ ...prev, observacao: e.target.value }))}
          />

          <button type="submit" style={styles.primaryButton} disabled={salvando}>
            {salvando ? "Salvando..." : "Registrar movimentação"}
          </button>
        </form>
      </section>

      <section style={styles.topBar}>
        <div style={styles.searchWrap}>
          <Search size={16} />
          <input
            style={styles.searchInput}
            placeholder="Buscar por produto, tipo, motivo ou usuário"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button style={styles.reloadButton} onClick={carregarBase} disabled={loading}>
          <RefreshCcw size={16} />
          {loading ? "Carregando..." : "Recarregar"}
        </button>
      </section>

      {tipoUrl ? (
        <div style={styles.filterInfo}>
          <div>
            Filtro ativo: <strong>{tipoUrl}</strong>
          </div>

          <button type="button" style={styles.clearFilterButton} onClick={limparFiltroTipo}>
            Limpar filtro
          </button>
        </div>
      ) : null}

      <section style={styles.cardsGrid}>
        <article style={styles.card}>
          <span style={styles.cardLabel}>Total</span>
          <strong style={styles.cardValue}>{resumo.total}</strong>
        </article>

        <article style={{ ...styles.card, ...styles.entryCard }}>
          <span style={styles.cardLabel}>Entradas / reposições</span>
          <strong style={styles.cardValue}>{resumo.entradas}</strong>
        </article>

        <article style={{ ...styles.card, ...styles.exitCard }}>
          <span style={styles.cardLabel}>Saídas</span>
          <strong style={styles.cardValue}>{resumo.saidas}</strong>
        </article>
      </section>

      <section style={styles.quickFilters}>
        <button
          type="button"
          style={styles.quickFilterButton}
          onClick={() => setSearchParams({ tipo: "REPOSICAO" })}
        >
          <TrendingUp size={15} />
          Ver reposições
        </button>

        <button
          type="button"
          style={styles.quickFilterButton}
          onClick={() => setSearchParams({ tipo: "ENTRADA" })}
        >
          <TrendingUp size={15} />
          Ver entradas
        </button>

        <button
          type="button"
          style={styles.quickFilterButton}
          onClick={() => setSearchParams({ tipo: "SAIDA" })}
        >
          <TrendingDown size={15} />
          Ver saídas
        </button>

        <button
          type="button"
          style={styles.quickFilterButtonSecondary}
          onClick={limparFiltroTipo}
        >
          Todas
        </button>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Histórico de Movimentações</h2>
          <p style={styles.panelSubtitle}>
            Registro completo das alterações de estoque.
          </p>
        </div>

        <div style={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Motivo</th>
                <th>Observação</th>
                <th>Usuário</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoesFiltradas.length > 0 ? (
                movimentacoesFiltradas.map((item) => {
                  const tipo = (item.tipo || "").toUpperCase();

                  return (
                    <tr key={item.id}>
                      <td>{item.produto_nome || "-"}</td>
                      <td>
                        {tipo === "ENTRADA" ? (
                          <span style={styles.entryTag}>ENTRADA</span>
                        ) : tipo === "REPOSICAO" ? (
                          <span style={styles.reposicaoTag}>REPOSIÇÃO</span>
                        ) : tipo === "SAIDA" ? (
                          <span style={styles.exitTag}>SAÍDA</span>
                        ) : (
                          <span style={styles.neutralTag}>{tipo || "-"}</span>
                        )}
                      </td>
                      <td>{item.quantidade}</td>
                      <td>{item.motivo || "-"}</td>
                      <td>{item.observacao || "-"}</td>
                      <td>{item.usuario_nome || "-"}</td>
                      <td>{formatDate(item.data)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={styles.emptyCell}>
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  formCard: {
    background: "var(--brand-card, #ffffff)",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
    marginBottom: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(150px, 1fr))",
    gap: "12px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  primaryButton: {
    background: "var(--brand-primary, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "0 14px",
    minWidth: "320px",
    flex: 1,
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    padding: "14px 0",
    fontSize: "15px",
  },
  reloadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#475569",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  filterInfo: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  clearFilterButton: {
    background: "transparent",
    border: "none",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: "var(--brand-card, #ffffff)",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  },
  entryCard: {
    background: "#ecfdf5",
    border: "1px solid #86efac",
  },
  exitCard: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
  },
  cardLabel: {
    display: "block",
    color: "#64748b",
    marginBottom: "8px",
    fontWeight: 600,
  },
  cardValue: {
    fontSize: "28px",
    color: "#0f172a",
  },
  quickFilters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  quickFilterButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--brand-primary, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  quickFilterButtonSecondary: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  panel: {
    background: "var(--brand-card, #ffffff)",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  },
  panelHeader: {
    marginBottom: "14px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 800,
    color: "#0f172a",
  },
  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  tableWrap: {
    overflowX: "auto",
    overflowY: "hidden",
  },
  entryTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "12px",
  },
  reposicaoTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "12px",
  },
  exitTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: "12px",
  },
  neutralTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e2e8f0",
    color: "#334155",
    fontWeight: 700,
    fontSize: "12px",
  },
  emptyCell: {
    textAlign: "center",
    padding: "22px",
    color: "#64748b",
  },
};