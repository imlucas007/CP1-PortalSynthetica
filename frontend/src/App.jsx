import { Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./admin/AdminShell";
import Painel from "./pages/admin/Painel";
import AdminConteudos from "./pages/admin/AdminConteudos";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/painel" replace />} />
      <Route
        path="/admin/painel"
        element={
          <AdminShell>
            <Painel />
          </AdminShell>
        }
      />
      <Route
        path="/admin/conteudos/*"
        element={
          <AdminShell>
            <AdminConteudos />
          </AdminShell>
        }
      />
    </Routes>
  );
}
