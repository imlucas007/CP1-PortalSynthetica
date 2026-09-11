import { useEffect, useRef, useState } from "react";
import { resumirMateria } from "../api/revista";
import styles from "./ResumoIA.module.css";

export default function ResumoIA({ id }) {
  const [resumo, setResumo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const pedido = useRef(null);

  useEffect(() => () => pedido.current?.abort(), []);

  async function resumir() {
    if (pedido.current) return;
    if (resumo) { setAberto(!aberto); return; }
    const controller = new AbortController();
    pedido.current = controller;
    setCarregando(true);
    setErro("");
    setAberto(true);
    try {
      const resultado = await resumirMateria(id, controller.signal);
      if (!controller.signal.aborted) setResumo(resultado.resumo);
    } catch (e) {
      if (!controller.signal.aborted) setErro(e.message || "Não foi possível gerar o resumo.");
    } finally {
      if (!controller.signal.aborted) {
        pedido.current = null;
        setCarregando(false);
      }
    }
  }

  return (
    <section className={styles.painel} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className={`mono ${styles.botao}`} onClick={resumir}
        disabled={carregando} aria-expanded={aberto} aria-controls={`resumo-ia-${id}`}>
        {carregando ? "GERANDO RESUMO…" : resumo && aberto ? "OCULTAR RESUMO" : "RESUMIR COM IA ✦"}
      </button>
      <div id={`resumo-ia-${id}`} hidden={!aberto} aria-live="polite" aria-busy={carregando}>
        {carregando && <p>O Gemini está lendo esta matéria…</p>}
        {erro && <p role="alert">{erro}</p>}
        {resumo && <>
          <h2 className="mono">RESUMO SYNTHETICA</h2>
          <p>{resumo}</p>
          <small>Gerado com Gemini a partir desta matéria. Pode conter imprecisões; consulte o texto completo.</small>
        </>}
      </div>
    </section>
  );
}
