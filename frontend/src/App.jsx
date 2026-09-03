import { Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./admin/AdminShell";
import Painel from "./pages/admin/Painel";
import AdminConteudos from "./pages/admin/AdminConteudos";
import Cartas from "./pages/admin/Cartas";
import FichaAssinatura from "./onboarding/FichaAssinatura";

export default function App() {
  return (
    <Routes>
      {/* Portal público — em construção: por enquanto a raiz entra direto na
          ficha de assinatura. Quando a Home comercial (landing) estiver
          pronta, ela assume a rota "/". */}
      <Route path="/" element={<FichaAssinatura />} />
      <Route path="/assinatura" element={<FichaAssinatura />} />

      <Route path="/admin" element={<Navigate to="/admin/painel" replace />} />
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
      <Route
        path="/admin/cartas"
        element={
          <AdminShell>
            <Cartas />
          </AdminShell>
        }
      />
    </Routes>
  );
}
