import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { buildBreadcrumbs, resolveRouteMeta } from "../config/brand";
import { useSystemTheme } from "../context/SystemThemeContext";

type TopbarAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "danger";
};

type TopbarProps = {
  title?: string;
  subtitle?: string;
  actions?: TopbarAction[];
};

export default function Topbar({ title, subtitle, actions = [] }: TopbarProps) {
  const location = useLocation();
  const { theme } = useSystemTheme();

  const route = resolveRouteMeta(location.pathname);
  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const resolvedTitle = title || route.label;
  const Icon = route.icon;

  const styles: Record<string, React.CSSProperties> = {
    wrap: {
      marginBottom: "18px",
      display: "grid",
      gap: "14px",
    },
    breadcrumbRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
      color: "#64748b",
      fontSize: "13px",
      fontWeight: 600,
    },
    crumbLink: {
      textDecoration: "none",
      color: "#64748b",
      transition: "0.2s ease",
    },
    crumbCurrent: {
      color: "#0f172a",
      fontWeight: 800,
    },
    bar: {
      background: "var(--brand-card, #ffffff)",
      border: "1px solid #e5e7eb",
      borderRadius: "22px",
      padding: "18px 22px",
      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },
    left: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: 0,
      flex: 1,
    },
    iconWrap: {
      width: "48px",
      height: "48px",
      borderRadius: "16px",
      background: `${theme.cor_primaria}18`,
      color: theme.cor_primaria,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    textWrap: {
      minWidth: 0,
    },
    title: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    subtitle: {
      margin: "6px 0 0",
      color: "#64748b",
      fontSize: "14px",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },
    buttonBase: {
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 16px",
      borderRadius: "12px",
      fontWeight: 800,
      border: "none",
      cursor: "pointer",
      minHeight: "44px",
    },
  };

  function getButtonStyle(variant: TopbarAction["variant"] = "secondary"): React.CSSProperties {
    if (variant === "primary") {
      return {
        ...styles.buttonBase,
        background: "var(--brand-primary, #2563eb)",
        color: "#fff",
      };
    }

    if (variant === "danger") {
      return {
        ...styles.buttonBase,
        background: "var(--brand-danger, #ef4444)",
        color: "#fff",
      };
    }

    return {
      ...styles.buttonBase,
      background: "#e2e8f0",
      color: "#0f172a",
    };
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.breadcrumbRow}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <span key={`${crumb.path}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {isLast ? (
                <span style={styles.crumbCurrent}>{crumb.label}</span>
              ) : (
                <Link to={crumb.path} style={styles.crumbLink}>
                  {crumb.label}
                </Link>
              )}
              {!isLast && <ChevronRight size={14} />}
            </span>
          );
        })}
      </div>

      <section style={styles.bar}>
        <div style={styles.left}>
          {Icon ? (
            <div style={styles.iconWrap}>
              <Icon size={22} />
            </div>
          ) : null}

          <div style={styles.textWrap}>
            <h1 style={styles.title}>{resolvedTitle}</h1>
            {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>

        {actions.length > 0 ? (
          <div style={styles.actions}>
            {actions.map((action, index) => {
              if (action.href) {
                return (
                  <Link
                    key={`${action.label}-${index}`}
                    to={action.href}
                    style={getButtonStyle(action.variant)}
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  onClick={action.onClick}
                  style={getButtonStyle(action.variant)}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}