import { useMemo, useState } from "react";
import {
  Trash2,
  AlertTriangle,
  History,
  Boxes,
  ClipboardList,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

export default function LimparImportacao() {
  const [apagarHistorico, setApagarHistorico] = useState(true);
  const [apagarMovimentacoes, setApagarMovimentacoes] = useState(true);
  const [apagarProdutosImportados, setApagarProdutosImportados] = useState(true);

  const [loading, setLoading] = useState(false);
  const [abrirConfirmacao, setAbrirConfirmacao] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function limparFeedback() {
    setFeedback({ type: "info", message: "" });
  }

  async function executarLimpeza() {
    setLoading(true);
    limparFeedback();

    try {
      const response = await api.post("/importacoes/limpar-importacao/", {
        apagar_historico: apagarHistorico,
        apagar_movimentacoes: apagarMovimentacoes,
        apagar_produtos_importados: apagarProdutosImportados,
      });

      const apagado = response.data.apagado;

      setFeedback({
        type: "success",
        message:
          `Limpeza concluída com sucesso. ` +
          `Histórico apagado: ${apagado.historico}. ` +
          `Movimentações apagadas: ${apagado.movimentacoes}. ` +
          `Produtos importados apagados: ${apagado.produtos_importados}.`,
      });

      setAbrirConfirmacao(false);
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.erro || "Erro ao limpar importações.";

      setFeedback({
        type: "error",
        message: mensagem,
      });
    } finally {
      setLoading(false);
    }
  }

  const resumo = useMemo(() => {
    let total = 0;
    if (apagarHistorico) total += 1;
    if (apagarMovimentacoes) total += 1;
    if (apagarProdutosImportados) total += 1;

    return {
      totalOpcoes: total,
    };
  }, [apagarHistorico, apagarMovimentacoes, apagarProdutosImportados]);

  return (
    <MainLayout
      title="Limpar Importação"
      subtitle="Remova histórico, movimentações e produtos gerados por importações"
    >
      <div style={styles.pageScroller}>
        <FeedbackMessage type={feedback.type} message={feedback.message} />

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <Trash2 size={18} />
              </span>
              <span style={styles.cardLabel}>Opções selecionadas</span>
            </div>
            <strong style={styles.cardValue}>{resumo.totalOpcoes}</strong>
          </div>

          <div style={styles.cardWarning}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>
                <AlertTriangle size={18} />
              </span>
              <span style={styles.cardLabel}>Ação sensível</span>
            </div>
            <strong style={styles.cardValue}>Cuidado</strong>
          </div>
        </div>

        <div style={styles.gridLayout}>
          <section style={styles.formSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Configurar limpeza</h2>
            </div>

            <div style={styles.formCard}>
              <div style={styles.warningBox}>
                Atenção: essa ação pode remover dados já importados do sistema.
                Use apenas quando quiser limpar a base importada.
              </div>

              <div style={styles.optionsGrid}>
                <label style={styles.optionCard}>
                  <div style={styles.optionTop}>
                    <History size={18} />
                    <span style={styles.optionTitle}>Histórico</span>
                  </div>
                  <div style={styles.optionText}>
                    Remove os registros do histórico de importações.
                  </div>
                  <input
                    type="checkbox"
                    checked={apagarHistorico}
                    onChange={(e) => setApagarHistorico(e.target.checked)}
                  />
                </label>

                <label style={styles.optionCard}>
                  <div style={styles.optionTop}>
                    <ClipboardList size={18} />
                    <span style={styles.optionTitle}>Movimentações</span>
                  </div>
                  <div style={styles.optionText}>
                    Remove movimentações com motivo de importação inicial.
                  </div>
                  <input
                    type="checkbox"
                    checked={apagarMovimentacoes}
                    onChange={(e) => setApagarMovimentacoes(e.target.checked)}
                  />
                </label>

                <label style={styles.optionCard}>
                  <div style={styles.optionTop}>
                    <Boxes size={18} />
                    <span style={styles.optionTitle}>Produtos importados</span>
                  </div>
                  <div style={styles.optionText}>
                    Remove os produtos identificados como importados.
                  </div>
                  <input
                    type="checkbox"
                    checked={apagarProdutosImportados}
                    onChange={(e) => setApagarProdutosImportados(e.target.checked)}
                  />
                </label>
              </div>

              <div style={styles.buttonRow}>
                <button
                  style={styles.dangerButton}
                  onClick={() => setAbrirConfirmacao(true)}
                >
                  <Trash2 size={16} />
                  Executar limpeza
                </button>
              </div>
            </div>
          </section>

          <section style={styles.infoSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Resumo da operação</h2>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoItem}>
                <strong>Histórico:</strong>{" "}
                {apagarHistorico ? "será apagado" : "será mantido"}
              </div>
              <div style={styles.infoItem}>
                <strong>Movimentações:</strong>{" "}
                {apagarMovimentacoes ? "serão apagadas" : "serão mantidas"}
              </div>
              <div style={styles.infoItem}>
                <strong>Produtos importados:</strong>{" "}
                {apagarProdutosImportados ? "serão apagados" : "serão mantidos"}
              </div>

              <div style={styles.infoAlert}>
                Recomendação: faça essa limpeza somente quando quiser remover a
                base importada e começar novamente.
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={abrirConfirmacao}
        title="Confirmar limpeza"
        message="Tem certeza que deseja executar a limpeza das importações? Essa ação pode apagar produtos, movimentações e histórico."
        confirmText="Sim, limpar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={executarLimpeza}
        onCancel={() => {
          if (!loading) setAbrirConfirmacao(false);
        }}
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
    gridTemplateColumns: "minmax(420px, 1fr) minmax(320px, 420px)",
    gap: "18px",
    alignItems: "start",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
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
  warningBox: {
    background: "#fff7ed",
    color: "#9a3412",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #fdba74",
    marginBottom: "16px",
    lineHeight: 1.45,
    fontWeight: 600,
  },
  optionsGrid: {
    display: "grid",
    gap: "14px",
  },
  optionCard: {
    display: "grid",
    gap: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    cursor: "pointer",
  },
  optionTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0f172a",
    fontWeight: 800,
  },
  optionTitle: {
    fontSize: "16px",
  },
  optionText: {
    color: "#475569",
    lineHeight: 1.45,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "16px",
  },
  dangerButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 8px 20px rgba(220, 38, 38, 0.18)",
  },
  infoCard: {
    background: "#fff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "20px",
    display: "grid",
    gap: "14px",
  },
  infoItem: {
    color: "#0f172a",
    lineHeight: 1.45,
  },
  infoAlert: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    lineHeight: 1.45,
  },
};