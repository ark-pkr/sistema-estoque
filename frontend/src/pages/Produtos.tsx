import { useEffect, useMemo, useState } from "react";
import {
  PackageSearch,
  RefreshCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Produto = {
  id: number;
  codigo: string;
  nome: string;
  categoria?: number | null;
  categoria_nome?: string;
  fornecedor?: number | null;
  fornecedor_nome?: string;
  marca?: string;
  unidade?: string;
  preco_custo?: number | string;
  preco_venda?: number | string;
  estoque_atual?: number | string;
  estoque_minimo?: number | string;
  ativo?: boolean;
};

type FeedbackType = "success" | "error" | "warning" | "info";

export default function Produtos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtroUrl = searchParams.get("filtro") || "";

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState<{
    type: FeedbackType;
    message: string;
  }>({
    type: "info",
    message: "",
  });

  function toNumber(value: unknown) {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(String(value).replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function formatMoney(value: unknown) {
    const number = toNumber(value);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getStatus(item: Produto) {
    const atual = toNumber(item.estoque_atual);
    const minimo = toNumber(item.estoque_minimo);

    if (atual <= 0) return "sem_estoque";
    if (atual <= minimo) return "estoque_baixo";
    return "normal";
  }

  function aplicarFiltroAutomatico(lista: Produto[]) {
    let resultado = [...lista];

    if (filtroUrl === "estoque_baixo") {
      resultado = resultado.filter((item) => getStatus(item) === "estoque_baixo");
    } else if (filtroUrl === "sem_estoque") {
      resultado = resultado.filter((item) => getStatus(item) === "sem_estoque");
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter((item) => {
        const codigo = (item.codigo || "").toLowerCase();
        const nome = (item.nome || "").toLowerCase();
        const categoria = (item.categoria_nome || "").toLowerCase();
        const fornecedor = (item.fornecedor_nome || "").toLowerCase();
        const marca = (item.marca || "").toLowerCase();

        return (
          codigo.includes(termo) ||
          nome.includes(termo) ||
          categoria.includes(termo) ||
          fornecedor.includes(termo) ||
          marca.includes(termo)
        );
      });
    }

    return resultado;
  }

  async function carregarProdutos() {
    setLoading(true);
    setFeedback({ type: "info", message: "" });

    try {
      const response = await api.get("/produtos/");
      const lista = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setProdutos(lista);
      setProdutosFiltrados(aplicarFiltroAutomatico(lista));
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível carregar os produtos.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    setProdutosFiltrados(aplicarFiltroAutomatico(produtos));
  }, [produtos, filtroUrl, busca]);

  function limparFiltroUrl() {
    const next = new URLSearchParams(searchParams);
    next.delete("filtro");
    setSearchParams(next);
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir este produto?");
    if (!confirmar) return;

    try {
      await api.delete(`/produtos/${id}/`);

      setFeedback({
        type: "success",
        message: "Produto excluído com sucesso.",
      });

      await carregarProdutos();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.detail ||
          "Não foi possível excluir o produto.",
      });
    }
  }

  const resumo = useMemo(() => {
    return {
      total: produtos.length,
      normal: produtos.filter((item) => getStatus(item) === "normal").length,
      estoque_baixo: produtos.filter((item) => getStatus(item) === "estoque_baixo").length,
      sem_estoque: produtos.filter((item) => getStatus(item) === "sem_estoque").length,
    };
  }, [produtos]);

  return (
    <MainLayout
      title="Produtos"
      subtitle="Visualizar, pesquisar e gerenciar os produtos cadastrados"
    >
      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <section style={styles.topBar}>
        <div style={styles.searchWrap}>
          <Search size={16} />
          <input
            style={styles.searchInput}
            placeholder="Buscar por nome, código, marca ou fornecedor"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={styles.topButtons}>
          <button style={styles.reloadButton} onClick={carregarProdutos} disabled={loading}>
            <RefreshCcw size={16} />
            {loading ? "Carregando..." : "Recarregar"}
          </button>

          <button style={styles.primaryButton} onClick={() => navigate("/produtos/cadastrar")}>
            <PackageSearch size={16} />
            Novo Produto
          </button>
        </div>
      </section>

      {filtroUrl ? (
        <div style={styles.filterInfo}>
          <div>
            Filtro ativo:{" "}
            <strong>
              {filtroUrl === "estoque_baixo"
                ? "Produtos com estoque baixo"
                : filtroUrl === "sem_estoque"
                ? "Produtos sem estoque"
                : filtroUrl}
            </strong>
          </div>

          <button type="button" style={styles.clearFilterButton} onClick={limparFiltroUrl}>
            <XCircle size={15} />
            Limpar filtro
          </button>
        </div>
      ) : null}

      <section style={styles.cardsGrid}>
        <article style={styles.card}>
          <span style={styles.cardLabel}>Total de produtos</span>
          <strong style={styles.cardValue}>{resumo.total}</strong>
        </article>

        <article style={styles.card}>
          <span style={styles.cardLabel}>Produtos normais</span>
          <strong style={styles.cardValue}>{resumo.normal}</strong>
        </article>

        <article style={{ ...styles.card, ...styles.warningCard }}>
          <span style={styles.cardLabel}>Estoque baixo</span>
          <strong style={styles.cardValue}>{resumo.estoque_baixo}</strong>
        </article>

        <article style={{ ...styles.card, ...styles.dangerCard }}>
          <span style={styles.cardLabel}>Sem estoque</span>
          <strong style={styles.cardValue}>{resumo.sem_estoque}</strong>
        </article>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Lista de Produtos</h2>
            <p style={styles.panelSubtitle}>
              Acompanhe situação de estoque, fornecedor e status.
            </p>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Marca</th>
                <th>Unidade</th>
                <th>Preço</th>
                <th>Estoque atual</th>
                <th>Estoque mínimo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr key={item.id}>
                      <td>{item.codigo || "-"}</td>
                      <td>{item.nome || "-"}</td>
                      <td>{item.categoria_nome || "-"}</td>
                      <td>{item.fornecedor_nome || "-"}</td>
                      <td>{item.marca || "-"}</td>
                      <td>{item.unidade || "-"}</td>
                      <td>{formatMoney(item.preco_venda)}</td>
                      <td>{toNumber(item.estoque_atual).toLocaleString("pt-BR")}</td>
                      <td>{toNumber(item.estoque_minimo).toLocaleString("pt-BR")}</td>
                      <td>
                        {status === "normal" ? (
                          <span style={styles.legendTagNormal}>Normal</span>
                        ) : status === "estoque_baixo" ? (
                          <span style={styles.legendTagWarning}>Estoque baixo</span>
                        ) : (
                          <span style={styles.legendTagDanger}>Sem estoque</span>
                        )}
                      </td>
                      <td>
                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={styles.editButton}
                            onClick={() => navigate(`/produtos/editar/${item.id}`)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            style={styles.deleteButton}
                            onClick={() => excluirProduto(item.id)}
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} style={styles.emptyCell}>
                    Nenhum produto encontrado.
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
  topButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
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
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--brand-primary, #2563eb)",
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
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  card: {
    background: "var(--brand-card, #ffffff)",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  },
  warningCard: {
    background: "#fff7ed",
    border: "1px solid #fdba74",
  },
  dangerCard: {
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
  panel: {
    background: "var(--brand-card, #ffffff)",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  },
  panelHeader: {
    marginBottom: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
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
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  editButton: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  legendTagNormal: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "12px",
  },
  legendTagWarning: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#ffedd5",
    color: "#c2410c",
    fontWeight: 700,
    fontSize: "12px",
  },
  legendTagDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: "12px",
  },
  emptyCell: {
    textAlign: "center",
    padding: "22px",
    color: "#64748b",
  },
};