import type { CSSProperties, ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSystemTheme } from "../context/SystemThemeContext";

type MainLayoutAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "danger";
};

type MainLayoutProps = {
  title?: string;
  subtitle?: string;
  actions?: MainLayoutAction[];
  children: ReactNode;
};

export default function MainLayout({
  title,
  subtitle,
  actions,
  children,
}: MainLayoutProps) {
  const { theme } = useSystemTheme();

  const styles: Record<string, CSSProperties> = {
    appShell: {
      minHeight: "100vh",
      background: theme.cor_fundo,
    },
    main: {
      width: "100%",
      minHeight: "100vh",
      padding: theme.layout_compacto ? "16px 14px 24px" : "22px 18px 32px",
      boxSizing: "border-box",
      overflow: "visible",
    },
    container: {
      width: "100%",
      maxWidth: `${theme.largura_container || 1500}px`,
      margin: "0 auto",
    },
    content: {
      width: "100%",
      overflow: "visible",
    },
  };

  return (
    <div style={styles.appShell}>
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.container}>
          <Topbar title={title} subtitle={subtitle} actions={actions} />
          <section style={styles.content}>{children}</section>
        </div>
      </main>
    </div>
  );
}