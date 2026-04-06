import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  Boxes,
  ChevronDown,
  ClipboardList,
  FileBarChart2,
  FileUp,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  PackageSearch,
  Settings,
  SlidersHorizontal,
  Tags,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSystemTheme } from "../context/SystemThemeContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useSystemTheme();

  const tipo = user?.tipo || "";

  const isAdmin = tipo === "admin";
  const isGerente = tipo === "gerente";
  const isEstoquista = tipo === "estoquista";
  const isVendedor = tipo === "vendedor";

  const canViewDashboard = isAdmin || isGerente || isEstoquista || isVendedor;
  const canViewFornecedores = isAdmin || isGerente || isEstoquista || isVendedor;
  const canManageProducts = isAdmin || isGerente;
  const canViewMovimentacoes = isAdmin || isGerente || isEstoquista;
  const canImport = isAdmin || isGerente;
  const canViewUsuarios = isAdmin;
  const canViewConfiguracoes = isAdmin;
  const canViewRelatorios = isAdmin || isGerente;

  const [menuProdutosAberto, setMenuProdutosAberto] = useState(false);
  const [menuImportacoesAberto, setMenuImportacoesAberto] = useState(false);
  const [menuConfiguracoesAberto, setMenuConfiguracoesAberto] = useState(false);
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);
  const [] = useState("");

  const produtosRef = useRef<HTMLDivElement | null>(null);
  const importacoesRef = useRef<HTMLDivElement | null>(null);
  const configuracoesRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const produtosAtivo =
    location.pathname === "/produtos" ||
    location.pathname === "/produtos/cadastrar" ||
    location.pathname.startsWith("/produtos/editar/") ||
    location.pathname === "/categorias";

  const importacoesAtivo =
    location.pathname === "/importar" ||
    location.pathname === "/importar/limpar";

  const configuracoesAtivo =
    location.pathname === "/usuarios" ||
    location.pathname === "/configuracoes" ||
    location.pathname === "/relatorios";

  const nomeUsuario = user?.nome || user?.email || "Usuário";

  const perfilLabel = isAdmin
    ? "Administrador"
    : isGerente
    ? "Gerente"
    : isEstoquista
    ? "Estoquista"
    : isVendedor
    ? "Vendedor"
    : "Usuário";

  function getInitials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  const avatarText = getInitials(nomeUsuario);


  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      const target = event.target as Node;

      if (produtosRef.current && !produtosRef.current.contains(target)) {
        setMenuProdutosAberto(false);
      }

      if (importacoesRef.current && !importacoesRef.current.contains(target)) {
        setMenuImportacoesAberto(false);
      }

      if (configuracoesRef.current && !configuracoesRef.current.contains(target)) {
        setMenuConfiguracoesAberto(false);
      }

      if (navRef.current && !navRef.current.contains(target)) {
        setMobileMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    setMenuProdutosAberto(false);
    setMenuImportacoesAberto(false);
    setMenuConfiguracoesAberto(false);
    setMobileMenuAberto(false);
  }, [location.pathname]);

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    textDecoration: "none",
    color: isActive ? "#ffffff" : "#dbeafe",
    background: isActive ? theme.cor_primaria : "transparent",
    padding: "11px 15px",
    borderRadius: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    transition: "all 0.22s ease",
    display: "inline-flex",
    alignItems: "center",
    minHeight: "46px",
    border: "1px solid transparent",
    boxShadow: isActive ? "0 10px 24px rgba(37, 99, 235, 0.22)" : "none",
  });

  const dropdownLinkStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }): React.CSSProperties => ({
    textDecoration: "none",
    color: isActive ? "#ffffff" : "#0f172a",
    background: isActive ? theme.cor_primaria : "transparent",
    padding: "12px 12px",
    borderRadius: "10px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "all 0.22s ease",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: isActive ? "0 8px 18px rgba(37, 99, 235, 0.18)" : "none",
  });

  const styles: Record<string, React.CSSProperties> = useMemo(
    () => ({
      header: {
        width: "100%",
        background: theme.cor_secundaria,
        color: "#fff",
        display: "grid",
        gridTemplateColumns: "minmax(250px, 320px) 1fr auto",
        alignItems: "center",
        gap: "18px",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxSizing: "border-box",
        boxShadow: "0 14px 34px rgba(2, 6, 23, 0.14)",
      },
      brandBox: {
        display: "flex",
        alignItems: "center",
        minWidth: 0,
      },
      brandRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        minWidth: 0,
      },
      logo: {
        width: theme.tamanho_logo + 22,
        height: theme.tamanho_logo + 22,
        objectFit: "contain",
        background: "#ffffff",
        borderRadius: 18,
        padding: 6,
        flexShrink: 0,
        boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
        border: "1px solid rgba(255,255,255,0.25)",
      },
      brandTextWrap: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      },
      brand: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 900,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "240px",
      },
      subtitle: {
        fontSize: "13px",
        color: "#cbd5e1",
        marginTop: "6px",
        display: "block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "240px",
      },
      centerWrap: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minWidth: 0,
      },
      searchForm: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "16px",
        padding: "0 14px",
        minHeight: "48px",
      },
      searchInput: {
        flex: 1,
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#ffffff",
        fontSize: "14px",
      },
      navShell: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
      },
      nav: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
        minWidth: 0,
        background: "rgba(255,255,255,0.045)",
        padding: "8px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      },
      topActions: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        justifyContent: "flex-end",
      },
      avatarBlock: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "18px",
        padding: "8px 12px",
        minHeight: "52px",
      },
      avatarCircle: {
        width: "40px",
        height: "40px",
        borderRadius: "999px",
        background: theme.cor_primaria,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: "14px",
        boxShadow: "0 8px 18px rgba(37, 99, 235, 0.25)",
        flexShrink: 0,
      },
      userTextWrap: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      },
      userName: {
        fontSize: "14px",
        fontWeight: 800,
        color: "#ffffff",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "160px",
      },
      userRole: {
        fontSize: "12px",
        color: "#cbd5e1",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "160px",
      },
      iconButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        color: "#ffffff",
        cursor: "pointer",
        position: "relative",
      },
      badge: {
        position: "absolute",
        top: "-4px",
        right: "-4px",
        minWidth: "18px",
        height: "18px",
        borderRadius: "999px",
        background: "var(--brand-danger, #ef4444)",
        color: "#fff",
        fontSize: "10px",
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 5px",
      },
      mobileToggle: {
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "14px",
        width: "46px",
        height: "46px",
        cursor: "pointer",
      },
      dropdownWrapper: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      },
      dropdownButton: {
        background: "transparent",
        color: "#dbeafe",
        border: "1px solid transparent",
        padding: "11px 15px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap",
        minHeight: "46px",
        transition: "all 0.22s ease",
      },
      dropdownButtonActive: {
        background: theme.cor_primaria,
        color: "#ffffff",
        boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
      },
      dropdownMenu: {
        position: "absolute",
        top: "calc(100% + 12px)",
        left: 0,
        minWidth: "280px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        boxShadow: "0 24px 50px rgba(15, 23, 42, 0.20)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 1100,
        animation: "fadeInMenu 0.18s ease",
      },
      dropdownTitle: {
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#64748b",
        padding: "4px 6px 2px",
      },
      dropdownDivider: {
        height: "1px",
        background: "#e2e8f0",
        margin: "4px 0",
      },
      badgeSoft: {
        marginLeft: "auto",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "11px",
        fontWeight: 800,
      },
      logoutButton: {
        background: "var(--brand-danger, #ef4444)",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: 800,
        minHeight: "46px",
        boxShadow: "0 10px 22px rgba(239, 68, 68, 0.22)",
      },
      linkInner: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
      },
      overlay: {
        display: mobileMenuAberto ? "block" : "none",
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.45)",
        zIndex: 999,
      },
      mobilePanel: {
        position: "fixed",
        top: 0,
        right: mobileMenuAberto ? 0 : "-380px",
        width: "340px",
        maxWidth: "92vw",
        height: "100vh",
        background: theme.cor_secundaria,
        boxShadow: "-20px 0 50px rgba(2, 6, 23, 0.30)",
        zIndex: 1001,
        padding: "18px",
        transition: "right 0.28s ease",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      },
      mobilePanelHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      },
      mobilePanelTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: 900,
        color: "#fff",
      },
      mobileClose: {
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        width: "42px",
        height: "42px",
        cursor: "pointer",
      },
      mobileNav: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
        paddingRight: "4px",
      },
      mobileGroup: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "10px",
      },
      mobileGroupTitle: {
        margin: "0 0 8px",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
    }),
    [theme, mobileMenuAberto]
  );

  return (
    <>
      <style>
        {`
          @media (max-width: 1199px) {
            .desktop-center-shell {
              display: none !important;
            }
            .desktop-right-shell {
              display: none !important;
            }
            .mobile-toggle-visible {
              display: inline-flex !important;
            }
            .header-mobile-grid {
              grid-template-columns: 1fr auto !important;
              align-items: center !important;
            }
            .header-brand-small h1 {
              max-width: 180px !important;
            }
          }

          @media (max-width: 640px) {
            .header-brand-small h1 {
              max-width: 140px !important;
              font-size: 18px !important;
            }
            .header-brand-small span {
              max-width: 140px !important;
            }
          }

          @keyframes fadeInMenu {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .menu-hover-lift:hover {
            transform: translateY(-1px);
          }
        `}
      </style>

      <div style={styles.overlay} onClick={() => setMobileMenuAberto(false)} />

      <header style={styles.header} className="header-mobile-grid">
        <div style={styles.brandBox} className="header-brand-small">
          <div style={styles.brandRow}>
            {theme.logo_url ? (
              <img src={theme.logo_url} alt="Logo da empresa" style={styles.logo} />
            ) : (
              <Boxes size={28} />
            )}

            <div style={styles.brandTextWrap}>
              <h1 style={styles.brand}>{theme.nome_sistema}</h1>
              <span style={styles.subtitle}>{theme.nome_empresa}</span>
            </div>
          </div>
        </div>


          <div style={styles.navShell}>
            <nav style={styles.nav}>
              {canViewDashboard && (
                <NavLink to="/" style={navLinkStyle} className="menu-hover-lift">
                  <span style={styles.linkInner}>
                    <LayoutDashboard size={18} />
                    Painel
                  </span>
                </NavLink>
              )}

              {canManageProducts && (
                <div style={styles.dropdownWrapper} ref={produtosRef}>
                  <button
                    type="button"
                    className="menu-hover-lift"
                    onClick={() => {
                      setMenuProdutosAberto((prev) => !prev);
                      setMenuImportacoesAberto(false);
                      setMenuConfiguracoesAberto(false);
                    }}
                    style={{
                      ...styles.dropdownButton,
                      ...(produtosAtivo ? styles.dropdownButtonActive : {}),
                    }}
                  >
                    <span style={styles.linkInner}>
                      <Boxes size={18} />
                      Produtos
                      <ChevronDown
                        size={16}
                        style={{
                          transform: menuProdutosAberto ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </span>
                  </button>

                  {menuProdutosAberto && (
                    <div style={styles.dropdownMenu}>
                      <div style={styles.dropdownTitle}>Gestão de produtos</div>

                      <NavLink to="/produtos" style={dropdownLinkStyle}>
                        <span style={styles.linkInner}>
                          <PackageSearch size={16} />
                          Ver produtos
                        </span>
                      </NavLink>

                      <NavLink to="/produtos/cadastrar" style={dropdownLinkStyle}>
                        <span style={styles.linkInner}>
                          <PackagePlus size={16} />
                          Novo produto
                        </span>
                      </NavLink>

                      <div style={styles.dropdownDivider} />

                      <NavLink to="/categorias" style={dropdownLinkStyle}>
                        <span style={styles.linkInner}>
                          <Tags size={16} />
                          Categorias
                        </span>
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              {canViewFornecedores && (
                <NavLink to="/fornecedores" style={navLinkStyle} className="menu-hover-lift">
                  <span style={styles.linkInner}>
                    <Truck size={18} />
                    Fornecedores
                  </span>
                </NavLink>
              )}

              {canViewMovimentacoes && (
                <NavLink to="/movimentacoes" style={navLinkStyle} className="menu-hover-lift">
                  <span style={styles.linkInner}>
                    <ClipboardList size={18} />
                    Movimentações
                  </span>
                </NavLink>
              )}

              {canImport && (
                <div style={styles.dropdownWrapper} ref={importacoesRef}>
                  <button
                    type="button"
                    className="menu-hover-lift"
                    onClick={() => {
                      setMenuImportacoesAberto((prev) => !prev);
                      setMenuProdutosAberto(false);
                      setMenuConfiguracoesAberto(false);
                    }}
                    style={{
                      ...styles.dropdownButton,
                      ...(importacoesAtivo ? styles.dropdownButtonActive : {}),
                    }}
                  >
                    <span style={styles.linkInner}>
                      <FileUp size={18} />
                      Importações
                      <ChevronDown
                        size={16}
                        style={{
                          transform: menuImportacoesAberto ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </span>
                  </button>

                  {menuImportacoesAberto && (
                    <div style={styles.dropdownMenu}>
                      <div style={styles.dropdownTitle}>Importação</div>

                      <NavLink to="/importar" style={dropdownLinkStyle}>
                        <span style={styles.linkInner}>
                          <FileUp size={16} />
                          Importar produtos
                        </span>
                      </NavLink>

                      {isAdmin && (
                        <>
                          <div style={styles.dropdownDivider} />
                          <NavLink to="/importar/limpar" style={dropdownLinkStyle}>
                            <span style={styles.linkInner}>
                              <Trash2 size={16} />
                              Limpar importação
                            </span>
                          </NavLink>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(canViewConfiguracoes || canViewUsuarios || canViewRelatorios) && (
                <div style={styles.dropdownWrapper} ref={configuracoesRef}>
                  <button
                    type="button"
                    className="menu-hover-lift"
                    onClick={() => {
                      setMenuConfiguracoesAberto((prev) => !prev);
                      setMenuProdutosAberto(false);
                      setMenuImportacoesAberto(false);
                    }}
                    style={{
                      ...styles.dropdownButton,
                      ...(configuracoesAtivo ? styles.dropdownButtonActive : {}),
                    }}
                  >
                    <span style={styles.linkInner}>
                      <Settings size={18} />
                      Configurações
                      <ChevronDown
                        size={16}
                        style={{
                          transform: menuConfiguracoesAberto ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </span>
                  </button>

                  {menuConfiguracoesAberto && (
                    <div style={styles.dropdownMenu}>
                      <div style={styles.dropdownTitle}>Administração</div>

                      {canViewConfiguracoes && (
                        <NavLink to="/configuracoes" style={dropdownLinkStyle}>
                          <span style={styles.linkInner}>
                            <SlidersHorizontal size={16} />
                            Configurações do sistema
                          </span>
                        </NavLink>
                      )}

                      {canViewUsuarios && (
                        <NavLink to="/usuarios" style={dropdownLinkStyle}>
                          <span style={styles.linkInner}>
                            <Users size={16} />
                            Usuários
                            <span style={styles.badgeSoft}>Admin</span>
                          </span>
                        </NavLink>
                      )}

                      {canViewRelatorios && (
                        <NavLink to="/relatorios" style={dropdownLinkStyle}>
                          <span style={styles.linkInner}>
                            <FileBarChart2 size={16} />
                            Relatórios
                            <span style={styles.badgeSoft}>Gestão</span>
                          </span>
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

        <div style={styles.topActions} className="desktop-right-shell">
          <button style={styles.iconButton} title="Notificações">
            <Bell size={18} />
            <span style={styles.badge}>3</span>
          </button>

          <div style={styles.avatarBlock}>
            <div style={styles.avatarCircle}>{avatarText}</div>
            <div style={styles.userTextWrap}>
              <span style={styles.userName}>{nomeUsuario}</span>
              <span style={styles.userRole}>{perfilLabel}</span>
            </div>
          </div>

          <button onClick={logout} style={styles.logoutButton}>
            <span style={styles.linkInner}>
              <LogOut size={18} />
              Sair
            </span>
          </button>
        </div>

        <button
          style={styles.mobileToggle}
          className="mobile-toggle-visible"
          onClick={() => setMobileMenuAberto(true)}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      <aside style={styles.mobilePanel}>
        <div style={styles.mobilePanelHeader}>
          <h2 style={styles.mobilePanelTitle}>Menu</h2>
          <button
            style={styles.mobileClose}
            onClick={() => setMobileMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.avatarBlock}>
          <div style={styles.avatarCircle}>{avatarText}</div>
          <div style={styles.userTextWrap}>
            <span style={styles.userName}>{nomeUsuario}</span>
            <span style={styles.userRole}>{perfilLabel}</span>
          </div>
        </div>

        <div style={styles.mobileNav}>
          {canViewDashboard && (
            <div style={styles.mobileGroup}>
              <NavLink to="/" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <LayoutDashboard size={18} />
                  Painel
                </span>
              </NavLink>
            </div>
          )}

          {canManageProducts && (
            <div style={styles.mobileGroup}>
              <div style={styles.mobileGroupTitle}>Produtos</div>

              <NavLink to="/produtos" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <PackageSearch size={18} />
                  Ver produtos
                </span>
              </NavLink>

              <NavLink to="/produtos/cadastrar" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <PackagePlus size={18} />
                  Novo produto
                </span>
              </NavLink>

              <NavLink to="/categorias" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <Tags size={18} />
                  Categorias
                </span>
              </NavLink>
            </div>
          )}

          {canViewFornecedores && (
            <div style={styles.mobileGroup}>
              <NavLink to="/fornecedores" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <Truck size={18} />
                  Fornecedores
                </span>
              </NavLink>
            </div>
          )}

          {canViewMovimentacoes && (
            <div style={styles.mobileGroup}>
              <NavLink to="/movimentacoes" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <ClipboardList size={18} />
                  Movimentações
                </span>
              </NavLink>
            </div>
          )}

          {canImport && (
            <div style={styles.mobileGroup}>
              <div style={styles.mobileGroupTitle}>Importações</div>

              <NavLink to="/importar" style={navLinkStyle}>
                <span style={styles.linkInner}>
                  <FileUp size={18} />
                  Importar produtos
                </span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/importar/limpar" style={navLinkStyle}>
                  <span style={styles.linkInner}>
                    <Trash2 size={18} />
                    Limpar importação
                  </span>
                </NavLink>
              )}
            </div>
          )}

          {(canViewConfiguracoes || canViewUsuarios || canViewRelatorios) && (
            <div style={styles.mobileGroup}>
              <div style={styles.mobileGroupTitle}>Configurações</div>

              {canViewConfiguracoes && (
                <NavLink to="/configuracoes" style={navLinkStyle}>
                  <span style={styles.linkInner}>
                    <SlidersHorizontal size={18} />
                    Configurações do sistema
                  </span>
                </NavLink>
              )}

              {canViewUsuarios && (
                <NavLink to="/usuarios" style={navLinkStyle}>
                  <span style={styles.linkInner}>
                    <Users size={18} />
                    Usuários
                  </span>
                </NavLink>
              )}

              {canViewRelatorios && (
                <NavLink to="/relatorios" style={navLinkStyle}>
                  <span style={styles.linkInner}>
                    <FileBarChart2 size={18} />
                    Relatórios
                  </span>
                </NavLink>
              )}
            </div>
          )}

          <div style={styles.mobileGroup}>
            <button onClick={logout} style={{ ...styles.logoutButton, width: "100%" }}>
              <span style={styles.linkInner}>
                <LogOut size={18} />
                Sair
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}