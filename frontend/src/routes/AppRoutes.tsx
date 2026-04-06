import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import ProtectedRouteByRole from "../components/ProtectedRouteByRole";

import Dashboard from "../pages/Dashboard";
import Produtos from "../pages/Produtos";
import CadastrarProduto from "../pages/CadastrarProduto";
import Fornecedores from "../pages/Fornecedores";
import Movimentacoes from "../pages/Movimentacoes";
import ImportarProdutos from "../pages/ImportarProdutos";
import LimparImportacao from "../pages/LimparImportacao";
import Categorias from "../pages/Categorias";
import Usuarios from "../pages/Usuarios";
import ConfiguracoesSistema from "../pages/ConfiguracoesSistema";
import Login from "../pages/Login";
import Relatorios from "../pages/Relatorios";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />

          <Route element={<ProtectedRouteByRole allowedRoles={["admin", "gerente"]} />}>
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produtos/cadastrar" element={<CadastrarProduto />} />
            <Route path="/produtos/editar/:id" element={<CadastrarProduto />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/importar" element={<ImportarProdutos />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>

          <Route path="/fornecedores" element={<Fornecedores />} />

          <Route element={<ProtectedRouteByRole allowedRoles={["admin", "gerente", "estoquista"]} />}>
            <Route path="/movimentacoes" element={<Movimentacoes />} />
          </Route>

          <Route element={<ProtectedRouteByRole allowedRoles={["admin"]} />}>
            <Route path="/importar/limpar" element={<LimparImportacao />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<ConfiguracoesSistema />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}