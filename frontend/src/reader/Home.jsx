import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import HomeConteudo from "./HomeConteudo";
import { listarConteudos } from "../api/client";
import { lerPreferencias } from "../onboarding/preferencias";
import logo from "../assets/home/logo.svg";
import styles from "./Home.module.css";

const BARRAS = [6, 2, 4, 2, 8, 2, 2, 4, 6, 2, 4, 2, 2, 6, 2, 4, 2, 6, 2, 2, 4, 2, 6, 2, 2, 4, 6, 2, 2, 4, 2];

export default function Home() {
  const navigate = useNavigate();
  const preferencias = lerPreferencias();
  const [divisoria, setDivisoria] = useState(preferencias.proporcaoAvancos ?? 62);
  const [arrastando, setArrastando] = useState(false);
  const [conteudos, setConteudos] = useState([]);
  const cartaoRef = useRef(null);

  useEffect(() => {
    listarConteudos({ status: "publicado" }).then((itens) =>
      setConteudos([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)))
    );
  }, []);

  const calcularValor = useCallback((clientX) => {
    const cartao = cartaoRef.current;
    if (!cartao) return null;
    const { left, width } = cartao.getBoundingClientRect();
    const fracao = (clientX - left) / width;
    return Math.min(96, Math.max(4, Math.round(fracao * 100)));
  }, []);

  function mover(e) {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const novoValor = calcularValor(clientX);
    if (novoValor !== null) setDivisoria(novoValor);
  }

  function iniciarArraste(e) {
    setArrastando(true);
    mover(e);
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.topbar}>
        <button className={styles.marca} onClick={() => navigate("/home")}>
          <span className={styles.logoBadge}>
            <img src={logo} alt="" />
          </span>
          <div className="mono">
            <p>REVISTA</p>
            <p>SYNTHETICA</p>
          </div>
        </button>
        <nav className={styles.nav}>
          <button onClick={() => navigate("/sumario")}>PESQUISA</button>
          <button onClick={() => navigate("/sumario")}>REPORTAGENS</button>
          <button onClick={() => navigate("/sumario")}>ENSAIOS</button>
          <button onClick={() => navigate("/sumario")}>COLUNAS</button>
        </nav>
        <div className={styles.navDireita}>
          <button onClick={() => navigate("/")}>SOBRE</button>
          <button onClick={() => navigate("/sumario")}>EDIÇÕES</button>
          <button onClick={() => navigate("/checkout")}>APOIE</button>
          <button className={styles.buscar} onClick={() => navigate("/sumario")}>
            BUSCAR
          </button>
        </div>
      </div>

      <div className={styles.corpo}>
        <aside className={`${glass.vidro} ${styles.sidebar}`}>
          <div className={glass.vidroConteudo}>
            <div className={styles.blocoSidebar}>
              <Campo rotulo="EDIÇÃO" valor="#07" />
              <Campo rotulo="ANO" valor="02" />
              <Campo rotulo="DATA" valor="AGO 2047" />
              <Campo rotulo="DISTRIBUIÇÃO" valor="PERSONALIZADA" />
              <Campo rotulo="PERIODICIDADE" valor="POR LEITOR" />
            </div>
            <div className={styles.barcode}>
              <div className={styles.barras}>
                {BARRAS.map((largura, i) => (
                  <span key={i} style={{ width: `${largura}px`, height: `${18 + (i % 3) * 6}px` }} />
                ))}
              </div>
              <p className="mono">7 899999 070200</p>
            </div>
          </div>
        </aside>

        <div
          ref={cartaoRef}
          className={`${glass.vidro} ${styles.cartaoPrincipal}`}
          onMouseMove={(e) => arrastando && mover(e)}
          onMouseUp={() => setArrastando(false)}
          onMouseLeave={() => setArrastando(false)}
          onTouchMove={mover}
          onTouchEnd={() => setArrastando(false)}
        >
          <div className={`${glass.vidroConteudo} ${styles.camadaConteudo}`}>
            <HomeConteudo faceB={false} conteudos={conteudos} />
          </div>
          <div
            className={styles.camadaFaceB}
            style={{ clipPath: `inset(0 0 0 ${divisoria}%)` }}
          >
            <HomeConteudo faceB conteudos={conteudos} />
          </div>

          <div
            className={styles.agulha}
            style={{ left: `${divisoria}%` }}
            onMouseDown={iniciarArraste}
            onTouchStart={iniciarArraste}
          >
            <div className={styles.linha} />
            <div className={`mono ${styles.pega}`}>||</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ rotulo, valor }) {
  return (
    <div className={styles.campo}>
      <div className={styles.campoLinha} />
      <p className={`mono ${styles.campoRotulo}`}>{rotulo}</p>
      <p className={`mono ${styles.campoValor}`}>{valor}</p>
    </div>
  );
}
