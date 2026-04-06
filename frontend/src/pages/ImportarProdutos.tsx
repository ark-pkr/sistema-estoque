import { useEffect, useMemo, useState } from "react";
import {
  FileUp,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Upload,
} from "lucide-react";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Importacao = {
  id: number;
  arquivo?: string;
  tipo_arquivo?: string;
  status: string;
  total_registros?: number;
  observacao?: string;
  criado_em?: string;
};

export default function ImportarProdutos() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [historico, setHistorico] = useState<Importacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function limparFeedback() {
    setFeedback({ type: "info", message: "" });
  }

  async function carregarHistorico() {
    try {
      setLoadingHistorico(true);
      const response = await api.get("/importacoes/");
      const dados = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setHistorico(dados);
    } catch {
      setFeedback({
        type: "error",
        message: "Erro ao carregar histórico de importações.",
      });
    } finally {
      setLoadingHistorico(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function handleImportar(e: React.FormEvent) {
    e.preventDefault();
    limparFeedback();

    if (!arquivo) {
      setFeedback({
        type: "warning",
        message: "Selecione um arquivo antes de importar.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    try {
      setLoading(true);

      const response = await api.post("/importacoes/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFeedback({
        type: "success",
        message:
          response.data?.observacao ||
          response.data?.mensagem ||
          "Importação realizada com sucesso.",
      });

      setArquivo(null);
      const input = document.getElementById("arquivo-importacao") as HTMLInputElement | null;
      if (input) input.value = "";

      await carregarHistorico();
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.detail ||
        "Erro ao importar arquivo.";

      setFeedback({
        type: "error",
        message: mensagem,
      });
    } finally {
      setLoading(false);
    }
  }

  function tipoBadge(tipo?: string) {
    if (!tipo) return <span style={styles.badgeNeutro}>—</span>;
    if (tipo.toUpperCase() === "PDF") {
      return <span style={styles.badgePdf}>PDF</span>;
    }
    if (tipo.toUpperCase().includes("XLS") || tipo.toUpperCase() === "CSV") {
      return <span style={styles.badgePlanilha}>{tipo}</span>;
    }
    return <span style={styles.badgeNeutro}>{tipo}</span>;
  }

  function statusBadge(status: string) {
    if (status === "PROCESSADO") {
      return <span style={styles.badgeSucesso}>Processado</span>;
    }
    if (status === "ERRO") {
      return <span style={styles.badgeErro}>Erro</span>;
    }
    return <span style={styles.badgePendente}>Pendente</span>;
  }

  const resumo = useMemo(() => {
    let processados = 0;
    let erros = 0;
    let pendentes = 0;

    for (const item of historico) {
      if (item.status === "PROCESSADO") processados += 1;
      else if (item.status === "ERRO") erros += 1;
      else pendentes += 1;
    }

    return {
      total: historico.length,
      processados,
      erros,
      pendentes,
    };
  }, [historico]);

  return (
    <MainLayout
      title="Importar Produtos"
      subtitle="Envie planilhas ou PDFs para cadastrar produtos automaticamente"
    >
      <div style={styles.pageScroller}>
        <FeedbackMessage type={feedback.type} message={feedback.message} />

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <FileUp size={18} />
              </span>
              <span style={styles.cardLabel}>Total de importações</span>
            </div>
            <strong style={styles.cardValue}>{resumo.total}</strong>
          </div>

          <div style={styles.cardSuccess}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <CheckCircle2 size={18} />
              </span>
              <span style={styles.cardLabel}>Processadas</span>
            </div>
            <strong style={styles.cardValue}>{resumo.processados}</strong>
          </div>

          <div style={styles.cardDanger}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <AlertTriangle size={18} />
              </span>
              <span style={styles.cardLabel}>Com erro</span>
            </div>
            <strong style={styles.cardValue}>{resumo.erros}</strong>
          </div>

          <div style={styles.cardWarning}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <RefreshCw size={18} />
              </span>
              <span style={styles.cardLabel}>Pendentes</span>
            </div>
            <strong style={styles.cardValue}>{resumo.pendentes}</strong>
          </div>
        </div>

        <div style={styles.gridLayout}>
          <section style={styles.formSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Nova importação</h2>
            </div>

            <div style={styles.formCard}>
              <div style={styles.infoBox}>
                Formatos aceitos: <strong>.xlsx, .xls, .csv e .pdf</strong>.
                Para melhor precisão, prefira planilhas.
              </div>

              <form onSubmit={handleImportar} style={styles.formGrid}>
                <label htmlFor="arquivo-importacao" style={styles.fileLabel}>
                  <Upload size={18} />
                  <span>
                    {arquivo ? arquivo.name : "Selecionar arquivo para importar"}
                  </span>
                </label>

                <input
                  id="arquivo-importacao"
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setArquivo(file);
                  }}
                  style={styles.hiddenInput}
                />

                <div style={styles.tipBox}>
                  <div style={styles.tipRow}>
                    <FileSpreadsheet size={16} />
                    <span>Planilhas são mais confiáveis para importação em massa.</span>
                  </div>
                  <div style={styles.tipRow}>
                    <FileText size={16} />
                    <span>PDF funciona, mas pode exigir extração mais cuidadosa.</span>
                  </div>
                </div>

                <div style={styles.buttonRow}>
                  <button type="submit" style={styles.submitButton} disabled={loading}>
                    {loading ? "Importando..." : "Importar arquivo"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section style={styles.listSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Histórico de importações</h2>

              <button
                type="button"
                style={styles.refreshButton}
                onClick={carregarHistorico}
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Registros</th>
                      <th>Observação</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.length > 0 ? (
                      historico.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{tipoBadge(item.tipo_arquivo)}</td>
                          <td>{statusBadge(item.status)}</td>
                          <td>{item.total_registros ?? 0}</td>
                          <td>{item.observacao || "-"}</td>
                          <td>
                            {item.criado_em
                              ? new Date(item.criado_em).toLocaleString("pt-BR")
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={styles.emptyCell}>
                          {loadingHistorico
                            ? "Carregando histórico..."
                            : "Nenhuma importação encontrada."}
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
  cardSuccess: {
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #86efac",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  cardDanger: {
    background: "#fef2f2",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #fca5a5",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  cardWarning: {
    background: "#fff7ed",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #fdba74",
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
    gridTemplateColumns: "minmax(360px, 430px) 1fr",
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
  formCard: {
    background: "#fff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "20px",
    maxHeight: "680px",
    overflowY: "auto",
  },
  infoBox: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    marginBottom: "16px",
    lineHeight: 1.45,
  },
  formGrid: {
    display: "grid",
    gap: "14px",
  },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    border: "1px dashed #94a3b8",
    borderRadius: "14px",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: 700,
    color: "#0f172a",
  },
  hiddenInput: {
    display: "none",
  },
  tipBox: {
    display: "grid",
    gap: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px 16px",
  },
  tipRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#475569",
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
  refreshButton: {
    background: "#475569",
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
    minWidth: "980px",
    borderCollapse: "collapse",
    background: "#fff",
  },
  badgePdf: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    fontSize: "12px",
  },
  badgePlanilha: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "12px",
  },
  badgeNeutro: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    fontWeight: 700,
    fontSize: "12px",
  },
  badgeSucesso: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "12px",
  },
  badgeErro: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    fontSize: "12px",
  },
  badgePendente: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: 700,
    fontSize: "12px",
  },
  emptyCell: {
    textAlign: "center",
    padding: "18px",
    color: "#64748b",
  },
};