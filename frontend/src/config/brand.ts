import {
  Boxes,
  ClipboardList,
  FileBarChart2,
  FileUp,
  LayoutDashboard,
  PackagePlus,
  Settings,
  Tags,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RouteMeta = {
  label: string;
  icon?: LucideIcon;
  parent?: string;
};

export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    label: "Painel",
    icon: LayoutDashboard,
  },
  "/produtos": {
    label: "Produtos",
    icon: Boxes,
  },
  "/produtos/cadastrar": {
    label: "Cadastrar Produto",
    icon: PackagePlus,
    parent: "/produtos",
  },
  "/fornecedores": {
    label: "Fornecedores",
    icon: Truck,
  },
  "/movimentacoes": {
    label: "Movimentações",
    icon: ClipboardList,
  },
  "/importar": {
    label: "Importar Produtos",
    icon: FileUp,
  },
  "/importar/limpar": {
    label: "Limpar Importação",
    icon: FileUp,
    parent: "/importar",
  },
  "/categorias": {
    label: "Categorias",
    icon: Tags,
    parent: "/produtos",
  },
  "/usuarios": {
    label: "Usuários",
    icon: Users,
    parent: "/configuracoes",
  },
  "/configuracoes": {
    label: "Configurações",
    icon: Settings,
  },
  "/relatorios": {
    label: "Relatórios",
    icon: FileBarChart2,
    parent: "/configuracoes",
  },
};

export function resolveRouteMeta(pathname: string) {
  if (pathname.startsWith("/produtos/editar/")) {
    return {
      label: "Editar Produto",
      icon: PackagePlus,
      parent: "/produtos",
    };
  }

  return routeMeta[pathname] || { label: "Página" };
}

export function buildBreadcrumbs(pathname: string) {
  const current = resolveRouteMeta(pathname);
  const crumbs: Array<{ path: string; label: string }> = [];

  function pushParent(path?: string) {
    if (!path) return;
    const meta = routeMeta[path];
    if (!meta) return;

    if (meta.parent) {
      pushParent(meta.parent);
    }

    crumbs.push({
      path,
      label: meta.label,
    });
  }

  if (current.parent) {
    pushParent(current.parent);
  }

  crumbs.push({
    path: pathname,
    label: current.label,
  });

  return crumbs;
}