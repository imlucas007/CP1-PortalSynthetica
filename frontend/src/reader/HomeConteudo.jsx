import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import styles from "./HomeConteudo.module.css";

import pictograma1 from "../assets/home/pictograma-1.svg";
import pictograma2 from "../assets/home/pictograma-2.svg";
import pictograma3 from "../assets/home/pictograma-3.svg";
import pictograma4 from "../assets/home/pictograma-4.svg";
import pictograma5 from "../assets/home/pictograma-5.svg";
import pictograma6 from "../assets/home/pictograma-6.svg";
import featureIcon from "../assets/home/feature-icon.svg";

const PICTOGRAMAS = [pictograma1, pictograma2, pictograma3, pictograma4, pictograma5, pictograma6];

export default function HomeConteudo({ faceB = false, conteudos = [] }) {
  const navigate = useNavigate();
  const paleta = faceB
    ? { "--home-texto": "#21134e", "--home-apoio": "#6b5a46", "--home-sinal": "#b02a72" }
    : { "--home-texto": "#0b0b0e", "--home-apoio": "#595e70", "--home-sinal": "#595e70" };

  const listaResumo = conteudos.slice(0, 3);
  const capa = conteudos[3] ?? conteudos[0];

  return (
    <div className={styles.pagina} style={paleta}>
      <div className={`${glass.vidro} ${styles.masthead}`}>
        <div className={glass.vidroConteudo}>
          <button className={styles.wordmark} onClick={() => navigate("/sumario")}>
            SYNTHETICA
          </button>
          <button className={`mono ${styles.categorias}`} onClick={() => navigate("/sumario")}>
            AVANÇOS / CULTURA / ÉTICA / MEMÓRIA
          </button>
          <div className={styles.editorTag}>
            <span className="mono">EDITOR-CHEFE IA</span>
            <span className={styles.editorLegenda}>Edição fechada para Isa em 20 de agosto de 2047</span>
          </div>
        </div>
      </div>

      <div className={styles.grade}>
        <div className={`${glass.vidro} ${styles.gradePictogramas}`}>
          <div className={`${glass.vidroConteudo} ${styles.pictogramGrid}`}>
            {PICTOGRAMAS.map((src, i) => (
              <div key={i} className={styles.pictogramCelula}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className={`${glass.vidro} ${styles.sumarioCard}`}>
          <div className={glass.vidroConteudo}>
            {listaResumo.length === 0 && (
              <div className={styles.sumarioItem}>
                <p className={styles.sumarioSubtitulo}>Carregando sumário…</p>
              </div>
            )}
            {listaResumo.map((item, i) => (
              <button
                key={item.id}
                className={`${i > 0 ? glass.vidro : ""} ${styles.sumarioItem}`}
                onClick={() => navigate(`/leitura/${item.id}`)}
              >
                <div className={i > 0 ? glass.vidroConteudo : undefined}>
                  <p className={`mono ${styles.sumarioPagina}`}>
                    P. {String(item.pagina ?? "—").padStart(2, "0")}
                  </p>
                  <p className={styles.sumarioTitulo}>{item.titulo}</p>
                  <p className={styles.sumarioSubtitulo}>{item.chamada}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className={`${glass.vidro} ${styles.destaque}`}
          onClick={() => capa && navigate(`/leitura/${capa.id}`)}
          disabled={!capa}
        >
          <div className={glass.vidroConteudo}>
            <div className={`${glass.vidro} ${styles.destaqueImagem}`}>
              <div className={glass.vidroConteudo}>
                <img src={featureIcon} alt="" width={120} height={120} />
              </div>
            </div>
            <p className={`mono ${styles.destaqueRotulo}`}>MATÉRIA DE CAPA</p>
            <h2 className={styles.destaqueTitulo}>
              {capa?.titulo ?? "Carregando…"}
            </h2>
            <p className={styles.destaqueCorpo}>{capa?.chamada}</p>
            {capa && (
              <div className={`mono ${styles.destaquePorque}`}>
                POR QUE ESTA MATÉRIA: selecionada com base no seu histórico de leitura sobre IA e
                cultura visual.
              </div>
            )}
          </div>
        </button>
      </div>

      <div className={styles.destaquesBar}>
        <span className="mono">DESTAQUES *</span>
        <div className={styles.paginacao}>
          <span>01</span>
          <span className={styles.paginacaoAtiva}>02</span>
          <span>03</span>
          <span>04</span>
        </div>
      </div>
    </div>
  );
}
