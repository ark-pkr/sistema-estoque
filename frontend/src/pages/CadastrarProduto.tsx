import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCcw, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import FeedbackMessage from "../components/FeedbackMessage";
import MainLayout from "../layouts/MainLayout";
import { api } from "../services/api";

type Categoria = {
  id: number;
  nome: string;
};

type Fornecedor = {
  id: number;
  nome: string;
};

type ProdutoForm = {
  nome: string;
  codigo: string;
  categoria: string;
  fornecedor: string;
  marca: string;
  unidade: string;
  preco_custo: string;
  preco_venda: string;
  estoque_minimo: string;
  estoque_inicial: string;
  descricao: string;
  ativo: boolean;
};

const initialForm: ProdutoForm = {
  nome: "",
  codigo: "",
  categoria: "",
  fornecedor: "",
  marca: "",
  unidade: "UN",
  preco_custo: "",
  preco_venda: "",
  estoque_minimo: "0",
  estoque_inicial: "0",
  descricao: "",
  ativo: true,
};

export default function CadastrarProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [form, setForm] = useState<ProdutoForm>(initialForm);

  const [loading, setLoading] = useState(false);
  const [loadingDependencias, setLoadingDependencias] = useState(true);
  const [loadingProduto, setLoadingProduto] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  function setField<K extends keyof ProdutoForm>(field: K, value: ProdutoForm[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function limparFormulario() {
    setForm(initialForm);
  }

  function normalizarNumero(value: string) {
    if (!value) return "";
    return value.replace(",", ".");
  }

  function parseNumberOrNull(value: string) {
    const cleaned = normalizarNumero(value).trim();
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }

  async function carregarDependencias() {
    setLoadingDependencias(true);

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
        message: "Não foi possível carregar categorias e fornecedores.",
      });
    } finally {
      setLoadingDependencias(false);
    }
  }

  async function carregarProduto() {
    if (!isEdit) return;

    setLoadingProduto(true);
    try {
      const response = await api.get(`/produtos/${id}/`);
      const p = response.data;

      setForm({
        nome: p.nome || "",
        codigo: p.codigo || "",
        categoria: p.categoria ? String(p.categoria) : "",
        fornecedor: p.fornecedor ? String(p.fornecedor) : "",
        marca: p.marca || "",
        unidade: p.unidade || "UN",
        preco_custo: String(p.preco_custo ?? ""),
        preco_venda: String(p.preco_venda ?? ""),
        estoque_minimo: String(p.estoque_minimo ?? "0"),
        estoque_inicial: "0",
        descricao: p.descricao || "",
        ativo: p.ativo ?? true,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível carregar o produto para edição.",
      });
    } finally {
      setLoadingProduto(false);
    }
  }

  useEffect(() => {
    carregarDependencias();
  }, []);

  useEffect(() => {
    carregarProduto();
  }, [id]);

  const infoMessage = useMemo(
    () =>
      isEdit
        ? "Na edição, o estoque não é alterado aqui. Para aumentar quantidade, use a reposição de estoque em Movimentações."
        : "No cadastro, a quantidade informada em estoque inicial vira estoque atual e gera uma movimentação automática de entrada.",
    [isEdit]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback({ type: "info", message: "" });

    if (!form.nome.trim()) {
      setFeedback({ type: "warning", message: "Informe o nome do produto." });
      return;
    }

    if (!form.codigo.trim()) {
      setFeedback({ type: "warning", message: "Informe o código do produto." });
      return;
    }

    if (!form.categoria) {
      setFeedback({ type: "warning", message: "Selecione uma categoria." });
      return;
    }

    if (!form.fornecedor) {
      setFeedback({ type: "warning", message: "Selecione um fornecedor." });
      return;
    }

    const precoCusto = parseNumberOrNull(form.preco_custo);
    const precoVenda = parseNumberOrNull(form.preco_venda);
    const estoqueMinimo = parseNumberOrNull(form.estoque_minimo);
    const estoqueInicial = parseNumberOrNull(form.estoque_inicial);

    if (precoCusto === null || precoCusto < 0) {
      setFeedback({ type: "warning", message: "Informe um preço de custo válido." });
      return;
    }

    if (precoVenda === null || precoVenda < 0) {
      setFeedback({ type: "warning", message: "Informe um preço de venda válido." });
      return;
    }

    if (estoqueMinimo === null || estoqueMinimo < 0) {
      setFeedback({ type: "warning", message: "Informe um estoque mínimo válido." });
      return;
    }

    if (!isEdit && (estoqueInicial === null || estoqueInicial < 0)) {
      setFeedback({ type: "warning", message: "Informe um estoque inicial válido." });
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        nome: form.nome.trim(),
        codigo: form.codigo.trim(),
        categoria: Number(form.categoria),
        fornecedor: Number(form.fornecedor),
        marca: form.marca.trim(),
        unidade: form.unidade,
        preco_custo: precoCusto,
        preco_venda: precoVenda,
        estoque_minimo: estoqueMinimo,
        descricao: form.descricao.trim(),
        ativo: form.ativo,
      };

      if (!isEdit) {
        payload.estoque_inicial = estoqueInicial ?? 0;
        await api.post("/produtos/", payload);
        setFeedback({ type: "success", message: "Produto cadastrado com sucesso." });
        limparFormulario();
      } else {
        await api.put(`/produtos/${id}/`, payload);
        setFeedback({ type: "success", message: "Produto atualizado com sucesso." });
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const firstFieldError =
        data?.detail ||
        data?.erro ||
        data?.nome?.[0] ||
        data?.codigo?.[0] ||
        data?.categoria?.[0] ||
        data?.fornecedor?.[0] ||
        data?.preco_custo?.[0] ||
        data?.preco_venda?.[0] ||
        data?.estoque_minimo?.[0] ||
        data?.estoque_inicial?.[0] ||
        data?.descricao?.[0];

      setFeedback({
        type: "error",
        message: firstFieldError || "Não foi possível salvar o produto.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout
      title={isEdit ? "Editar Produto" : "Cadastrar Produto"}
      subtitle={isEdit ? "Atualize os dados do produto" : "Cadastre um novo produto com estoque inicial"}
    >
      <div style={styles.actionsBar}>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => navigate("/produtos")}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <button
          type="button"
          style={styles.ghostButton}
          onClick={carregarDependencias}
          disabled={loadingDependencias}
        >
          <RefreshCcw size={16} />
          Recarregar dados
        </button>
      </div>

      <div style={styles.infoBox}>{infoMessage}</div>

      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <section style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input
              style={styles.input}
              placeholder="Nome do produto"
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Código"
              value={form.codigo}
              onChange={(e) => setField("codigo", e.target.value)}
            />

            <select
              style={styles.input}
              value={form.categoria}
              onChange={(e) => setField("categoria", e.target.value)}
              disabled={loadingDependencias || loadingProduto}
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={form.fornecedor}
              onChange={(e) => setField("fornecedor", e.target.value)}
              disabled={loadingDependencias || loadingProduto}
            >
              <option value="">Selecione o fornecedor</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="Marca"
              value={form.marca}
              onChange={(e) => setField("marca", e.target.value)}
            />

            <select
              style={styles.input}
              value={form.unidade}
              onChange={(e) => setField("unidade", e.target.value)}
            >
              <option value="UN">UN</option>
              <option value="CX">CX</option>
              <option value="PC">PC</option>
              <option value="KG">KG</option>
              <option value="MT">MT</option>
              <option value="LT">LT</option>
            </select>

            <input
              style={styles.input}
              placeholder="Preço de custo"
              value={form.preco_custo}
              onChange={(e) => setField("preco_custo", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Preço de venda"
              value={form.preco_venda}
              onChange={(e) => setField("preco_venda", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Estoque mínimo"
              value={form.estoque_minimo}
              onChange={(e) => setField("estoque_minimo", e.target.value)}
            />

            {!isEdit && (
              <input
                style={styles.input}
                placeholder="Estoque inicial no cadastro"
                value={form.estoque_inicial}
                onChange={(e) => setField("estoque_inicial", e.target.value)}
              />
            )}
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setField("descricao", e.target.value)}
          />

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setField("ativo", e.target.checked)}
            />
            Produto ativo
          </label>

          <div style={styles.footerButtons}>
            {!isEdit ? (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={limparFormulario}
                disabled={loading}
              >
                Limpar
              </button>
            ) : (
              <div />
            )}

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              <Save size={16} />
              {loading ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  actionsBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  infoBox: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "16px",
    padding: "16px 18px",
    marginBottom: "16px",
    fontWeight: 500,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    padding: "22px",
  },
  form: {
    display: "grid",
    gap: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(180px, 1fr))",
    gap: "16px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "15px",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "140px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 600,
    color: "#0f172a",
  },
  footerButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#475569",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
};