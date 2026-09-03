import { useState } from "react";
import AdminBar from "./components/AdminBar";
import ListaConteudos from "./pages/ListaConteudos";
import FormularioConteudo from "./pages/FormularioConteudo";

export default function App() {
  const [tela, setTela] = useState({ nome: "lista" });

  return (
    <div>
      <AdminBar />
      {tela.nome === "lista" && (
        <ListaConteudos
          onNovo={() => setTela({ nome: "form", id: null })}
          onEditar={(id) => setTela({ nome: "form", id })}
        />
      )}
      {tela.nome === "form" && (
        <FormularioConteudo
          conteudoId={tela.id}
          onVoltar={() => setTela({ nome: "lista" })}
          onSalvo={() => setTela({ nome: "lista" })}
        />
      )}
    </div>
  );
}
