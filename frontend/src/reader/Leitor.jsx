import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { listarConteudos, obterConteudo } from "../api/client";
import luzHalo from "../assets/leitor/luz-halo.svg";
import marcador from "../assets/leitor/marcador.svg";
import styles from "./Leitor.module.css";

export default function Leitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conteudo, setConteudo] = useState(null);
  const [ordenados, setOrdenados] = useState([]);

  useEffect(() => {
    obterConteudo(id).then(setConteudo);
    listarConteudos({ status: "publicado" }).then((itens) => {
      setOrdenados([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)));
    });
  }, [id]);

  if (!conteudo) return <div className={styles.pagina} />;

  const indice = ordenados.findIndex((c) => c.id === Number(id));
  const total = ordenados.length;
  const progresso = total ? Math.round(((indice + 1) / total) * 100) : 0;
  const anterior = indice > 0 ? ordenados[indice - 1] : null;
  const proximo = indice >= 0 && indice < total - 1 ? ordenados[indice + 1] : null;

  const paragrafos = conteudo.corpo.split(/\n+/).filter(Boolean);
  const meio = Math.ceil(paragrafos.length / 2);
  const primeiraMetade = paragrafos.slice(0, meio);
  const segundaMetade = paragrafos.slice(meio);

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />

      <div className={`${glass.vidro} ${styles.barra}`}>
        <div className={glass.vidroConteudo}>
          <button className={`mono ${styles.voltar}`} onClick={() => navigate("/sumario")}>
            ← SUMÁRIO
          </button>
          <p className={`mono ${styles.marca}`}>SYNTHETICA · EDIÇÃO #07</p>
          <div className={styles.ferramentas}>
            <button className={`mono ${styles.ferramenta}`}>Aa</button>
            <button className={`mono ${styles.ferramenta}`}>SALVAR</button>
            <span className={`mono ${styles.paginas}`}>
              {indice >= 0 ? indice + 1 : "…"} / {total || "…"}
            </span>
          </div>
        </div>
      </div>

      {anterior && <div className={`${styles.espiada} ${styles.espiadaEsquerda}`} />}
      {proximo && <div className={`${styles.espiada} ${styles.espiadaDireita}`} />}

      <div className={`${glass.vidro} ${styles.spread}`}>
        <div className={`${glass.vidroConteudo} ${styles.spreadConteudo}`}>
          <div className={styles.pagEsquerda}>
            <p className={`mono ${styles.rotuloCapa}`}>
              MATÉRIA {conteudo.editoria.nome.toUpperCase()} · P. {conteudo.pagina ?? "—"}
            </p>
            <h1 className={styles.titulo}>{conteudo.titulo}</h1>
            <p className={`mono ${styles.autoria}`}>
              POR {conteudo.autor.nome.toUpperCase()} · {conteudo.tempo_leitura_min} MIN
            </p>
            <p className={styles.lead}>{conteudo.chamada}</p>
            {primeiraMetade.map((p, i) => (
              <p key={i} className={styles.corpo}>
                {p}
              </p>
            ))}
          </div>
          <div className={styles.vinco} />
          <div className={styles.pagDireita}>
            <div className={styles.gradienteAnimado} />
            <p className={`mono ${styles.figura}`}>Fig. 01 · Estudo de forma para esta matéria</p>
            {segundaMetade.map((p, i) => (
              <p key={i} className={styles.corpo}>
                {p}
              </p>
            ))}
            <div className={styles.justificativa}>
              <span className="mono">POR QUE ESTA MATÉRIA</span>
              <span className={`mono ${styles.justificativaTexto}`}>
                palavra-chave: {conteudo.palavra_chave}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${glass.vidro} ${styles.arraste}`}>
        <div className={glass.vidroConteudo}>
          <button
            className={styles.setaPagina}
            disabled={!anterior}
            onClick={() => anterior && navigate(`/leitura/${anterior.id}`)}
          >
            ←
          </button>
          <span className="mono">ARRASTE PARA VIRAR A PÁGINA</span>
          <button
            className={styles.setaPagina}
            disabled={!proximo}
            onClick={() => proximo && navigate(`/leitura/${proximo.id}`)}
          >
            →
          </button>
        </div>
      </div>

      <div className={styles.progresso}>
        <span className={`mono ${styles.progressoLabel}`}>
          P. {ordenados[0]?.pagina ?? "—"}
        </span>
        <div className={styles.progressoTrilho}>
          <div className={styles.progressoPercorrido} style={{ width: `${progresso}%` }} />
          <img src={marcador} alt="" className={styles.marcador} style={{ left: `${progresso}%` }} />
        </div>
        <span className={`mono ${styles.progressoLabel}`}>
          P. {ordenados[total - 1]?.pagina ?? "—"}
        </span>
      </div>
    </div>
  );
}
