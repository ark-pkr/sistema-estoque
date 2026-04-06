import { useEffect, useState } from "react";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";
import { useSystemTheme } from "../context/SystemThemeContext";

const initialForm = {
  nome_empresa: "",
  nome_sistema: "",
  cor_primaria: "#2563eb",
  cor_secundaria: "#0f172a",
  cor_fundo: "#eef2f7",
  cor_texto: "#0f172a",
  cor_card: "#ffffff",
  cor_botao_perigo: "#ef4444",
  fonte_base: "Inter",
  tamanho_fonte_base: 15,
  tamanho_logo: 44,
  raio_borda: 20,
  largura_container: 1500,
  exibir_subtitulo_empresa: true,
  layout_compacto: false,
};

export default function ConfiguracoesSistema() {
  const { refreshTheme } = useSystemTheme();

  const [configId, setConfigId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  async function carregarConfiguracoes() {
    try {
      const response = await api.get("/configuracoes/");
      const item = Array.isArray(response.data)
        ? response.data[0]
        : response.data.results?.[0];

      if (item) {
        setConfigId(item.id);
        setLogoUrl(item.logo_url || "");
        setForm({
          nome_empresa: item.nome_empresa || "",
          nome_sistema: item.nome_sistema || "",
          cor_primaria: item.cor_primaria || "#2563eb",
          cor_secundaria: item.cor_secundaria || "#0f172a",
          cor_fundo: item.cor_fundo || "#eef2f7",
          cor_texto: item.cor_texto || "#0f172a",
          cor_card: item.cor_card || "#ffffff",
          cor_botao_perigo: item.cor_botao_perigo || "#ef4444",
          fonte_base: item.fonte_base || "Inter",
          tamanho_fonte_base: item.tamanho_fonte_base || 15,
          tamanho_logo: item.tamanho_logo || 44,
          raio_borda: item.raio_borda || 20,
          largura_container: item.largura_container || 1500,
          exibir_subtitulo_empresa: item.exibir_subtitulo_empresa ?? true,
          layout_compacto: item.layout_compacto ?? false,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro ao carregar configurações do sistema.",
      });
    }
  }

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      if (logoFile) {
        data.append("logo", logoFile);
      }

      if (configId) {
        await api.patch(`/configuracoes/${configId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/configuracoes/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await carregarConfiguracoes();
      await refreshTheme();

      setFeedback({
        type: "success",
        message: "Configurações salvas com sucesso.",
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.detail || "Erro ao salvar configurações.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout
      title="Configurações do Sistema"
      subtitle="Personalize identidade visual, layout e comportamento básico"
    >
      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Identidade visual e layout</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              placeholder="Nome da empresa"
              value={form.nome_empresa}
              onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })}
              style={styles.input}
            />

            <input
              placeholder="Nome do sistema"
              value={form.nome_sistema}
              onChange={(e) => setForm({ ...form, nome_sistema: e.target.value })}
              style={styles.input}
            />

            <label style={styles.label}>Cor primária</label>
            <input
              type="color"
              value={form.cor_primaria}
              onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })}
              style={styles.colorInput}
            />

            <label style={styles.label}>Cor secundária</label>
            <input
              type="color"
              value={form.cor_secundaria}
              onChange={(e) => setForm({ ...form, cor_secundaria: e.target.value })}
              style={styles.colorInput}
            />

            <label style={styles.label}>Cor de fundo</label>
            <input
              type="color"
              value={form.cor_fundo}
              onChange={(e) => setForm({ ...form, cor_fundo: e.target.value })}
              style={styles.colorInput}
            />

            <label style={styles.label}>Cor do texto</label>
            <input
              type="color"
              value={form.cor_texto}
              onChange={(e) => setForm({ ...form, cor_texto: e.target.value })}
              style={styles.colorInput}
            />

            <label style={styles.label}>Cor dos cards</label>
            <input
              type="color"
              value={form.cor_card}
              onChange={(e) => setForm({ ...form, cor_card: e.target.value })}
              style={styles.colorInput}
            />

            <label style={styles.label}>Cor do botão de perigo</label>
            <input
              type="color"
              value={form.cor_botao_perigo}
              onChange={(e) => setForm({ ...form, cor_botao_perigo: e.target.value })}
              style={styles.colorInput}
            />

            <input
              placeholder="Fonte base"
              value={form.fonte_base}
              onChange={(e) => setForm({ ...form, fonte_base: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Tamanho da fonte base"
              value={form.tamanho_fonte_base}
              onChange={(e) =>
                setForm({ ...form, tamanho_fonte_base: Number(e.target.value) })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Tamanho da logo"
              value={form.tamanho_logo}
              onChange={(e) =>
                setForm({ ...form, tamanho_logo: Number(e.target.value) })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Raio da borda"
              value={form.raio_borda}
              onChange={(e) =>
                setForm({ ...form, raio_borda: Number(e.target.value) })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Largura máxima do container"
              value={form.largura_container}
              onChange={(e) =>
                setForm({ ...form, largura_container: Number(e.target.value) })
              }
              style={styles.input}
            />

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.exibir_subtitulo_empresa}
                onChange={(e) =>
                  setForm({ ...form, exibir_subtitulo_empresa: e.target.checked })
                }
              />
              Exibir subtítulo da empresa no topo
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.layout_compacto}
                onChange={(e) =>
                  setForm({ ...form, layout_compacto: e.target.checked })
                }
              />
              Ativar layout compacto
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              style={styles.input}
            />

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? "Salvando..." : "Salvar configurações"}
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Prévia</h2>

          <div style={styles.previewBox}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  width: form.tamanho_logo,
                  height: form.tamanho_logo,
                  objectFit: "contain",
                  marginBottom: 12,
                }}
              />
            ) : null}

            <h3 style={{ margin: "12px 0 4px", color: form.cor_texto }}>
              {form.nome_sistema || "Sistema de Estoque"}
            </h3>

            {form.exibir_subtitulo_empresa && (
              <p style={{ margin: 0, color: form.cor_texto }}>
                {form.nome_empresa || "Minha Empresa"}
              </p>
            )}

            <div
              style={{
                marginTop: "16px",
                width: "100%",
                background: form.cor_primaria,
                color: "#fff",
                padding: "12px 14px",
                borderRadius: form.raio_borda,
                textAlign: "center",
                fontFamily: form.fonte_base,
                fontSize: form.tamanho_fonte_base,
              }}
            >
              Exemplo de botão principal
            </div>

            <div
              style={{
                marginTop: "12px",
                width: "100%",
                background: form.cor_botao_perigo,
                color: "#fff",
                padding: "12px 14px",
                borderRadius: form.raio_borda,
                textAlign: "center",
              }}
            >
              Exemplo de botão de perigo
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(420px, 1fr) minmax(320px, 420px)",
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
  sectionTitle: {
    margin: "0 0 14px",
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
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
  label: {
    fontWeight: 700,
    color: "#334155",
    marginBottom: "-6px",
  },
  colorInput: {
    width: "100%",
    height: "48px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#fff",
    padding: "6px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 600,
    color: "#334155",
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
  previewBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};