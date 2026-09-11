import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gerarCuradoria } from "../api/revista";
import { lerPreferencias, TEMAS_DISPONIVEIS } from "../onboarding/preferencias";
import styles from "./CuradoriaIA.module.css";

export default function CuradoriaIA() {
  const [temas, setTemas] = useState(() => lerPreferencias().temas ?? []);
  const [proporcao, setProporcao] = useState(() => lerPreferencias().proporcaoAvancos ?? 62);
  const [quantidade, setQuantidade] = useState(3);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const pedido = useRef(null);
  useEffect(() => () => pedido.current?.abort(), []);

  function alterar(acao) { acao(); setResultado(null); setErro(""); }

  async function gerar(e) {
    e.preventDefault();
    if (pedido.current) return;
    const controller = new AbortController();
    pedido.current = controller;
    setCarregando(true); setErro(""); setResultado(null);
    try {
      const selecao = await gerarCuradoria({temas, proporcao_avancos: proporcao, quantidade}, controller.signal);
      if (!controller.signal.aborted) setResultado(selecao);
    } catch (err) {
      if (!controller.signal.aborted) setErro(err.message || "Não foi possível selecionar as matérias.");
    } finally {
      if (!controller.signal.aborted) { setCarregando(false); pedido.current = null; }
    }
  }

  return <section className={styles.painel} aria-labelledby="curadoria-titulo">
    <h2 id="curadoria-titulo">Sua seleção com IA</h2>
    <p>Escolha seus interesses. O Gemini recomenda matérias deste catálogo e explica cada escolha.</p>
    <form onSubmit={gerar}>
      <fieldset disabled={carregando}>
        <legend>Temas de interesse</legend>
        <div className={styles.temas}>{TEMAS_DISPONIVEIS.map((tema) =>
          <label key={tema}><input type="checkbox" checked={temas.includes(tema)}
            onChange={() => alterar(() => setTemas(temas.includes(tema) ? temas.filter((t) => t !== tema) : [...temas, tema]))} />{tema}</label>
        )}</div>
        <label className={styles.campo} htmlFor="curadoria-proporcao">
          Preferência: {proporcao}% avanços tecnológicos · {100 - proporcao}% arte e cultura
        </label>
        <input id="curadoria-proporcao" type="range" min="0" max="100" value={proporcao}
          onChange={(e) => alterar(() => setProporcao(Number(e.target.value)))} />
        <label className={styles.campo} htmlFor="curadoria-quantidade">Quantidade de matérias</label>
        <select id="curadoria-quantidade" value={quantidade} onChange={(e) => alterar(() => setQuantidade(Number(e.target.value)))}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <p className={styles.nota}>A seleção considera as matérias disponíveis; a proporção é uma preferência.</p>
        <button type="submit">{carregando ? "SELECIONANDO…" : "GERAR MINHA SELEÇÃO ✦"}</button>
      </fieldset>
    </form>
    <div aria-live="polite" aria-busy={carregando}>
      {carregando && <p>O Gemini está comparando seus interesses com o catálogo…</p>}
      {erro && <p role="alert">{erro}</p>}
      {resultado && <>
        <h3>Sua seleção · {resultado.length} matéria(s)</h3>
        <p className={styles.nota}>Recomendações e justificativas geradas com Gemini.</p>
        <ol className={styles.lista}>{resultado.map((c) => <li key={c.id}>
          <Link to={`/leitura/${c.id}`}>{c.titulo} →</Link>
          <p><strong>Por que esta matéria:</strong> {c.motivo}</p>
        </li>)}</ol>
        {resultado.length === 0 && <p>Nenhuma matéria disponível para recomendar.</p>}
      </>}
    </div>
  </section>;
}
