// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Relatorios from "./pages/Relatorios";
import Comanda from "./pages/Comanda";
import Estoque from "./pages/Estoque";
import GerenciarFuncionarios from "./pages/GerenciarFuncionarios";

function RequireAuth({ children }) {
  const { token } = useAuth();
  return token ? children : <Login />;
}

function RequireAdmin({ children }) {
  const { token, user } = useAuth();
  return token && user?.tipo === "admin" ? children : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      {/* NÃO coloque Router aqui, o HashRouter já está em main.jsx */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/Admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RequireAdmin>
              <Relatorios />
            </RequireAdmin>
          }
        />
        <Route
          path="/comanda"
          element={
            <RequireAuth>
              <Comanda />
            </RequireAuth>
          }
        />
        <Route
          path="/estoque"
          element={
            <RequireAdmin>
              <Estoque />
            </RequireAdmin>
          }
        />
        <Route
          path="/GerenciarFuncionarios"
          element={
            <RequireAdmin>
              <GerenciarFuncionarios />
            </RequireAdmin>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
