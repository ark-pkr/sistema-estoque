import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  RefreshCcw,
  Truck,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar as ReBar,
} from "recharts";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";
import { useSystemTheme } from "../context/SystemThemeContext";

type DashboardResponse = {
  cards?: {
    total_produtos?: number;
    total_fornecedores?: number;
    total_movimentacoes?: number;
    estoque_baixo?: number;
    sem_estoque?: number;
  };
  movimentacoes_7dias?: Array<{
    data__date?: string;
    tipo?: string;
    total?: number;
  }>;
  top_produtos?: Array<{
    produto__nome?: string;
    total?: number;
  }>;
};

type CardResumo = {
  total_produtos: number;
  total_fornecedores: number;
  total_movimentacoes: number;
  estoque_baixo: number;
  sem_estoque: number;
};

const emptyCards: CardResumo = {
  total_produtos: 0,
  total_fornecedores: 0,
  total_movimentacoes: 0,
  estoque_baixo: 0,
  sem_estoque: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useSystemTheme();

  const [cards, setCards] = useState<CardResumo>(emptyCards);
  const [movimentacoes7Dias, setMovimentacoes7Dias] = useState<any[]>([]);
  const [topProdutos, setTopProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  async function carregarDashboard() {
    setLoading(true);
    setFeedback({ type: "info", message: "" });

    try {
      const response = await api.get("/dashboard/");
      const data: DashboardResponse = response.data || {};

      setCards({
        total_produtos: Number(data.cards?.total_produtos || 0),
        total_fornecedores: Number(data.cards?.total_fornecedores || 0),
        total_movimentacoes: Number(data.cards?.total_movimentacoes || 0),
        estoque_baixo: Number(data.cards?.estoque_baixo || 0),
        sem_estoque: Number(data.cards?.sem_estoque || 0),
      });

      const graficoMov = Array.isArray(data.movimentacoes_7dias)
        ? data.movimentacoes_7dias.map((item) => ({
            dia: item.data__date
              ? new Date(item.data__date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : "-",
            total: Number(item.total || 0),
            tipo: item.tipo || "-",
          }))
        : [];

      const graficoTop = Array.isArray(data.top_produtos)
        ? data.top_produtos.map((item) => ({
            produto: item.produto__nome || "-",
            total: Number(item.total || 0),
          }))
        : [];

      setMovimentacoes7Dias(graficoMov);
      setTopProdutos(graficoTop);
    } catch (error: any) {
      const status = error?.response?.status;
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.erro ||
        "Não foi possível carregar os dados do dashboard.";

      setFeedback({
        type: "error",
        message: `${detail}${status ? ` (${status})` : ""}`,
      });

      setCards(emptyCards);
      setMovimentacoes7Dias([]);
      setTopProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const dashboardCards = useMemo(
    () => [
      {
        title: "Total de produtos",
        value: cards.total_produtos,
        icon: <Boxes size={18} />,
        border: "#e5e7eb",
        bg: "var(--brand-card, #ffffff)",
        path: "/produtos",
      },
      {
        title: "Fornecedores",
        value: cards.total_fornecedores,
        icon: <Truck size={18} />,
        border: "#e5e7eb",
        bg: "var(--brand-card, #ffffff)",
        path: "/fornecedores",
      },
      {
        title: "Movimentações",
        value: cards.total_movimentacoes,
        icon: <ClipboardList size={18} />,
        border: "#e5e7eb",
        bg: "var(--brand-card, #ffffff)",
        path: "/movimentacoes",
      },
      {
        title: "Estoque baixo",
        value: cards.estoque_baixo,
        icon: <AlertTriangle size={18} />,
        border: "#fdba74",
        bg: "#fff7ed",
        path: "/produtos?filtro=estoque_baixo",
      },
      {
        title: "Sem estoque",
        value: cards.sem_estoque,
        icon: <PackageX size={18} />,
        border: "#fca5a5",
        bg: "#fef2f2",
        path: "/produtos?filtro=sem_estoque",
      },
    ],
    [cards]
  );

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Visão geral do estoque, alertas e movimentações recentes"
    >
      <div style={styles.topBar}>
        <button style={styles.refreshButton} onClick={carregarDashboard} disabled={loading}>
          <RefreshCcw size={16} />
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <section style={styles.cardsGrid}>
        {dashboardCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => navigate(card.path)}
            style={{
              ...styles.cardButton,
              border: `1px solid ${card.border}`,
              background: card.bg,
            }}
          >
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>{card.icon}</span>
              <span style={styles.cardTitle}>{card.title}</span>
            </div>

            <div style={styles.cardFooter}>
              <strong style={styles.cardValue}>{card.value}</strong>
              <span style={styles.cardArrow}>
                <ArrowRight size={16} />
              </span>
            </div>
          </button>
        ))}
      </section>

      <section style={styles.analyticsGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Movimentações dos últimos 7 dias</h2>
            <p style={styles.panelSubtitle}>Totais por data</p>
          </div>

          <div style={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={movimentacoes7Dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <ReBar dataKey="total" fill={theme.cor_primaria} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Produtos mais movimentados</h2>
            <p style={styles.panelSubtitle}>Últimos 30 dias</p>
          </div>

          <div style={styles.chartArea}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProdutos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip />
                <ReBar dataKey="total" fill={theme.cor_primaria} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "18px",
  },
  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--brand-primary, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "13px 18px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  cardButton: {
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
    cursor: "pointer",
    textAlign: "left",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    color: "#64748b",
    fontWeight: 600,
  },
  cardIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "15px",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  cardValue: {
    fontSize: "24px",
    color: "#0f172a",
  },
  cardArrow: {
    display: "inline-flex",
    alignItems: "center",
    color: "#64748b",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginBottom: "18px",
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
  chartArea: {
    width: "100%",
    height: "320px",
  },
};