import { Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./admin/AdminShell";
import Painel from "./pages/admin/Painel";
import AdminConteudos from "./pages/admin/AdminConteudos";
import Cartas from "./pages/admin/Cartas";
import FichaAssinatura from "./onboarding/FichaAssinatura";
import Cadastro from "./onboarding/Cadastro";
import Login from "./onboarding/Login";
import FichaAssinante from "./onboarding/FichaAssinante";
import Checkout from "./onboarding/Checkout";
import AssinaturaConfirmada from "./onboarding/AssinaturaConfirmada";
import CancelarAssinatura from "./onboarding/CancelarAssinatura";
import Home from "./reader/Home";
import Sumario from "./reader/Sumario";
import Leitor from "./reader/Leitor";

export default function App() {
  return (
    <Routes>
      {/* Portal público — em construção: por enquanto a raiz entra direto na
          ficha de assinatura. Quando a Home comercial (landing) estiver
          pronta, ela assume a rota "/". */}
      <Route path="/" element={<FichaAssinatura />} />
      <Route path="/assinatura" element={<FichaAssinatura />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/assinante" element={<FichaAssinante />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/assinatura-confirmada" element={<AssinaturaConfirmada />} />
      <Route path="/cancelar-assinatura" element={<CancelarAssinatura />} />
      <Route path="/home" element={<Home />} />
      <Route path="/sumario" element={<Sumario />} />
      <Route path="/leitura/:id" element={<Leitor />} />

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
