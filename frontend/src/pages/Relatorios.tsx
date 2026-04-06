import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCcw,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import FeedbackMessage from "../components/FeedbackMessage";
import { api } from "../services/api";

type Categoria = {
  id: number;
  nome: string;
};

type Fornecedor = {
  id: number;
  nome: string;
};

type RelatorioItem = {
  codigo: string;
  nome: string;
  categoria: string;
  fornecedor: string;
  marca: string;
  unidade: string;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  status: string;
};

export default function Relatorios() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [dados, setDados] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [busca, setBusca] = useState("");

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function buildParams(formato = "json") {
    const params = new URLSearchParams();

    if (status) params.append("status", status);
    if (categoria) params.append("categoria", categoria);
    if (fornecedor) params.append("fornecedor", fornecedor);
    if (busca) params.append("busca", busca);
    if (formato) params.append("formato", formato);

    return params.toString();
  }

  async function carregarFiltros() {
    try {
      const [categoriasRes, fornecedoresRes] = await Promise.all([
        api.get("/categorias/"),
        api.get("/fornecedores/"),
      ]);

      const categoriasData = Array.isArray(categoriasRes.data)
        ? categoriasRes.data
        : categoriasRes.data?.results || [];

      const fornecedoresData = Array.isArray(fornecedoresRes.data)
        ? fornecedoresRes.data
        : fornecedoresRes.data?.results || [];

      setCategorias(categoriasData);
      setFornecedores(fornecedoresData);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível carregar os filtros dos relatórios.",
      });
    }
  }

  async function carregarRelatorio() {
    setLoading(true);
    setFeedback({ type: "info", message: "" });

    try {
      const response = await api.get(`/relatorios/estoque/?${buildParams("json")}`);
      setDados(response.data?.results || []);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível carregar o relatório.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function baixarArquivo(formato: "pdf" | "xlsx") {
    try {
      const response = await api.get(`/relatorios/estoque/?${buildParams(formato)}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        formato === "pdf" ? "relatorio_estoque.pdf" : "relatorio_estoque.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setFeedback({
        type: "error",
        message: `Não foi possível gerar o arquivo ${formato.toUpperCase()}.`,
      });
    }
  }

  function limparFiltros() {
    setStatus("");
    setCategoria("");
    setFornecedor("");
    setBusca("");
  }

  useEffect(() => {
    carregarFiltros();
    carregarRelatorio();
  }, []);

  return (
    <MainLayout
      title="Central de Relatórios"
      subtitle="Gere relatórios do sistema em PDF e Excel"
    >
      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <section style={styles.filtersCard}>
        <div style={styles.filtersHeader}>
          <h2 style={styles.sectionTitle}>Relatório de Estoque</h2>
          <div style={styles.filtersActions}>
            <button style={styles.reloadButton} onClick={carregarRelatorio} disabled={loading}>
              <RefreshCcw size={16} />
              Atualizar
            </button>

            <button style={styles.pdfButton} onClick={() => baixarArquivo("pdf")}>
              <FileText size={16} />
              Gerar PDF
            </button>

            <button style={styles.excelButton} onClick={() => baixarArquivo("xlsx")}>
              <FileSpreadsheet size={16} />
              Gerar Excel
            </button>
          </div>
        </div>

        <div style={styles.filtersGrid}>
          <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="normal">Normal</option>
            <option value="estoque_baixo">Estoque baixo</option>
            <option value="sem_estoque">Sem estoque</option>
          </select>

          <select style={styles.input} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>

          <select style={styles.input} value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}>
            <option value="">Todos os fornecedores</option>
            {fornecedores.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={styles.inlineActions}>
          <button style={styles.filterButton} onClick={carregarRelatorio}>
            <Filter size={16} />
            Aplicar filtros
          </button>

          <button style={styles.clearButton} onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>
      </section>

      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Pré-visualização do relatório</h3>
          <span style={styles.countBadge}>{dados.length} registros</span>
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
                <th>Un.</th>
                <th>Preço</th>
                <th>Atual</th>
                <th>Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dados.length > 0 ? (
                dados.map((item, index) => (
                  <tr key={`${item.codigo}-${index}`}>
                    <td>{item.codigo}</td>
                    <td>{item.nome}</td>
                    <td>{item.categoria}</td>
                    <td>{item.fornecedor}</td>
                    <td>{item.marca}</td>
                    <td>{item.unidade}</td>
                    <td>
                      {Number(item.preco_venda || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td>{Number(item.estoque_atual || 0).toLocaleString("pt-BR")}</td>
                    <td>{Number(item.estoque_minimo || 0).toLocaleString("pt-BR")}</td>
                    <td>
                      {item.status === "Normal" ? (
                        <span style={styles.tagNormal}>Normal</span>
                      ) : item.status === "Estoque baixo" ? (
                        <span style={styles.tagWarning}>Estoque baixo</span>
                      ) : (
                        <span style={styles.tagDanger}>Sem estoque</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    Nenhum dado encontrado para os filtros informados.
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
  filtersCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
    marginBottom: "18px",
  },
  filtersHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "16px",
    alignItems: "center",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  filtersActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "14px",
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
  inlineActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  filterButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--brand-primary, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  clearButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  reloadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#475569",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  pdfButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  excelButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#15803d",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  tableCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  tableTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
  },
  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "8px 12px",
    fontWeight: 700,
    fontSize: "13px",
  },
  tableWrap: {
    overflowX: "auto",
    overflowY: "hidden",
  },
  tagNormal: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "12px",
  },
  tagWarning: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#ffedd5",
    color: "#c2410c",
    fontWeight: 700,
    fontSize: "12px",
  },
  tagDanger: {
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